import { json, supabase, requireUser } from './_utils.js';
const allowedTimes = ['08:00','09:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00'];
export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const user = await requireUser(req); if (!user) return json(res, 401, { error: 'Não autorizado.' });
      const r = await supabase('/rest/v1/appointments?select=*&order=date.asc,time.asc');
      if (!r.ok) throw new Error(await r.text());
      return json(res, 200, await r.json());
    }
    if (req.method === 'POST') {
      const b = req.body || {};
      const required = ['date','time','name','cpf','phone','district','address','reference'];
      if (required.some(k => !String(b[k] || '').trim())) return json(res, 400, { error: 'Preencha todos os campos obrigatórios.' });
      if (!allowedTimes.includes(b.time)) return json(res, 400, { error: 'Horário inválido.' });
      const row = { date:b.date, time:b.time, name:b.name.trim(), cpf:b.cpf.trim(), phone:b.phone.trim(), district:b.district.trim(), address:b.address.trim(), reference:b.reference.trim(), notes:(b.notes||'').trim(), assigned_to:b.assigned_to||'Não atribuído', status:b.status||'Agendado', pendencies:Array.isArray(b.pendencies)?b.pendencies:[] };
      const r = await supabase('/rest/v1/appointments', { method:'POST', headers:{Prefer:'return=representation'}, body:JSON.stringify(row) });
      if (!r.ok) {
        const t = await r.text();
        if (t.includes('appointments_active_slot_unique') || t.includes('duplicate key')) return json(res, 409, { error:'Este horário acabou de ser ocupado. Escolha outro.' });
        throw new Error(t);
      }
      return json(res, 201, (await r.json())[0]);
    }
    return json(res, 405, { error:'Método não permitido.' });
  } catch(e) { return json(res,500,{error:e.message||'Erro interno.'}); }
}
