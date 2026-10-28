'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const D=require('../dist/desktop-support.js');
function environment(width,navigator={}){return {navigator,matchMedia:()=>({matches:width<1024})}}
test('desktop requires at least 1024 px without blocking touch-enabled desktop computers',()=>{
 assert.equal(D.isBlocked(environment(1023)),true);assert.equal(D.isBlocked(environment(1024)),false);
 assert.equal(D.isBlocked(environment(1440,{platform:'Win32',maxTouchPoints:10})),false);
});
test('phones and tablets remain blocked in landscape and desktop-sized viewports',()=>{
 for(const navigator of [{userAgent:'iPhone'},{userAgent:'Android tablet'},{userAgent:'iPad'},{userAgentData:{mobile:true}},{platform:'MacIntel',maxTouchPoints:5}])assert.equal(D.isBlocked(environment(1366,navigator)),true);
 assert.equal(D.isBlocked(environment(1366,{platform:'MacIntel',maxTouchPoints:0})),false);
});
test('resizing switches between warning and app without touching saved progress',()=>{
 let width=800,change,closed=0;const attributes=new Map();
 const app={setAttribute:(k,v)=>attributes.set(k,v),removeAttribute:k=>attributes.delete(k)},notice={hidden:true};
 const win={navigator:{},matchMedia:()=>({get matches(){return width<1024},addEventListener:(_,fn)=>change=fn})};
 const doc={defaultView:win,documentElement:{toggleAttribute:(k,v)=>attributes.set(k,v)},getElementById:id=>id==='app'?app:notice,querySelectorAll:()=>width<1024?[{close(){closed++}}]:[]};
 D.mount(doc);assert.equal(app.inert,true);assert.equal(notice.hidden,false);assert.equal(closed,1);assert.equal(attributes.get('aria-hidden'),'true');
 width=1440;change();assert.equal(app.inert,false);assert.equal(notice.hidden,true);assert.equal(attributes.has('aria-hidden'),false);assert.equal(attributes.get('data-desktop-blocked'),false);
});
