(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else{root.TravellerDesktop=api;api.mount(root.document)}})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
function isBlocked(win){
 const nav=win.navigator||{},mobile=nav.userAgentData?.mobile||/Android|iPhone|iPad|iPod|Mobile/i.test(nav.userAgent||'')||(nav.platform==='MacIntel'&&nav.maxTouchPoints>1);
 return Boolean(mobile||win.matchMedia('(max-width: 1023px)').matches);
}
function mount(doc){
 if(!doc)return null;const win=doc.defaultView||globalThis,media=win.matchMedia('(max-width: 1023px)');
 const apply=()=>{
  const blocked=isBlocked(win);doc.documentElement.toggleAttribute('data-desktop-blocked',blocked);
  const notice=doc.getElementById('desktop-notice'),app=doc.getElementById('app');
  if(notice)notice.hidden=!blocked;
  if(app){const covered=blocked||Boolean(doc.documentElement.hasAttribute?.('data-airlock'));app.inert=covered;if(covered)app.setAttribute('aria-hidden','true');else app.removeAttribute('aria-hidden');}
  if(blocked)for(const dialog of doc.querySelectorAll('dialog[open]'))dialog.close();
 };
 apply();media.addEventListener('change',apply);return {apply};
}
return {isBlocked,mount};
});
