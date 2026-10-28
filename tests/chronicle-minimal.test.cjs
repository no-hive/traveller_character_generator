'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const S=require('../dist/scenes.js');
function entry(){return {id:'history-entry',scene:{title:'First on the scene.',key:'career1:term1:event:9',kicker:'Scout · term 1',content:'<p>A distress call interrupts your assignment.</p>',asset:'rescue-operation',cause:''},command:'TREAT THE SURVIVORS',rolls:[{id:'r1',label:'Medic check',dice:[5,6],sides:6,total:12,modifier:1,success:true}],lines:['New Contact: Rescue survivor.']}}
test('collapsed history exposes exactly the title and starts closed',()=>{
 const html=S.feedHTML([entry()]);
 const summary=html.match(/<summary>([\s\S]*?)<\/summary>/)[1];
 assert.equal(summary,'<span class="chronicle-summary-title">First on the scene.</span>');
 assert.doesNotMatch(html.match(/^<details[^>]*>/)[0],/\sopen(?:\s|=|>)/);
 assert.doesNotMatch(summary,/Scout|term 1|TREAT|Success|Contact|svg|button|aria-label/);
});
test('expanded history retains the story, chosen action, dice and consequences',()=>{
 const html=S.feedHTML([entry()]),expanded=html.split('<div class="chronicle-expanded">')[1];
 for(const text of ['A distress call','TREAT THE SURVIVORS','5 + 6','Success','New Contact: Rescue survivor.'])assert.ok(expanded.includes(text),text);
});
test('old entries remain readable, titles are escaped, and new records start collapsed',()=>{
 const first=entry(),second=entry();second.id='history-next';second.scene={...second.scene,title:'<img src=x onerror=alert(1)>'};
 const html=S.feedHTML([first,second]);assert.equal((html.match(/<details /g)||[]).length,2);
 assert.match(html,/&lt;img src=x onerror=alert\(1\)&gt;/);assert.doesNotMatch(html,/<img src=x/);
 assert.equal((html.match(/<summary>/g)||[]).length,2);
});
