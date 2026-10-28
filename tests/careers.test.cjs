'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../dist/careers.js');

test('catalogue exposes Scout and Navy career profiles',()=>{
  assert.deepEqual(Object.keys(C.careers),['scout','navy','army','marines','drifter','agent','merchant','scholar','citizen','entertainer','noble','rogue','psion']);
  assert.equal(C.get('missing'),null);
  assert.equal(C.get('navy').source,'pp. 24–25');
});

test('Navy entry, commission and assignment checks match the 2008 Core Rules',()=>{
  const n=C.get('navy');
  assert.deepEqual(n.entry,{name:'Enlistment',attribute:3,target:6,agePenalty:{minimum:34,value:-2}});
  assert.deepEqual(n.commission,{attribute:5,target:8});
  assert.deepEqual(Object.fromEntries(Object.entries(n.assignments).map(([id,a])=>[id,[a.survival.attribute,a.survival.target,a.advancement.attribute,a.advancement.target]])),{
    line:[3,5,4,7],engineering:[3,6,4,6],flight:[1,7,4,5]
  });
});

test('Navy has complete six-row training, rank and benefit tables',()=>{
  const n=C.get('navy');
  for(const id of ['personal','service','education','officer','line','engineering','flight'])assert.equal(n.tables[id].length,6,id);
  assert.equal(n.ranks.enlisted.length,7);
  assert.equal(n.ranks.officer.length,7);
  assert.deepEqual(n.benefits.cash,[1000,5000,5000,10000,20000,50000,50000]);
  assert.equal(n.benefits.other.length,7);
});

test('Scout catalogue remains equivalent to the current engine profile',()=>{
  const s=C.get('scout');
  assert.deepEqual(Object.keys(s.assignments),['courier','survey','explore']);
  assert.deepEqual(Object.values(s.assignments).map(a=>[a.survival.target,a.advancement.target]),[[5,9],[6,8],[7,7]]);
  for(const id of ['personal','service','education','courier','survey','explore'])assert.equal(s.tables[id].length,6,id);
});
