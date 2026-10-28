'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {revealCurrentBlock}=require('../dist/scenes.js');
function harness(rect,selector='.recorded-roll',reduce=false){
 const calls=[],pending=[],target={getBoundingClientRect:()=>rect};
 const stage={getBoundingClientRect:()=>rect,querySelector:s=>s===selector?target:null};
 const bench={querySelector:s=>s===selector?target:null};
 const nav={getBoundingClientRect:()=>({bottom:58})};
 return {calls,pending,doc:{getElementById:id=>id==='stage'?stage:id==='project-menu'?nav:bench},win:{innerHeight:900,scrollBy:o=>calls.push(o),requestAnimationFrame:fn=>pending.push(fn),matchMedia:()=>({matches:reduce})}};
}
test('already visible results and tall visible scenes never move the viewport',()=>{
 for(const rect of [{top:200,bottom:400,height:200},{top:100,bottom:1600,height:1500}]){const h=harness(rect);revealCurrentBlock(h.doc,h.win,{currentRoll:{}},{});h.pending.shift()();assert.equal(h.calls.length,0);}
});
test('off-screen results scroll only the minimum distance after layout',()=>{
 const h=harness({top:850,bottom:990,height:140});revealCurrentBlock(h.doc,h.win,{currentRoll:{}},{});assert.equal(h.calls.length,0);h.pending.shift()();assert.deepEqual(h.calls,[{top:114,behavior:'smooth'}]);
});
test('content above navigation is revealed without hiding it behind the fixed menu',()=>{
 const h=harness({top:20,bottom:220,height:200},'.outcome',true);revealCurrentBlock(h.doc,h.win,{}, {receipt:{}});h.pending.shift()();assert.deepEqual(h.calls,[{top:-54,behavior:'auto'}]);
});
