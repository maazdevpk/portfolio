
const json=(body,status=200,headers={})=>new Response(JSON.stringify(body),{
  status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers}
});
const enc=new TextEncoder();
const b64encode=s=>{
  const bytes=enc.encode(s); let bin='';
  for(let i=0;i<bytes.length;i++) bin+=String.fromCharCode(bytes[i]);
  return btoa(bin);
};
const b64decode=s=>{
  const bin=atob((s||'').replace(/\n/g,'')); const bytes=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
};
async function hmac(secret,value){
  const key=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const sig=new Uint8Array(await crypto.subtle.sign('HMAC',key,enc.encode(value)));
  return Array.from(sig,b=>b.toString(16).padStart(2,'0')).join('');
}
async function issueToken(secret){
  const payload=btoa(JSON.stringify({exp:Date.now()+8*60*60*1000,nonce:crypto.randomUUID()}));
  return payload+'.'+await hmac(secret,payload);
}
async function validToken(secret,token){
  if(!secret||!token||!token.includes('.')) return false;
  const [payload,sig]=token.split('.');
  if((await hmac(secret,payload))!==sig) return false;
  try{return JSON.parse(atob(payload)).exp>Date.now()}catch{return false}
}
function required(env){
  return ['CMS_ADMIN_PASSWORD','CMS_SESSION_SECRET','GITHUB_TOKEN','GITHUB_OWNER','GITHUB_REPO','GITHUB_BRANCH']
    .filter(k=>!env[k]);
}
function ghHeaders(env){
  return {
    'Accept':'application/vnd.github+json',
    'Authorization':`Bearer ${env.GITHUB_TOKEN}`,
    'X-GitHub-Api-Version':'2022-11-28',
    'User-Agent':'MAAZDEVPK-CMS'
  };
}
function ghUrl(env){
  return `https://api.github.com/repos/${encodeURIComponent(env.GITHUB_OWNER)}/${encodeURIComponent(env.GITHUB_REPO)}/contents/content/site.json?ref=${encodeURIComponent(env.GITHUB_BRANCH)}`;
}
async function readGithub(env){
  const r=await fetch(ghUrl(env),{headers:ghHeaders(env)});
  if(!r.ok) throw new Error(`GitHub read failed (${r.status})`);
  const j=await r.json();
  return {data:JSON.parse(b64decode(j.content)),sha:j.sha};
}
async function writeGithub(env,data,sha){
  const url=`https://api.github.com/repos/${encodeURIComponent(env.GITHUB_OWNER)}/${encodeURIComponent(env.GITHUB_REPO)}/contents/content/site.json`;
  const body={
    message:'Update website content via MAAZDEVPK CMS',
    content:b64encode(JSON.stringify(data,null,2)+'\n'),
    sha,
    branch:env.GITHUB_BRANCH
  };
  const r=await fetch(url,{method:'PUT',headers:{...ghHeaders(env),'Content-Type':'application/json'},body:JSON.stringify(body)});
  const j=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(j.message||`GitHub save failed (${r.status})`);
  return j;
}
export async function onRequest({request,env}){
  try{
    const missing=required(env);
    if(missing.length) return json({error:'Server configuration incomplete',missing},500);
    if(request.method==='OPTIONS') return new Response(null,{status:204,headers:{'allow':'GET, POST, OPTIONS'}});
    if(request.method==='POST'){
      const body=await request.json().catch(()=>({}));
      if(body.action==='login'){
        if(body.password!==env.CMS_ADMIN_PASSWORD) return json({error:'Invalid password'},401);
        return json({token:await issueToken(env.CMS_SESSION_SECRET)});
      }
      const auth=(request.headers.get('authorization')||'').replace(/^Bearer\s+/i,'');
      if(!(await validToken(env.CMS_SESSION_SECRET,auth))) return json({error:'Unauthorized'},401);
      if(body.action==='save'){
        if(!body.data || typeof body.data!=='object' || Array.isArray(body.data)) return json({error:'Invalid content payload'},400);
        const current=await readGithub(env);
        const saved=await writeGithub(env,body.data,current.sha);
        return json({ok:true,commit:saved.commit?.sha||null});
      }
      return json({error:'Unknown action'},400);
    }
    if(request.method==='GET'){
      const auth=(request.headers.get('authorization')||'').replace(/^Bearer\s+/i,'');
      if(!(await validToken(env.CMS_SESSION_SECRET,auth))) return json({error:'Unauthorized'},401);
      const current=await readGithub(env);
      return json({data:current.data});
    }
    return json({error:'Method not allowed'},405,{'allow':'GET, POST, OPTIONS'});
  }catch(e){
    return json({error:e?.message||'Server error'},500);
  }
}
