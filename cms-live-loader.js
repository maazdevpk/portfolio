(function(){
async function getData(){
  try{
    const r=await fetch('content/site.json?ts='+Date.now(),{cache:'no-store'});
    if(!r.ok) throw new Error('Content fetch failed');
    return await r.json();
  }catch(e){return null}
}
window.MAAZDEVPK_GET_CMS_DATA=getData;
document.addEventListener('DOMContentLoaded',async()=>{
  const db=await getData();
  if(db && window.MAAZDEVPK_APPLY_CMS) window.MAAZDEVPK_APPLY_CMS(db);
});
window.addEventListener('message',e=>{
  if(e.data&&e.data.type==='MAAZDEVPK_SITE_PREVIEW'&&window.MAAZDEVPK_APPLY_CMS){
    window.MAAZDEVPK_APPLY_CMS(e.data.data);
  }
});
})();