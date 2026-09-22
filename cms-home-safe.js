
(function(){
 const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
 const published=a=>(Array.isArray(a)?a:[]).filter(x=>(x.status||'published')==='published').sort((a,b)=>(a.order||0)-(b.order||0));
 const setText=(el,v)=>{if(el&&v!==undefined&&v!==null&&String(v)!=='')el.textContent=v};
 const setImg=(el,v,alt)=>{if(el&&v){el.src=v;if(alt)el.alt=alt}};
 function sync(hostSel,itemSel,items,apply){
   const host=$(hostSel); if(!host)return;
   let nodes=$$(itemSel,host); if(!nodes.length)return;
   const template=nodes[0].cloneNode(true);
   while(nodes.length<items.length){host.appendChild(template.cloneNode(true));nodes=$$(itemSel,host)}
   nodes.forEach((n,i)=>{if(i>=items.length){n.style.display='none';return}n.style.display='';apply(n,items[i],i)});
 }
 function bind(db){
   if(!db)return;
   const h=db.home||{};
   setText($('.hero .eyebrow'),h.eyebrow);
   setText($('.hero h1'),h.headline);
   setText($('.hero .hero-copy p')||$('.hero p'),h.intro);

   sync('#serviceTrack','.service-card',published(db.services),(c,x,i)=>{
     c.dataset.service=i;setText($('h3',c),x.title);setText($('p',c),x.description);setImg($('img',c),x.image,x.title);
     const a=$('a',c);if(a&&x.url)a.href=x.url;
   });

   sync('#projects','.project-card',published(db.projects).slice(0,4),(c,x)=>{
     if(x.url)c.href=x.url;if(x.category)c.dataset.category=x.category;setImg($('img',c),x.image,x.title);
     const spans=$$('.project-meta span',c);setText(spans[0],x.title);
   });

   const skills=[];Object.entries(db.skills||{}).forEach(([category,list])=>(list||[]).forEach(name=>skills.push({name,category})));
   sync('#skills .skill-panel','.skill-chip',skills,(c,x)=>{setText($('b',c),x.name);setText($('span',c),x.category)});

   const ts=published(db.testimonials);
   if(ts.length){const x=ts[0];setText($('#testimonialText'),x.quote);setText($('#testimonialName'),x.name+(x.role?' — '+x.role:''));setImg($('#testimonialImg'),x.image,x.imageAlt||x.name)}

   const faqs=published(db.faqs), nodes=$$('#faq .faq-item');
   nodes.forEach((n,i)=>{if(i>=faqs.length){n.style.display='none';return}n.style.display='';const x=faqs[i],q=$('.faq-question',n),ans=$('.faq-answer p',n)||$('.faq-answer',n);if(q){const sp=q.querySelector('span');setText(sp||q,x.question)}setText(ans,x.answer)});
 }
 window.MAAZDEVPK_BIND_HOME=bind;
 window.addEventListener('message',e=>{if(e.data&&e.data.type==='MAAZDEVPK_HOME_PREVIEW')bind(e.data.data)});
})();
