'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js'),UI=require('../dist/minimal.js');
const act=(s,type,value,extra={})=>E.dispatch(s,{type,value,revision:s.revision,...extra},()=>6);

function active(phase='age'){
  const s=E.create('multi-model');
  Object.assign(s,{name:'Alex',phase,age:18,term:1,rank:2,completed:0,assignment:'explore',stats:[8,9,8,10,8,7],enlisted:true,trained:true,skills:{Разведка:1},context:{event:8},status:'active'});
  return s;
}

test('new characters start with character-wide counters and one independent Scout record',()=>{
  const s=E.create('new-model');
  assert.equal(s.version,3);
  assert.equal(s.totalTerms,0);
  assert.equal(s.cashRollsUsed,0);
  assert.deepEqual(s.careerHistory,[]);
  assert.equal(s.activeCareer.careerId,'scout');
  assert.equal(s.activeCareer.rankTrack,'standard');
  assert.deepEqual(s.lifeHistory,[]);
});

test('finishing a term records a reload-safe structured Life History entry',()=>{
  let s=act(active(),'next');
  assert.equal(s.age,22);
  assert.equal(s.totalTerms,1);
  assert.equal(s.completed,1);
  assert.equal(s.lifeHistory.length,1);
  assert.deepEqual(s.lifeHistory[0],{
    id:'career1-term1',careerId:'scout',careerNumber:1,termInCareer:1,totalTerm:1,
    ageStart:18,ageEnd:22,assignmentId:'explore',rankTrack:'standard',rankAtEnd:2,
    event:8,outcome:'completed',exitReason:null,eligibleBenefit:true
  });
  s=E.restore(E.serialize(s));
  assert.equal(s.lifeHistory.length,1);
  assert.equal(s.activeCareer.completedTerms,1);
  assert.match(UI.historyView(s),/Life History · 1 term/);
  for(const text of ['18–22','Scout · Exploration','Event 8','Rank 2','Counts toward Benefits'])assert.ok(UI.historyView(s).includes(text),text);
});

test('failed Survival creates a non-eligible term without losing its career context',()=>{
  const s=active();
  s.failedSurvival=true;
  s.exitReason='Провал проверки выживания.';
  const after=act(s,'next');
  assert.equal(after.lifeHistory[0].outcome,'survival-failure');
  assert.equal(after.lifeHistory[0].eligibleBenefit,false);
  assert.equal(after.activeCareer.failedSurvival,true);
  assert.match(UI.historyView(after),/Failed Survival · career departure/);
  assert.match(UI.historyView(after),/No Benefit roll for this term/);
});

test('version-2 saves migrate once into structured Scout history',()=>{
  const old=active('decision');
  old.version=2;old.profile='mongoose-2008-ru-career-v2';old.age=26;old.term=2;old.completed=2;
  old.journal=[{id:'j1',age:18,text:'Назначение: Исследование.',source:'с. 32',kind:'effect'},{id:'j2',age:22,text:'Назначение: Курьер.',source:'с. 32',kind:'effect'}];
  for(const key of ['totalTerms','cashRollsUsed','careerHistory','activeCareer','lifeHistory'])delete old[key];
  const migrated=E.restore(JSON.stringify(old));
  assert.equal(migrated.version,3);
  assert.equal(migrated.totalTerms,2);
  assert.deepEqual(migrated.lifeHistory.map(t=>t.assignmentId),['explore','courier']);
  assert.equal(migrated.activeCareer.completedTerms,2);
  assert.deepEqual(E.restore(E.serialize(migrated)),migrated);
});

test('malformed career and life history data is rejected',()=>{
  const bad=E.create('bad-careers');bad.lifeHistory=[{id:'x',careerId:'scout',totalTerm:1,ageStart:18,ageEnd:99}];
  assert.throws(()=>E.restore(JSON.stringify(bad)),/лента жизни/);
  const badCareer=E.create('bad-active');badCareer.activeCareer.careerId='pirate';
  assert.throws(()=>E.restore(JSON.stringify(badCareer)),/текущая карьера/);
});
