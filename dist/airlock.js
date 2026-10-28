(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else{root.TravellerAirlock=api;api.mount(root.document)}})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
// Decorative steel geometry is generated locally; no textures or image assets.
function doorDetails(side){
 const id='hull-'+side,parts=[`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1200" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2=".15"><stop stop-color="#111111"/><stop offset=".18" stop-color="#2b2b2b"/><stop offset=".52" stop-color="#191919"/><stop offset=".88" stop-color="#333333"/><stop offset="1" stop-color="#111111"/></linearGradient></defs><rect width="800" height="1200" fill="#161616"/><path d="M22 22H690L772 104V1096L690 1178H22Z" fill="url(#${id})" stroke="#565656" stroke-width="2"/>`];
 for(let row=0;row<4;row++){
  const y=62+row*282;
  parts.push(`<path d="M52 ${y}H620L699 ${y+50}V${y+204}L648 ${y+238}H52Z" fill="#141414" stroke="#454545" stroke-width="2"/><path d="M66 ${y+14}H614L684 ${y+59}" fill="none" stroke="#666666" stroke-opacity=".65"/><path d="M66 ${y+224}H643L684 ${y+196}" fill="none" stroke="#000000" stroke-width="5"/>`);
  for(let rib=0;rib<6;rib++){const x=90+rib*82;parts.push(`<path d="M${x} ${y+54}V${y+190}" stroke="#292929" stroke-width="16"/><path d="M${x-8} ${y+54}V${y+190}" stroke="#3a3a3a" stroke-width="1"/>`);}
  for(const x of [66,648])for(const cy of [y+26,y+212])parts.push(`<circle cx="${x}" cy="${cy}" r="5" fill="#060606" stroke="#5f5f5f"/><path d="M${x-2} ${cy-2}l4 4" stroke="#858585" stroke-width="1"/>`);
 }
 parts.push('<path d="M734 72V1128" stroke="#060606" stroke-width="26"/><path d="M719 72V1128" stroke="#747474" stroke-width="2"/><path d="M749 72V1128" stroke="#3f3f3f" stroke-width="2"/>');
 for(let i=0;i<23;i++){const y=104+i*44;parts.push(`<path d="M725 ${y}l18 18v12l-18-18Z" fill="${i%2?'#2a2a2a':'#7a7a7a'}"/>`);}
 for(const y of [190,600,1010])parts.push(`<path d="M686 ${y-24}H780V${y+24}H686Z" fill="#151515" stroke="#686868" stroke-width="2"/><path d="M700 ${y}H766" stroke="#949494" stroke-width="3"/>`);
 parts.push('</svg>');return parts.join('');
}
function mount(doc){
 if(!doc)return null;const overlay=doc.getElementById('airlock');if(!overlay)return null;
 const win=doc.defaultView||globalThis,root=doc.documentElement,button=doc.getElementById('airlock-enter'),left=doc.getElementById('airlock-left'),right=doc.getElementById('airlock-right'),app=doc.getElementById('app'),nav=doc.getElementById('project-menu');
 let state='closed';
 left.innerHTML=doorDetails('left');right.innerHTML=doorDetails('right');
 function setState(next){state=next;overlay.setAttribute('data-state',next);root.setAttribute('data-airlock',next);}
 function finish(){
  if(state==='open')return;state='open';overlay.hidden=true;root.removeAttribute('data-airlock');
  const blocked=root.hasAttribute('data-desktop-blocked');
  if(app){app.inert=blocked;if(blocked)app.setAttribute('aria-hidden','true');else app.removeAttribute('aria-hidden');}
  if(nav)nav.inert=false;
  if(!blocked)doc.getElementById('stage')?.focus({preventScroll:true});
 }
 function enter(){
  if(state!=='closed'||root.hasAttribute('data-desktop-blocked'))return;
  button.disabled=true;setState('unlocking');
  if(win.matchMedia('(prefers-reduced-motion: reduce)').matches){finish();return;}
  win.setTimeout(()=>{
   setState('opening');
   if(!left.animate||!right.animate){finish();return;}
   try{
    const options={duration:1450,easing:'cubic-bezier(.65,0,.2,1)',fill:'forwards'};
    const a=left.animate([{transform:'translateX(0)'},{transform:'translateX(-102%)'}],options),b=right.animate([{transform:'translateX(0)'},{transform:'translateX(102%)'}],options);
    Promise.all([a.finished,b.finished]).then(finish,finish);
   }catch{finish();}
  },360);
 }
 setState('closed');overlay.hidden=false;button.disabled=false;
 if(app){app.inert=true;app.setAttribute('aria-hidden','true');}if(nav)nav.inert=true;
 button.addEventListener('click',enter);
 if(!root.hasAttribute('data-desktop-blocked'))button.focus({preventScroll:true});
 return {enter,get state(){return state}};
}
return {doorDetails,mount};
});
