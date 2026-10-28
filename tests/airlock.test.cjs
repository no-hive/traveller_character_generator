'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const A=require('../dist/airlock.js');
function harness({reduced=false,blocked=false,reject=false}={}){
 const attributes=new Map(blocked?[['data-desktop-blocked','']]:[]),timers=[],motions=[];
 function node(){return {attrs:new Map(),listeners:{},hidden:false,inert:false,disabled:false,setAttribute(k,v){this.attrs.set(k,v)},removeAttribute(k){this.attrs.delete(k)},addEventListener(k,fn){this.listeners[k]=fn},focus(){this.focused=true}}}
 const nodes=new Map(['airlock','airlock-enter','airlock-left','airlock-right','app','project-menu','stage'].map(id=>[id,node()]));
 for(const id of ['airlock-left','airlock-right'])nodes.get(id).animate=(frames,options)=>{motions.push({id,frames,options});return {finished:reject?Promise.reject(Error('cancelled')):Promise.resolve()}};
 const doc={getElementById:id=>nodes.get(id),documentElement:{setAttribute:(k,v)=>attributes.set(k,v),removeAttribute:k=>attributes.delete(k),hasAttribute:k=>attributes.has(k)},defaultView:{matchMedia:()=>({matches:reduced}),setTimeout:fn=>timers.push(fn)}};
 return {doc,nodes,timers,motions,attributes};
}
test('closed doors cover and lock the app; one activation opens both leaves and restores focus',async()=>{
 const h=harness(),ui=A.mount(h.doc);assert.equal(ui.state,'closed');assert.equal(h.nodes.get('app').inert,true);assert.equal(h.nodes.get('project-menu').inert,true);assert.equal(h.nodes.get('airlock-enter').focused,true);
 ui.enter();ui.enter();assert.equal(h.timers.length,1);assert.equal(ui.state,'unlocking');assert.equal(h.nodes.get('airlock-enter').disabled,true);
 h.timers.shift()();assert.equal(ui.state,'opening');assert.equal(h.nodes.get('app').inert,true);assert.equal(h.motions.length,2);
 assert.equal(h.motions[0].frames[1].transform,'translateX(-102%)');assert.equal(h.motions[1].frames[1].transform,'translateX(102%)');
 await new Promise(resolve=>setImmediate(resolve));assert.equal(ui.state,'open');assert.equal(h.nodes.get('airlock').hidden,true);assert.equal(h.nodes.get('app').inert,false);assert.equal(h.nodes.get('project-menu').inert,false);assert.equal(h.attributes.has('data-airlock'),false);assert.equal(h.nodes.get('stage').focused,true);
});
test('reduced motion enters immediately; each page load starts with closed doors',()=>{
 const h=harness({reduced:true}),ui=A.mount(h.doc);ui.enter();assert.equal(ui.state,'open');assert.equal(h.timers.length,0);assert.equal(h.motions.length,0);const next=A.mount(h.doc);assert.equal(next.state,'closed');assert.equal(h.nodes.get('app').inert,true);
});
test('mobile support gate takes priority and the airlock cannot be entered',()=>{
 const h=harness({blocked:true}),ui=A.mount(h.doc);ui.enter();assert.equal(ui.state,'closed');assert.equal(h.timers.length,0);assert.equal(h.nodes.get('airlock-enter').focused,undefined);
});
test('an interrupted animation cannot trap the app behind the doors',async()=>{
 const h=harness({reject:true}),ui=A.mount(h.doc);ui.enter();h.timers.shift()();await new Promise(resolve=>setImmediate(resolve));assert.equal(ui.state,'open');assert.equal(h.nodes.get('app').inert,false);
});
test('door details are deterministic vector geometry without external assets',()=>{
 const left=A.doorDetails('left'),right=A.doorDetails('right');assert.equal(left,A.doorDetails('left'));assert.match(left,/<svg /);assert.match(left,/hull-left/);assert.match(right,/hull-right/);assert.ok((left.match(/<path /g)||[]).length>70);assert.doesNotMatch(left,/<image|<script|href=|https:\/\//);
});
