import { json, assertConfig } from './_utils.js';
export default async function handler(req,res){
  if(req.method!=='POST') return json(res,405,{error:'Método não permitido.'});
  try{
    assertConfig();
    const r=await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password`,{method:'POST',headers:{apikey:process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,'Content-Type':'application/json'},body:JSON.stringify(req.body||{})});
    const data=await r.json();
    if(!r.ok) return json(res,401,{error:'E-mail ou senha incorretos.'});
    return json(res,200,{access_token:data.access_token,user:data.user});
  }catch(e){return json(res,500,{error:e.message||'Erro interno.'});}
}
