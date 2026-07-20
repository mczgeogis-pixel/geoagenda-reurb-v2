import { json, supabase, requireUser } from '../_utils.js';
export default async function handler(req, res) {
  try {
    const user = await requireUser(req); if (!user) return json(res,401,{error:'Não autorizado.'});
    const id = encodeURIComponent(String(req.query.id||''));
    if (req.method === 'PATCH') {
      const r = await supabase(`/rest/v1/appointments?id=eq.${id}`, {method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({...req.body,updated_at:new Date().toISOString()})});
      if(!r.ok) throw new Error(await r.text());
      return json(res,200,(await r.json())[0]);
    }
    if (req.method === 'DELETE') {
      const r = await supabase(`/rest/v1/appointments?id=eq.${id}`, {method:'DELETE'}); if(!r.ok) throw new Error(await r.text());
      return json(res,200,{ok:true});
    }
    return json(res,405,{error:'Método não permitido.'});
  } catch(e){return json(res,500,{error:e.message||'Erro interno.'});}
}
