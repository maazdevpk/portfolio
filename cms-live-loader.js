(function(){
async function getData(){
  try{
    const r=await fetch('/content/site.json?ts='+Date.now(),{cache:'no-store'});
    if(!r.ok) throw new Error('Content fetch failed: '+r.status);
    return await r.json();
  }catch(e){console.error('[MAAZDEVPK CMS]',e);return null}
}
async function applyWhenReady(db){
  if(!db)return;
  for(let i=0;i<50;i++){
    if(typeof window.MAAZDEVPK_APPLY_CMS==='function'){
      window.MAAZDEVPK_APPLY_CMS(db); return;
    }
    await new Promise(r=>setTimeout(r,20));
  }
}
window.MAAZDEVPK_GET_CMS_DATA=getData;
document.addEventListener('DOMContentLoaded',async()=>applyWhenReady(await getData()));
window.addEventListener('message',e=>{
  if(e.data&&e.data.type==='MAAZDEVPK_SITE_PREVIEW')applyWhenReady(e.data.data);
});
})();