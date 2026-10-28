'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js'),S=require('../dist/scenes.js');
test('missing artwork retains its named placeholder and image column after redraw',()=>{
 const g=E.create('placeholder');Object.assign(g,{name:'Alex',phase:'eventchoice',stats:[8,9,8,10,8,7],assignment:'explore',enlisted:true,trained:true,skills:{Медик:1},context:{event:9}});
 const m=S.createSession(g),art=S.ART['rescue-operation'];assert.match(S.card(m.game,m.ui),/scene-image/);
 let replacement;const image={alt:art.title,getAttribute:()=>art.src,replaceWith:node=>replacement=node};
 const doc={createElement:()=>({attributes:{},children:[],setAttribute(k,v){this.attributes[k]=v},append(...nodes){this.children.push(...nodes)}})};
 S.replaceMissingIllustration(image,doc);assert.equal(replacement.className,'scene-placeholder');assert.equal(replacement.children[0].textContent,art.title);assert.equal(replacement.children[1].textContent,'Image unavailable');assert.equal(replacement.attributes.role,'img');
 const html=S.card(m.game,m.ui);assert.match(html,/scene-intro has-illustration/);assert.match(html,/scene-media/);assert.match(html,/scene-placeholder/);assert.match(html,/Rescue Operation/);assert.doesNotMatch(html,/<img/);
 assert.ok(html.indexOf('scene-placeholder')<html.indexOf('scene-copy'));
});
