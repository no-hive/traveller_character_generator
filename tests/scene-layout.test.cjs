'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js'),S=require('../dist/scenes.js');
function rescue(){const g=E.create('scene-layout');Object.assign(g,{name:'Alex',phase:'eventchoice',stats:[8,9,8,10,8,7],assignment:'explore',enlisted:true,trained:true,skills:{Медик:1},context:{event:9}});return g}
test('event media and narrative share a row while action cards follow outside it',()=>{
 const m=S.createSession(rescue()),html=S.card(m.game,m.ui);
 assert.match(html,/scene-intro has-illustration/);
 assert.ok(html.indexOf('scene-media')<html.indexOf('scene-copy'));
 assert.ok(html.indexOf('scene-copy')<html.indexOf('event-decisions'));
 assert.match(html,/<\/div><\/div><\/div><section class="event-decisions"/);
});
test('text-only Life events never reserve an illustration column',()=>{
 let g=rescue();g.phase='life';let i=0;g=E.dispatch(g,{type:'roll',revision:g.revision},()=>[5,6][i++]);g=E.dispatch(g,{type:'next',revision:g.revision});const html=S.card(g,{});
 assert.doesNotMatch(html,/has-illustration|scene-media|<img/);assert.match(html,/scene-copy/);
});
test('rolled event results keep narrative separate from result and next action',()=>{
 const m=S.createSession(rescue());m.select('medic');m.commit('roll',undefined,{},()=>6);m.commit('next');
 const html=S.card(m.game,m.ui);assert.ok(html.indexOf('scene-copy')<html.indexOf('class="outcome'));assert.ok(html.indexOf('class="outcome')<html.indexOf('data-bench="receipt"'));
});
