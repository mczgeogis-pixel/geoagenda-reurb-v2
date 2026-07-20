import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  if (!date) return NextResponse.json({ occupied: [] });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("time")
    .eq("date", date)
    .neq("status", "Cancelado");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ occupied: data.map(item => item.time) });
}
