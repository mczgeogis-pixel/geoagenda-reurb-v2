const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SECRET_KEY;
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function json(res, status, data) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8').send(JSON.stringify(data));
}
export function assertConfig() {
  if (!base || !serviceKey || !publicKey) throw new Error('Variáveis do Supabase não configuradas.');
}
export async function supabase(path, options = {}, useService = true) {
  assertConfig();
  const key = useService ? serviceKey : publicKey;
  const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...(options.headers || {}) };
  return fetch(`${base}${path}`, { ...options, headers });
}
export async function requireUser(req) {
  assertConfig();
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const r = await fetch(`${base}/auth/v1/user`, { headers: { apikey: publicKey, Authorization: `Bearer ${token}` } });
  return r.ok ? r.json() : null;
}
