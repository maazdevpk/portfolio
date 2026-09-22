
(function(){
const KEY='maazdevpkCMSDataV13', $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const pub=a=>(Array.isArray(a)?a:[]).filter(x=>(x.status||'published')==='published').sort((a,b)=>(a.order||0)-(b.order||0));
const t=(e,v)=>{if(e&&v!==undefined&&v!==null)e.textContent=v}, im=(e,x)=>{if(e&&x.image){e.src=x.image;e.alt=x.imageAlt||x.title||''}};
function repeat(sel,items,paint){let ns=$$(sel);if(!ns.length)return;const parent=ns[0].parentElement, tpl=ns[0].cloneNode(true);while(ns.length<items.length){parent.appendChild(tpl.cloneNode(true));ns=$$(sel)}ns.forEach((n,i)=>{if(i>=items.length){n.style.display='none';return}n.style.display='';paint(n,items[i],i)})}
function apply(db){
 const page=(location.pathname.split('/').pop()||'').toLowerCase();
 if(page.includes('work')) repeat('.full-project-card',pub(db.projects),(c,x)=>{t($('small',c),x.category);t($('h3',c),x.title);im($('img',c),x);const a=$('.project-info a',c);if(a){if(x.url){a.href=x.url;a.classList.remove('no-link')}else{a.removeAttribute('href');a.classList.add('no-link')}t(a,x.linkText||'VISIT ↗')}});
 if(page.includes('services')) repeat('.home-service-card',pub(db.services),(c,x)=>{t($('h3',c),x.title);im($('img',c),x)});
 if(page.includes('skills')){
   const cats=db.skills||{}; $$('.skill-section').forEach(sec=>{const name=tcat(sec);const items=pub(cats[name]||[]);const cards=$$('.skill-card',sec);if(!cards.length)return;const host=cards[0].parentElement,tpl=cards[0].cloneNode(true);let ns=cards;while(ns.length<items.length){host.appendChild(tpl.cloneNode(true));ns=$$('.skill-card',sec)}ns.forEach((c,i)=>{if(i>=items.length){c.style.display='none';return}c.style.display='';t($('h3',c),items[i].title||items[i].name);t($('p',c),items[i].description)})});
 }
 if(page.includes('experience')) repeat('.exp-card',pub(db.experience),(c,x)=>{t($('.exp-date',c),x.period);t($('.exp-type',c),x.type);t($('h3',c),x.role);t($('strong',c),x.company);t($('p',c),x.description);const tags=$('.tags',c);if(tags&&Array.isArray(x.tags))tags.innerHTML=x.tags.map(v=>'<span class="pill"></span>').join(''),$$('.pill',tags).forEach((e,i)=>t(e,x.tags[i]))});
 if(page.includes('education')) repeat('.edu-card',pub(db.education),(c,x)=>{t($('.edu-date',c),x.period);t($('.edu-level',c),x.level);t($('h3',c),x.title);t($('h4',c),x.institution);t($('p',c),x.detail);const tags=$('.edu-tags',c);if(tags&&Array.isArray(x.tags))tags.innerHTML=x.tags.map(v=>'<span></span>').join(''),$$('span',tags).forEach((e,i)=>t(e,x.tags[i]))});
 if(page.includes('certifications')){
   const grouped={};pub(db.certifications).forEach(x=>(grouped[x.category]||(grouped[x.category]=[])).push(x));
   $$('.cert-section').forEach(sec=>{const cat=tcat(sec),items=grouped[cat]||[],cards=$$('.cert-card',sec);if(!cards.length)return;const host=cards[0].parentElement,tpl=cards[0].cloneNode(true);let ns=cards;while(ns.length<items.length){host.appendChild(tpl.cloneNode(true));ns=$$('.cert-card',sec)}ns.forEach((c,i)=>{if(i>=items.length){c.style.display='none';return}c.style.display='';const x=items[i];t($('.cert-date',c),x.date);t($('.cert-type',c),x.type);t($('h3',c),x.title);t($('strong',c),x.issuer)})});
 }
 if(page.includes('faq')) repeat('.faq-item',pub(db.faqs),(c,x,i)=>{t($('.faq-num',c),String(i+1).padStart(2,'0'));t($('.faq-title',c),x.question);t($('.faq-answer p',c),x.answer)});
 if(page.includes('contact')){const c=db.site&&db.site.contact||{};$$('a[href]').forEach(a=>{const h=a.getAttribute('href')||'';if(h.startsWith('mailto:')&&c.email)a.href='mailto:'+c.email;else if(h.startsWith('tel:')&&c.phone)a.href='tel:'+c.phone;else if(h.includes('wa.me/')&&c.whatsapp)a.href=c.whatsapp;else if(h.includes('calendly.com/')&&c.calendly)a.href=c.calendly;else if(h.includes('linkedin.com/')&&c.linkedin)a.href=c.linkedin;else if(h.includes('github.com/')&&c.github)a.href=c.github;else if(h.includes('instagram.com/')&&c.instagram)a.href=c.instagram;else if(h.includes('facebook.com/')&&c.facebook)a.href=c.facebook;else if(h.includes('threads.net/')&&c.threads)a.href=c.threads;else if(h.includes('x.com/')&&c.x)a.href=c.x;else if(h.includes('tiktok.com/')&&c.tiktok)a.href=c.tiktok})}
}
function tcat(sec){const h=$('h2',sec);return h?h.textContent.trim():''}
window.MAAZDEVPK_APPLY_CMS=apply;
window.addEventListener('message',e=>{if(e.data&&e.data.type==='MAAZDEVPK_SITE_PREVIEW')apply(e.data.data)});
try{const x=localStorage.getItem(KEY);if(x)apply(JSON.parse(x))}catch(e){}
})();
