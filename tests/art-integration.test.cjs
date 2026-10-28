const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const E=require('../dist/engine.js'),S=require('../dist/scenes.js'),C=require('../dist/careers.js');
function ready(id,phase='event',n=4){const s=E.create('art-'+id);Object.assign(s,{name:'Avery',phase,stats:[9,9,9,9,10,10],activeCareer:{...s.activeCareer,careerId:id},assignment:Object.keys(C.get(id).assignments)[0],skills:{Механика:0},enlisted:true,trained:true,context:{event:n,ruleOrigin:'event'}});s.currentRoll=null;if(phase==='event'){let i=0;return E.dispatch(s,{type:'roll',revision:s.revision},()=>{const index=i++;return index===0?Math.floor(n/2):index===1?Math.ceil(n/2):6})}return s}
test('every configured scene resolves and all 101 original image names route through the root images folder',()=>{
 for(const maps of [S.CAREER_EVENT_ART,S.CAREER_MISHAP_ART])for(const map of Object.values(maps))for(const key of Object.values(map))assert.ok(S.ART[key],key);
 const files=new Set();for(const art of Object.values(S.ART)){if(art.src){assert.match(art.src,/^\.\.\/images\/t\d+\.(png|jpg)$/);assert.equal(art.file,art.src);files.add(art.src)}else assert.equal(art.file,null)}assert.equal(files.size,101);
});
test('the same die result selects the correct career subject and does not leak Scout discoveries',()=>{
 assert.equal(S.presentation(ready('scout','event',4)).asset,'alien-world');
 assert.equal(S.presentation(ready('entertainer','event',4)).asset,'high-society');
 assert.equal(S.presentation(ready('scholar','event',4)).asset,'research-lab');
 assert.equal(S.presentation(ready('merchant','event',4)).asset,'equipment-dealer');
 assert.equal(S.presentation(ready('scout','event',12)).asset,'valuable-discovery');
 assert.equal(S.presentation(ready('rogue','event',12)).asset,'heist-planning');
});
test('Marines fortress image survives event, check, award, result and session reload',()=>{
 const m=S.createSession(ready('marines','event',6));m.commit('next');
 assert.equal(S.presentation(m.game).asset,'fortress-assault');
 if(m.ui.receipt){assert.equal(m.ui.receipt.scene.asset,'fortress-assault');m.continueResult()}
 m.select(S.choices(m.game)[0].id);m.commit('roll',undefined,{},()=>6);
 assert.equal(S.presentation(m.game).asset,'fortress-assault');m.commit('next');
 assert.equal(S.presentation(m.game).asset,'fortress-assault');
 if(m.ui.receipt){assert.equal(m.ui.receipt.scene.asset,'fortress-assault');m.continueResult()}
 m.select(S.choices(m.game)[0].id);m.commit('confirm-choice');
 if(m.game.phase==='reward'){assert.equal(S.presentation(m.game).asset,'fortress-assault');m.select(S.choices(m.game)[0].id);m.commit('confirm-choice')}
 assert.equal(m.ui.receipt.scene.asset,'fortress-assault');
 const packed=JSON.parse(JSON.stringify(m.pack())),resumed=S.createSession(packed.game,packed.sceneUI);
 assert.match(S.card(resumed.game,resumed.ui),/..\/images\/t11.png/);
});
test('Life choices stay without artwork for death and birth; no portrait is rendered',()=>{
 const s=ready('scout','lifechoice');s.context.life=3;s.pending={options:[{id:'birth',label:'Birth'},{id:'death',label:'Death'}]};
 const m=S.createSession(s);assert.doesNotMatch(S.card(m.game,m.ui),/bereavement.png/);
 m.select('death');assert.doesNotMatch(S.card(m.game,m.ui),/scene-image|scene-placeholder/);
 m.select('birth');assert.doesNotMatch(S.card(m.game,m.ui),/bereavement.png/);
 assert.doesNotMatch(S.sheet(s),/avatar|portrait/);
});
test('Unusual artefact and Ancient technology remain distinct and injuries do not reuse event artwork',()=>{
 const s=ready('scout','unusual');s.currentRoll={raw:3};assert.equal(S.artFor(s),'alien-artefact');
 s.currentRoll.raw=6;assert.equal(S.artFor(s),'ancient-technology');
 s.phase='injurychoice';assert.equal(S.artFor(s),'medical-treatment');
});

test('Garden artwork follows the generated world and never replaces a barren world',()=>{
 const s=ready('scout','stats');s.homeworld={name:'Garden',tradeCodes:[{code:'Ga'}]};
 assert.equal(S.presentation(s).asset,'garden-homeworld');
 s.homeworld.tradeCodes=[{code:'De'}];assert.equal(S.presentation(s).asset,'aurora');
});
test('Scout rescue keeps the engineering illustration through a committed check and reload',()=>{
 const m=S.createSession(ready('scout','event',9));m.commit('next');
 m.select('engineer');assert.match(S.card(m.game,m.ui),/t38\.jpg/);
 m.commit('roll',undefined,{},()=>6);
 let p=JSON.parse(JSON.stringify(m.pack())),restored=S.createSession(p.game,p.sceneUI);
 assert.match(S.card(restored.game,restored.ui),/t38\.jpg/);
 restored.commit('next');assert.equal(restored.ui.receipt.scene.asset,'engineering-repairs');
});

