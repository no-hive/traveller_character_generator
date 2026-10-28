'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js'),S=require('../dist/scenes.js'),W=require('../dist/world-engine.js');
function fourthFaction(){const m=S.createSession(E.create('faction-four'));m.commit('configure',{method:'random'});Object.assign(m.game.world,{mode:'standard',orbit:'cold',size:10,atmosphere:7,temperature:2,temperatureType:'Frozen',hydrographics:3,population:10,government:8,law:6,starport:'A',tech:12,culture:'Progressive',factionCount:4,factionIndex:3,factions:[{government:1,strength:8},{government:4,strength:6},{government:8,strength:7},{government:7,strength:null}],step:'faction-strength-3'});return m}
test('the actual UI creation path no longer injects the legacy Aurora world',()=>{
 const m=S.createSession(E.create('initial-ui'));assert.equal(m.game.homeworld,null);m.commit('configure',{method:'random'});assert.equal(m.game.homeworld,null);
});
test('fourth faction strength advances to a usable world review and name confirmation',()=>{
 const m=fourthFaction();m.commit('roll',undefined,{},()=>4);m.commit('next');assert.equal(m.game.phase,'worldreview');assert.equal(m.game.world.factions.length,4);assert.equal(m.game.world.complete,true);
 assert.match(S.card(m.game,m.ui),/world-name/);assert.doesNotThrow(()=>S.sheet(m.game));m.commit('worldconfirm','Vesper');assert.equal(m.game.homeworld.name,'Vesper');assert.equal(m.game.homeworld.factions[3].strength,8);
});
test('a saved world review with the old Aurora placeholder resumes without restarting',()=>{
 const m=fourthFaction();m.commit('roll',undefined,{},()=>4);m.commit('next');const saved=m.pack();saved.game.homeworld={id:'aurora',name:'Aurora'};saved.game.currentLocation={id:'aurora',name:'Aurora'};
 const restored=S.createSession(E.restore(JSON.stringify(saved.game)),saved.sceneUI);assert.equal(restored.game.homeworld,null);assert.match(S.card(restored.game,restored.ui),/world-name/);assert.equal(restored.game.world.factions.length,4);
});
test('default Nivara is complete, frozen, enormous, highly populated and independently created',()=>{
 const a=W.defaultWorld(),b=W.defaultWorld();assert.equal(a.name,'Nivara');assert.equal(a.size,10);assert.equal(a.temperatureType,'Frozen');assert.equal(a.population,10);assert.equal(a.uwp,'AA73A86-C');assert.equal(a.complete,true);assert.match(a.description,/megacities/);a.factions[0].strength=1;assert.notEqual(b.factions[0].strength,1);
});
test('skipping world creation preserves selected rules without rolling or granting skills',()=>{
 const m=S.createSession(E.create('default'));m.commit('world-default',{method:'choose',solo:true,ironMan:true},{},()=>{throw Error('No dice expected')});assert.equal(m.game.phase,'world');assert.equal(m.game.homeworld.name,'Nivara');assert.deepEqual(m.game.rules,{method:'choose',solo:true,ironMan:true});assert.equal(m.game.rolls.length,0);assert.deepEqual(m.game.skills,{});assert.equal(E.restore(E.serialize(m.game)).homeworld.temperatureType,'Frozen');assert.match(S.card(m.game,m.ui),/Nivara/);
});
test('skip works midway through a saved world roll but is unavailable after character creation',()=>{
 const m=S.createSession(E.create('midworld'));m.commit('configure',{method:'random'});m.select('standard');m.commit('confirm-choice');m.commit('roll',undefined,{},()=>4);m.commit('world-default');assert.equal(m.game.currentRoll,null);assert.equal(m.game.homeworld.name,'Nivara');assert.equal(m.game.rolls.length,1);assert.throws(()=>m.commit('world-default'),/before character creation/);
});
test('preset worlds follow normal character creation and Background Skill rules',()=>{
 const m=S.createSession(E.create('preset-skills'));m.commit('world-default',{method:'random'});m.commit('name','Avery');m.commit('next');for(let i=0;i<6;i++)m.commit('rollstat',undefined,{},()=>4);m.commit('next');assert.equal(m.game.phase,'homeworldskill');assert.deepEqual(new Set(E.choices(m.game).map(o=>o.id)),new Set(W.defaultWorld().homeworldSkills));
 const html=S.workbench(m.game,m.ui);assert.doesNotMatch(html,/data-command="world-default"/);
});
test('the preset also supports Point Allocation and validates incompatible rules atomically',()=>{
 const m=S.createSession(E.create('preset-points')),before=E.serialize(m.game);assert.throws(()=>m.commit('world-default',{method:'pointbuy',ironMan:true}));assert.equal(E.serialize(m.game),before);
 m.commit('world-default',{method:'pointbuy',solo:true});m.commit('name','Avery');m.commit('next');assert.equal(m.game.phase,'pointbuy');assert.equal(m.game.homeworld.name,'Nivara');assert.equal(m.game.rules.solo,true);
});
test('characteristic rolls retain every result without growing the visible dice list',()=>{
 const m=S.createSession(E.create('compact-stat-rolls'));m.commit('world-default',{method:'random'});m.commit('name','Avery');m.commit('next');
 for(let i=0;i<6;i++)m.commit('rollstat',undefined,{},()=>i+1);
 const html=S.workbench(m.game,m.ui);assert.equal(m.game.statRolls.length,6);assert.equal((html.match(/class="recorded-roll"/g)||[]).length,1);assert.match(html,/stat-roll-summary/);for(const raw of [2,4,6,8,10,12])assert.ok(html.includes('<strong>'+raw+'</strong>'));
});
