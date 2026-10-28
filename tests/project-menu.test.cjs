const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const M=require('../dist/project-menu.js'),E=require('../dist/engine.js');
test('gallery contains all 101 supplied images once in original numeric order, with every image assigned',()=>{
 const items=M.items();assert.equal(items.length,101);assert.equal(new Set(items.map(x=>x.src)).size,101);
 assert.deepEqual(items.map(x=>x.order),Array.from({length:105},(_,i)=>i+1).filter(n=>![12,36,43,68].includes(n)));
 assert.deepEqual(items.filter(x=>!x.used).map(x=>x.source),[]);
 for(const item of items)assert.equal(item.src,'../images/'+item.source);
 const html=M.galleryHTML();assert.equal((html.match(/<article /g)||[]).length,101);assert.equal((html.match(/<img /g)||[]).length,101);assert.match(html,/101 in use · 0 available/);assert.match(html,/more placements/);
});
test('gallery follows corrected assignments without bringing Life artwork back',()=>{
 const by=n=>M.items().find(x=>x.order===n).placements.join('; ');
 assert.match(by(6),/Noble Event 5/);assert.match(by(9),/Scout Mishap 5/);assert.match(by(9),/Unusual Event 4/);
 assert.match(by(70),/Marines Event 8/);assert.match(by(11),/Marines Event 6/);
 assert.match(by(18),/Entertainer Event 3, 5/);assert.match(by(4),/Entertainer Event 10/);assert.doesNotMatch(by(4),/Entertainer Event 3/);
 assert.ok(M.items().every(item=>item.placements.every(p=>!/^Life /.test(p))));
 assert.match(by(38),/Engineer/);assert.match(by(55),/Medic/);
});
test('rendering gallery and about is read-only and does not mutate character or assignments',()=>{
 const game=E.create('menu-read-only'),before=JSON.stringify(game),mapping=JSON.stringify(require('../dist/scenes.js').CAREER_EVENT_ART);
 M.galleryHTML();assert.match(M.aboutHTML(),/13 paths/);assert.equal(JSON.stringify(game),before);assert.equal(JSON.stringify(require('../dist/scenes.js').CAREER_EVENT_ART),mapping);
});
// Small DOM adapter exercises the actual menu listeners and confirmed Restart event.
function fakeDocument(){
 const nodes=new Map();let resets=0,requests=0;const classes=new Set();
 const node=()=>({listeners:{},className:'',innerHTML:'',dataset:{},classList:{toggle(){},add(x){classes.add(x)},remove(x){classes.delete(x)}},setAttribute(){},before(){},append(){},focus(){this.focused=true},addEventListener(t,fn){this.listeners[t]=fn},querySelector(s){if(!nodes.has(s))nodes.set(s,node());return nodes.get(s)},showModal(){this.open=true},close(){this.open=false;this.listeners.close?.()},getBoundingClientRect(){return {left:0,right:100,top:0,bottom:100}}});
 const app=node();app.dispatchEvent=event=>{assert.equal(event.type,'traveller-restart');requests++;resets++};
 const doc={getElementById:id=>id==='app'?app:null,createElement(){return node()},body:node(),defaultView:{CustomEvent:class{constructor(type){this.type=type}}}};
 return {doc,nodes,get resets(){return resets},get requests(){return requests},classes};
}
test('About and Gallery open and close without resetting; Restart runs only after confirmation',()=>{
 const f=fakeDocument(),ui=M.mount(f.doc),opener={focus(){this.focused=true}};
 ui.open('gallery',opener);assert.equal(ui.dialog.open,true);assert.equal(f.resets,0);assert.match(f.nodes.get('#project-dialog-content').innerHTML,/gallery-list/);
 ui.close();assert.equal(ui.dialog.open,false);assert.equal(opener.focused,true);
 ui.open('about',opener);assert.equal(f.resets,0);ui.close();
 ui.open('restart',opener);assert.equal(f.resets,0);
 ui.dialog.listeners.click({target:{closest:s=>s==='[data-project-cancel]'?{}:null}});assert.equal(f.resets,0);assert.equal(ui.dialog.open,false);
 ui.open('restart',opener);ui.dialog.listeners.click({target:{closest:s=>s==='[data-project-confirm]'?{}:null}});
 assert.equal(f.requests,1);assert.equal(f.resets,1);assert.equal(ui.dialog.open,false);
});
test('Rules opens in the top navigation dialog using the complete shared rules text',()=>{
 const f=fakeDocument(),ui=M.mount(f.doc),opener={focus(){this.focused=true}};
 assert.match(ui.menu.innerHTML,/data-project-view="rules">Rules/);
 ui.open('rules',opener);assert.equal(ui.dialog.open,true);
 assert.equal(f.nodes.get('#project-dialog-title').textContent,'Rules');
 const content=f.nodes.get('#project-dialog-content').innerHTML;
 for(const text of ['Mongoose Traveller (2008)','Cash Benefits','Cr2,000','Campaign Skill Pack'])assert.ok(content.includes(text));
 assert.doesNotMatch(content,/<summary>|<details/);assert.equal(f.resets,0);
 ui.close();assert.equal(opener.focused,true);
});

test('artwork-needed list is empty and Ancient technology remains separate from discoveries',()=>{
 const missing=M.missingItems();assert.deepEqual(missing,[]);
 for(const key of ['space-battle','legal-proceedings','psionic-influence','ancient-technology','none'])assert.ok(!missing.some(x=>x.key===key));
 assert.doesNotMatch(M.galleryHTML(),/gallery-needed/);
 assert.ok(M.items().find(x=>x.order===5).placements.includes('Unusual Event 6'));
 assert.ok(!M.items().find(x=>x.order===5).placements.some(x=>/Scout Event 12|Scholar Event 12/.test(x)));
});

 test('collection review fills matching subjects and covers every narrative group',()=>{
 assert.deepEqual(M.missingItems(),[]);
 assert.equal(M.missingItems().reduce((n,x)=>n+x.placements.length,0),0);
 const item=n=>M.items().find(x=>x.order===n);
 assert.match(item(83).placements.join(';'),/Scholar Event 3/);assert.match(item(83).placements.join(';'),/Scholar Mishap 3/);assert.doesNotMatch(item(83).placements.join(';'),/Event 12/);
 assert.match(item(79).placements.join(';'),/Psion Mishap 5/);
 assert.match(item(85).placements.join(';'),/Entertainer Event 12/);
 assert.match(item(23).placements.join(';'),/Citizen Event 12/);
 });
