(function(root,factory){const common=typeof module==='object'&&module.exports;const api=factory(common?require('./scenes.js'):root.TravellerScenes,common?require('./gallery-sources.js'):root.TravellerGallerySources,common?require('./minimal.js'):root.TravellerMinimal);if(common)module.exports=api;else{root.TravellerProjectMenu=api;api.mount(root.document)}})(typeof globalThis==='object'?globalThis:this,function(S,SOURCES,V){
'use strict';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const extras=[
 ['planetary-drop','Marines Event 8 · landing and skill choice'],['field-survey','Scout Event 4 · skill choice'],['heist-briefing','Rogue Event 4 · skill choice'],
 ['crash-rescue','Scout Event 9 · Medic approach'],['engineering-repairs','Scout Event 9 · Engineer approach'],
 ['garden-homeworld','Homeworld · Garden'],['desert-homeworld','Homeworld · inhabited Desert'],
 ['vacuum-homeworld','Homeworld · inhabited vacuum world'],['ocean-homeworld','Homeworld · inhabited ocean world'],
 ['aurora','World generation · other homeworlds'],['psionic-test','Psionic potential test'],
 ['psionic-training','Psionic training · talent acquisition'],['specialist-training','Basic and specialist training'],
 ['muster-out','Benefits · leaving a career · character complete'],['ship-benefit','Scout Ship · Ship Shares'],
 ['equipment-store','Starting equipment shop'],['military-mentor','Navy / Army / Marines · Advancement before the result'],
 ['military-promotion','Navy / Army / Marines · successful Advancement'],['medical-treatment','Injury and medical care · all careers'],
 ['exemplary-service','Non-military careers · Advancement'],['draft','Draft · career assignment roll'],['frontier','Drifter · expedition consequence table']
];
function items(){
 const files=new Map();for(const art of Object.values(S.ART)){if(!art.src)continue;if(!files.has(art.src))files.set(art.src,{src:art.src,title:SOURCES[art.src]?.title||art.title,source:SOURCES[art.src]?.source||art.src.split('/').pop(),order:SOURCES[art.src]?.order||999,placements:[],groups:new Map()})}
 const add=(key,description)=>{const src=S.ART[key]?.src,item=files.get(src);if(item&&!item.placements.includes(description))item.placements.push(description)};
 for(const [kind,maps]of [['Event',S.CAREER_EVENT_ART],['Mishap',S.CAREER_MISHAP_ART]])for(const [career,map]of Object.entries(maps))for(const n of Object.keys(map)){
  const key=S.artFor({phase:kind==='Event'?'event':'mishap',activeCareer:{careerId:career},context:{},currentRoll:{raw:Number(n)}}),item=files.get(S.ART[key]?.src);if(!item)continue;
  const group=career[0].toUpperCase()+career.slice(1)+' '+kind;if(!item.groups.has(group))item.groups.set(group,[]);item.groups.get(group).push(Number(n));
 }
 for(const item of files.values())for(const [label,numbers]of item.groups)item.placements.push(label+' '+numbers.sort((a,b)=>a-b).join(', '));
 for(let n=1;n<=6;n++)add(S.artFor({phase:'unusual',activeCareer:{careerId:'scout'},context:{},currentRoll:{raw:n}}),'Unusual Event '+n);
 for(const[key,label]of extras)add(key,label);
 for(const e of S.ADDITIONAL_EVENTS.events)add(e.art,e.career[0].toUpperCase()+e.career.slice(1)+' Event '+e.number+' · additional: '+e.title);
 return [...files.values()].sort((a,b)=>a.order-b.order||a.source.localeCompare(b.source)).map(({groups,...item})=>({...item,used:item.placements.length>0}));
}
function missingItems(){
 const groups=new Map();
 const add=(key,place)=>{if(!key||key==='none'||S.ART[key]?.src)return;if(!groups.has(key))groups.set(key,{key,title:S.ART[key]?.title||key,placements:[]});groups.get(key).placements.push(place)};
 for(const[kind,maps]of [['Event',S.CAREER_EVENT_ART],['Mishap',S.CAREER_MISHAP_ART]])for(const[career,map]of Object.entries(maps))for(const n of Object.keys(map))add(map[n],career[0].toUpperCase()+career.slice(1)+' '+kind+' '+n);
 for(let n=1;n<=6;n++)add(S.artFor({phase:'unusual',activeCareer:{careerId:'scout'},context:{},currentRoll:{raw:n}}),'Unusual Event '+n);
 return [...groups.values()];
}
function neededHTML(){const needed=missingItems();if(!needed.length)return '';return `<details class="gallery-needed"><summary>Artwork needed · ${needed.length} subjects</summary><ul>${needed.map(item=>`<li><strong>${esc(item.title)}</strong><span>${esc(item.placements.join(' · '))}</span></li>`).join('')}</ul></details>`}
function galleryHTML(){const list=items(),used=list.filter(i=>i.used).length;return `<p class="gallery-intro">${list.length} illustrations · ${used} in use · ${list.length-used} available</p>${neededHTML()}<div class="gallery-list">${list.map(item=>{
 const entries=item.placements.length?item.placements:['Available for a new event.'];const short=entries.slice(0,4),rest=entries.slice(4);
 return `<article class="gallery-card" id="gallery-${item.order}"><div class="gallery-card-heading"><h3><span class="gallery-number">${esc(item.source)}</span>${esc(item.title)}</h3><span class="gallery-status ${item.used?'':'is-available'}">${item.used?'In use':'Available'}</span></div><img src="${esc(item.src)}" alt="${esc(item.title)}" loading="lazy" decoding="async" width="1672" height="941"><div class="gallery-placements"><p class="gallery-label">Used in</p><ul>${short.map(t=>'<li>'+esc(t)+'</li>').join('')}</ul>${rest.length?`<details><summary>${rest.length} more placements</summary><ul>${rest.map(t=>'<li>'+esc(t)+'</li>').join('')}</ul></details>`:''}</div></article>`;
 }).join('')}</div>`}
function aboutHTML(){return '<div class="project-about"><p class="about-lead">A life before the first adventure.</p><p>Create a human Traveller: generate a homeworld, develop skills and follow a career through the events that shape a life.</p><dl><div><dt>Careers</dt><dd>13 paths, from Scout and Merchant to Noble and Psion.</dd></div><div><dt>Creation methods</dt><dd>Standard rolls, Choose Skills and Point Allocation.</dd></div><div><dt>Rules</dt><dd>Based on Mongoose Traveller (2008).</dd></div><div><dt>Progress</dt><dd>Saved automatically in this browser. Restart keeps a backup of the previous character.</dd></div></dl><p>Gallery contains all supplied illustrations and their current event assignments. Life Events use text-only cards. Eight supplementary career events use project rules: on the listed table results, an additional d6 selects the new event on 1–2 or the original event on 3–6.</p></div>'}
function rulesHTML(){return V.rules().replace(/^<details[^>]*><summary>Rules<\/summary>/,'').replace(/<\/details>$/,'')}
function mount(doc){
 if(!doc||doc.getElementById('project-menu'))return null;const app=doc.getElementById('app');if(!app)return null;
 const win=doc.defaultView||globalThis,menu=doc.createElement('nav');menu.id='project-menu';menu.className='project-menu';menu.setAttribute('aria-label','Project menu');menu.innerHTML='<a class="project-wordmark" href="#stage">TRAVELLER</a><div class="project-menu-actions"><button type="button" data-project-view="restart">Restart</button><button type="button" data-project-view="rules">Rules</button><button type="button" data-project-view="about">About Project</button><button type="button" data-project-view="gallery">Gallery</button></div>';app.before(menu);
 const dialog=doc.createElement('dialog');dialog.id='project-dialog';dialog.className='project-dialog';dialog.setAttribute('aria-labelledby','project-dialog-title');dialog.innerHTML='<header class="project-dialog-header"><h2 id="project-dialog-title"></h2><button type="button" class="project-dialog-close" aria-label="Close dialog">Close <span aria-hidden="true">×</span></button></header><div id="project-dialog-content" class="project-dialog-content"></div>';doc.body.append(dialog);
 const title=dialog.querySelector('#project-dialog-title'),content=dialog.querySelector('#project-dialog-content');let opener=null,galleryCache='';
 function close(){dialog.close()}
 function open(view,button){opener=button;dialog.classList.toggle('is-gallery',view==='gallery');title.textContent=view==='gallery'?'Gallery':view==='about'?'About Project':view==='rules'?'Rules':'Restart character?';content.innerHTML=view==='gallery'?(galleryCache||(galleryCache=galleryHTML())):view==='about'?aboutHTML():view==='rules'?'<div class="project-rules">'+rulesHTML()+'</div>':'<div class="project-restart"><p>Start a new Traveller? Your current progress will be replaced. A backup of this character will be kept in this browser.</p><div class="project-restart-actions"><button type="button" class="primary" data-project-confirm>Restart</button><button type="button" class="plain" data-project-cancel>Keep character</button></div></div>';dialog.showModal();dialog.scrollTop=0;doc.body.classList.add('project-modal-open');(view==='restart'?content.querySelector('[data-project-cancel]'):dialog.querySelector('.project-dialog-close')).focus()}
 menu.addEventListener('click',event=>{const button=event.target.closest('[data-project-view]');if(button)open(button.dataset.projectView,button)});
 dialog.querySelector('.project-dialog-close').addEventListener('click',close);
 dialog.addEventListener('close',()=>{doc.body.classList.remove('project-modal-open');opener?.focus()});
 dialog.addEventListener('click',event=>{
  if(event.target.closest('[data-project-cancel]'))close();
  if(event.target.closest('[data-project-confirm]')){close();app.dispatchEvent(new win.CustomEvent('traveller-restart'))}
  if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)close()}
 });
 return {open,close,menu,dialog};
}
return {items,missingItems,galleryHTML,aboutHTML,rulesHTML,mount};
});