test('user corrections keep art t18 and psionic training t17 out of crime and Ancient technology',()=>{
 assert.equal(S.CAREER_EVENT_ART.entertainer[5],'popular-work');
 assert.equal(S.ART['crime-victim'].src,null);assert.equal(S.ART['ancient-technology'].src,'../images/t5.png');
 const s=ready('psion','psitraining');assert.equal(S.presentation(s).asset,'psionic-training');
 s.phase='psichoice';assert.equal(S.presentation(s).asset,'psionic-test');
});

test('latest Scout and alien encounter corrections retain distinct subjects',()=>{
 assert.equal(S.CAREER_EVENT_ART.scout[6],'scout-pilot');
 assert.equal(S.ART['vehicle-training'].src,'../images/t40.jpg');
 const s=ready('scout','unusual');s.currentRoll={raw:2};assert.equal(S.artFor(s),'alien-contact');
 assert.equal(S.ART['alien-contact'].src,'../images/t50.jpg');
 assert.equal(S.ART['alien-world'].src,'../images/t42.jpg');
});

test('populated vacuum and ocean worlds use bases without assigning them to uninhabited worlds',()=>{
 const s=ready('scout','stats');s.homeworld={atmosphere:0,hydrographics:0,population:5};assert.equal(S.artFor(s),'vacuum-homeworld');
 s.homeworld.population=0;assert.equal(S.artFor(s),'aurora');
 s.homeworld={atmosphere:6,hydrographics:10,population:4};assert.equal(S.artFor(s),'ocean-homeworld');
 s.homeworld.atmosphere=12;assert.equal(S.artFor(s),'aurora');
});
test('civilian awards do not use military promotion artwork',()=>{
 assert.equal(S.presentation(ready('army','event',12)).asset,'military-promotion');
 assert.equal(S.presentation(ready('scholar','event',5)).asset,'exemplary-service');
});

test('requested reassignments use inheritance, amnesia, planetary assault and fortress artwork',()=>{
 for(const [key,file]of [['inheritance','t6.png'],['missing-memories','t9.png'],['planetary-assault','t2.png'],['fortress-assault','t11.png']])assert.equal(S.ART[key].src,'../images/'+file);
 assert.equal(S.presentation(ready('noble','event',5)).asset,'inheritance');
 assert.equal(S.presentation(ready('marines','event',8)).asset,'planetary-drop');
 assert.equal(S.presentation(ready('marines','event',6)).asset,'fortress-assault');
 assert.equal(S.ART['life-on-edge'].src,'../images/t74.png');assert.equal(S.ART['ground-war'].src,'../images/t73.png');
});
test('shared E7 and general screens render neither artwork nor illustration placeholders',()=>{
 const noArt=html=>assert.doesNotMatch(html,/scene-image|scene-placeholder/);
 for(const c of Object.keys(S.CAREER_EVENT_ART))noArt(S.card(ready(c,'event',7),{}));
 noArt(S.card(ready('scout','life'),{}));
 for(const phase of ['connections','campaignpack','packallocation','pointbuy']){
  const g=ready('scout',phase);g.finishing={connections:[],allocations:[],pack:'traveller'};
  if(phase==='packallocation')continue;
  if(phase==='pointbuy'){g.pointbuy={terms:1,career:'scout',assignment:'explore',stats:[7,7,7,7,7,7],skills:{},rank:0,benefits:0,officer:false}}
  noArt(S.card(g,{}));
 }
});

test('all Life results intentionally omit images and Entertainer assignments follow the correction',()=>{
 for(let n=2;n<=12;n++){const g=ready('scout','life');g.currentRoll={raw:n,total:n,dice:[Math.floor(n/2),Math.ceil(n/2)]};assert.equal(S.artFor(g),'none');assert.doesNotMatch(S.card(g,{}),/scene-image|scene-placeholder/)}
 assert.equal(S.CAREER_EVENT_ART.entertainer[3],'popular-work');assert.equal(S.CAREER_EVENT_ART.entertainer[10],'art-exhibition');
});

test('new batch fills empty events and uses the universal drop illustration from the main card',()=>{
 const expected=[['army',10,'peacekeeping'],['army',6,'ground-war'],['army',4,'war-torn-city'],['marines',9,'command-failure'],['psion',8,'psionic-practice'],['psion',12,'psionic-practice'],['drifter',11,'draft'],['drifter',5,'scavenging'],['citizen',3,'revolution'],['citizen',4,'heavy-machinery'],['scholar',3,'research-ethics'],['drifter',3,'patron-offer']];
 for(const[c,n,key]of expected){const g=ready(c,'event',n);assert.equal(S.artFor(g),key);assert.ok(S.ART[key].src)}
 assert.equal(S.artFor(ready('marines','event',8)),'planetary-drop');assert.equal(S.ART['planetary-assault'].src,'../images/t2.png');
 const g=ready('marines','eventchoice',8);assert.equal(S.artFor(g),'planetary-drop');
 assert.equal(S.ART['experimental-subject'].src,'../images/t79.png');
});

test('existing images cover combat, legal scenes, psi influence and Ancient technology; discoveries have distinct artwork',()=>{
 for(const [key,src]of [['space-battle','t41.jpg'],['legal-proceedings','t105.png'],['psionic-influence','t15.png'],['ancient-technology','t5.png']])assert.equal(S.ART[key].src,'../images/'+src);
 assert.equal(S.ART['valuable-discovery'].src,'../images/t88.png');
 assert.equal(S.ART['scientific-breakthrough'].src,'../images/t92.png');
 assert.equal(S.presentation(ready('scout','event',12)).asset,'valuable-discovery');
 assert.equal(S.presentation(ready('scholar','event',12)).asset,'scientific-breakthrough');
});
