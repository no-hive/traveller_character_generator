const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js'),S=require('../dist/scenes.js'),M=require('../dist/project-menu.js'),C=require('../dist/careers.js');
const X=E.ADDITIONAL_EVENTS;
function ready(e){const s=E.create('extra-'+e.id);Object.assign(s,{name:'Avery',phase:'event',stats:[9,9,9,9,10,10],activeCareer:{...s.activeCareer,careerId:e.career},assignment:Object.keys(C.get(e.career).assignments)[0],skills:{},enlisted:true,trained:true,context:{}});return s}
const act=(s,type,value,die=6)=>E.dispatch(s,{type,value,revision:s.revision},()=>die);
function rolled(e,variant=1){let i=0;const dice=[Math.floor(e.number/2),Math.ceil(e.number/2),variant];const s=ready(e);return E.dispatch(s,{type:'roll',revision:s.revision},()=>dice[i++])}
function settle(s){for(let i=0;i<8&&['reward','rankaward'].includes(s.phase);i++)s=act(s,'select',E.choices(s)[0].id);return s}
function verifyEffects(s,effects){for(const e of effects||[]){if(e.type==='relation')assert.ok(s.relations.some(r=>r.type===e.kind),e.kind);if(e.type==='modifier')assert.ok(s.modifiers.some(m=>m.scope===e.scope&&m.value===e.value&&m.label===e.label),e.label);if(e.type==='reward')assert.ok(Object.entries(s.skills).some(([k,v])=>(k===e.name||k.startsWith(e.name+' ('))&&v>=e.level),e.name);if(e.type==='injury')assert.equal(s.phase,'injuryroll');}}
test('all eight additional events retain their story, roll and artwork after reload; originals remain available',()=>{
 assert.equal(X.events.length,8);
 for(const e of X.events){let s=rolled(e);assert.equal(s.currentRoll.raw,e.number);assert.equal(s.rolls.length,2);assert.equal(s.rolls[1].raw,1);assert.equal(X.selected(s).id,e.id);assert.equal(S.presentation(s).title,e.title);assert.equal(S.artFor(s),e.art);assert.match(S.presentation(s).content,/Additional career event/);assert.throws(()=>act(s,'roll'));s=E.restore(E.serialize(s));assert.equal(X.selected(s).id,e.id);assert.equal(S.presentation(s).title,e.title);
 s=act(s,'next');assert.equal(s.phase,'eventchoice');assert.equal(S.artFor(s),e.art);assert.equal(S.presentation(s).title,e.title);
 const base=rolled(e,6);assert.equal(X.selected(base),null);assert.equal(base.currentRoll.raw,e.number);assert.equal(S.artFor(base),S.CAREER_EVENT_ART[e.career][e.number]);
 }
});
test('each new choice applies its listed success and failure effects and reaches career progression or Injury',()=>{
 for(const e of X.events)for(const option of e.choices)for(const success of option.skill?[true,false]:[true]){
 let s=act(rolled(e),'next');s=act(s,'select',option.id);if(option.skill){assert.equal(s.phase,'eventcheck');assert.equal(S.presentation(s).title,e.title);s=E.restore(E.serialize(s));s=act(s,'roll',undefined,success?6:1);assert.equal(s.currentRoll.success,success);s=act(s,'next');}s=settle(s);
 const effects=option.skill?(success?option.success:option.failure).effects:option.effects;verifyEffects(s,effects);
 assert.ok(['advancement','promotionchoice','injuryroll'].includes(s.phase),e.id+' '+s.phase);assert.equal(s.exitReason,null);assert.equal(s.rank,0);assert.ok(s.journal.some(j=>JSON.stringify(j).includes('Additional event: '+e.title)));
 }
});
test('primitive-world Injury preserves the term, uses medical artwork and returns to Advancement',()=>{
 const e=X.events.find(e=>e.id==='primitive-assault');let s=act(rolled(e),'next');s=act(s,'select','assault-tactics');s=act(s,'roll',undefined,1);s=act(s,'next');assert.equal(s.context.injuryAfter,'advancement');assert.equal(S.artFor(s),'medical-treatment');s=act(s,'roll');s=act(s,'next');if(s.phase==='injurychoice')s=act(s,'select',E.choices(s)[0].id);if(s.phase==='treatment')s=act(s,'select','none');assert.equal(s.phase,'promotionchoice');assert.equal(s.exitReason,null);
});
test('supplementary events preserve Life and rare end results; all supplied artwork has a placement',()=>{
 for(const c of Object.keys(C.careers))for(const n of [2,7,12])assert.equal(X.forSlot(c,n),null);
 for(let n=2;n<=12;n++){const s=ready(X.events[0]);s.phase='life';s.currentRoll={raw:n};s.context.eventVariant='storm-survey';assert.equal(S.artFor(s),'none');}
 assert.equal(M.items().length,101);assert.ok(M.items().every(x=>x.used));assert.deepEqual(M.missingItems(),[]);
 for(const n of [1,2,7,8])assert.equal(M.items().find(x=>x.order===n).placements.filter(x=>x.includes('additional:')).length,2);
});
