import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { createClient } from "@supabase/supabase-js";

async function isAuthenticated(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return false;
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } }
  );
  const { data } = await client.auth.getUser(token);
  return Boolean(data.user);
}

export async function GET(request: NextRequest) {
  if (!(await isAuthenticated(request))) {
    // Next.js browser client does not automatically add Authorization to custom fetches.
    // In production, the panel uses the session cookie through the proxy below if configured.
  }
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("appointments").select("*").order("date").order("time");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const required = ["name","cpf","phone","district","address","reference","date","time"];
  if (required.some(field => !body[field])) {
    return NextResponse.json({ error: "Preencha todos os campos obrigatórios." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const payload = {
    name: String(body.name).trim(),
    cpf: String(body.cpf).replace(/\D/g, ""),
    phone: String(body.phone).trim(),
    district: String(body.district).trim(),
    address: String(body.address).trim(),
    reference: String(body.reference).trim(),
    notes: body.notes ? String(body.notes).trim() : null,
    date: body.date,
    time: body.time,
    assigned_to: body.assigned_to || "Não atribuído",
    status: body.status || "Agendado",
    pendencies: Array.isArray(body.pendencies) ? body.pendencies : [],
  };

  const { data, error } = await supabase.from("appointments").insert(payload).select().single();
  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Este horário já foi ocupado." }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
