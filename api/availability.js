import { json, supabase } from './_utils.js';
export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Método não permitido.' });
  try {
    const date = String(req.query.date || '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json(res, 400, { error: 'Data inválida.' });
    const q = `/rest/v1/appointments?select=time&date=eq.${encodeURIComponent(date)}&status=neq.Cancelado`;
    const r = await supabase(q);
    if (!r.ok) throw new Error(await r.text());
    const rows = await r.json();
    return json(res, 200, { occupied: rows.map(x => x.time) });
  } catch (e) { return json(res, 500, { error: e.message || 'Erro interno.' }); }
}
