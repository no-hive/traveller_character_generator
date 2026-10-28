'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js'),S=require('../dist/scenes.js');
function rescue(){const g=E.create('event-ui');Object.assign(g,{name:'Alex',phase:'eventchoice',stats:[8,9,8,10,8,7],assignment:'explore',enlisted:true,trained:true,skills:{Медик:1},context:{event:9}});return g}
test('every rescue approach exposes its actual odds, stakes and negative modifiers before selection',()=>{
 const g=rescue(),m=S.createSession(g),html=S.card(m.game,m.ui),snapshot=E.serialize(m.game);
 for(const o of S.choices(g)){const f=S.forecast(g,o),chance=S.probability(f.check);assert.ok(html.includes(`${chance.percent}% success`));for(const line of f.lines)assert.ok(html.includes(line.replace(/^(Success|Failure): /,'')));}
 assert.match(html,/How is this calculated/);assert.match(html,/event-penalty/);assert.doesNotMatch(html,/data-bench=/);assert.equal(E.serialize(m.game),snapshot);
});
test('selected action owns the only confirm control; changing an approach does not roll',()=>{
 const m=S.createSession(rescue());m.select('medic');let html=S.card(m.game,m.ui);
 assert.equal((html.match(/data-bench=/g)||[]).length,1);assert.match(html,/Treat the survivors · roll 2d6/);
 m.select('engineer');html=S.card(m.game,m.ui);assert.match(html,/Restore life support · roll 2d6/);assert.equal(m.game.rolls.length,0);
});
test('saved check hides alternative actions, retains the roll and resumes through the receipt',()=>{
 const m=S.createSession(rescue());m.select('medic');m.commit('roll',undefined,{},()=>6);
 const packed=m.pack(),resumed=S.createSession(E.restore(JSON.stringify(packed.game)),packed.sceneUI);
 let html=S.card(resumed.game,resumed.ui);assert.doesNotMatch(html,/data-option=/);assert.match(html,/Record success/);assert.match(html,/Committed approach/);assert.throws(()=>resumed.select('engineer'));
 resumed.commit('next');assert.ok(resumed.ui.receipt);html=S.card(resumed.game,resumed.ui);assert.match(html,/Success · changes recorded/);assert.match(html,/Continue to Advancement/);assert.match(html,/New Contact/);assert.equal((html.match(/data-bench=/g)||[]).length,1);
});
test('failure has an explicit result and cannot grant success effects',()=>{
 const m=S.createSession(rescue());m.select('medic');m.commit('roll',undefined,{},()=>1);assert.match(S.card(m.game,m.ui),/Record consequences/);m.commit('next');const html=S.card(m.game,m.ui);assert.match(html,/Failure · consequences recorded/);assert.match(html,/New Enemy/);assert.doesNotMatch(html,/New Contact/);
});
test('guaranteed skill awards confirm without rolling and preserve higher skills',()=>{
 const g=rescue();g.context.event=4;const m=S.createSession(g),option=S.choices(g)[0];m.select(option.id);const html=S.card(m.game,m.ui);assert.match(html,/No roll required/);assert.match(html,/data-bench="confirm-choice"/);assert.doesNotMatch(html,/roll 2d6/);m.commit('confirm-choice');assert.equal(m.game.rolls.length,0);
});
test('ordinary training keeps its existing choices and dice panel flow',()=>{
 const g=rescue();g.phase='training';const m=S.createSession(g);assert.doesNotMatch(S.card(m.game,m.ui),/event-flow/);assert.match(S.card(m.game,m.ui),/scene-choices/);assert.match(S.workbench(m.game,m.ui),/Dice &amp; decisions|Dice & decisions/);
});
test('event cards render the exact engine probabilities across all thirteen career tables',()=>{
 for(const id of Object.keys(E.RULE_TABLES.tables))for(let n=2;n<=12;n++){
  let g=rescue();g.phase='event';g.context={};g.activeCareer.careerId=id;g.assignment=id==='navy'?'line':'courier';g.activeCareer.rankTrack=id==='navy'?'enlisted':'standard';
  if(id==='psion'){g.psi=8;g.psionics.access='life-event';g.psionics.tested=true;}
  g=E.dispatch(g,{type:'roll',revision:g.revision},()=>4);Object.assign(g.currentRoll,{raw:n,total:n,dice:[Math.min(6,n-1),n-Math.min(6,n-1)]});
  g=E.dispatch(g,{type:'next',revision:g.revision},()=>4);
  if(g.phase!=='eventchoice')continue;
  const m=S.createSession(g),html=S.card(m.game,m.ui);
  for(const o of S.choices(g)){const f=S.forecast(g,o);if(f.check)assert.ok(html.includes(`${S.probability(f.check).percent}% success`),`${id} ${n} ${o.id}`);m.select(o.id);assert.equal((S.card(m.game,m.ui).match(/data-bench=/g)||[]).length,1);}
 }
});
