"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarDays, Download, LogOut, MessageCircle, Plus, Search, Users } from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase-browser";
import { PENDENCIES, STATUSES, TEAM, TIMES } from "@/lib/constants";
import type { Appointment } from "@/lib/types";

const empty = {
  name:"", cpf:"", phone:"", district:"", address:"", reference:"",
  date:"", time:"08:00", assigned_to:"Não atribuído", status:"Agendado",
  notes:"", pendencies:[] as string[]
};

export default function AdminPanel() {
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [sessionReady, setSessionReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [items, setItems] = useState<Appointment[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [person, setPerson] = useState("");
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(empty);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthenticated(Boolean(data.session));
      setSessionReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setAuthenticated(Boolean(session)));
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => { if (authenticated) loadItems(); }, [authenticated]);

  async function loadItems() {
    const response = await fetch("/api/appointments");
    if (response.ok) setItems(await response.json());
  }

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError("E-mail ou senha incorretos.");
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  async function patch(id: string, payload: Partial<Appointment>) {
    const response = await fetch(`/api/appointments/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) loadItems();
  }

  async function remove(id: string) {
    if (!confirm("Excluir este atendimento?")) return;
    const response = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
    if (response.ok) loadItems();
  }

  function openNew() {
    setEditingId(null); setDraft({ ...empty, date: new Date().toISOString().slice(0,10) }); setModal(true);
  }

  function openEdit(item: Appointment) {
    setEditingId(item.id);
    setDraft({
      name:item.name, cpf:item.cpf, phone:item.phone, district:item.district,
      address:item.address, reference:item.reference, date:item.date, time:item.time,
      assigned_to:item.assigned_to, status:item.status, notes:item.notes || "",
      pendencies:item.pendencies || []
    });
    setModal(true);
  }

  async function saveDraft() {
    const method = editingId ? "PATCH" : "POST";
    const url = editingId ? `/api/appointments/${editingId}` : "/api/appointments";
    const response = await fetch(url, {
      method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft)
    });
    if (!response.ok) {
      const data = await response.json();
      alert(data.error || "Não foi possível salvar.");
      return;
    }
    setModal(false);
    loadItems();
  }

  const filtered = items.filter(item => {
    const haystack = Object.values(item).flat().join(" ").toLowerCase();
    return (!search || haystack.includes(search.toLowerCase())) &&
      (!status || item.status === status) &&
      (!person || item.assigned_to === person);
  });

  const today = new Date().toISOString().slice(0,10);
  const active = items.filter(i => i.status !== "Cancelado");
  const stats = [
    ["Total ativo", active.length],
    ["Hoje", active.filter(i => i.date === today).length],
    ["Sem responsável", active.filter(i => i.assigned_to === "Não atribuído").length],
    ["Com pendência", active.filter(i => i.pendencies?.length).length],
    ["Realizados", items.filter(i => i.status === "Realizado").length],
  ];

  function exportCsv() {
    const rows = [["Data","Hora","Nome","CPF","WhatsApp","Bairro","Endereço","Referência","Responsável","Status","Pendências"]];
    items.forEach(i => rows.push([i.date,i.time,i.name,i.cpf,i.phone,i.district,i.address,i.reference,i.assigned_to,i.status,(i.pendencies||[]).join("; ")]));
    const csv = rows.map(row => row.map(v => `"${String(v).replaceAll('"','""')}"`).join(";")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\ufeff"+csv], {type:"text/csv;charset=utf-8"}));
    a.download = "agendamentos-reurb.csv";
    a.click();
  }

  if (!sessionReady) return <div className="center-screen">Carregando...</div>;

  if (!authenticated) return (
    <main className="login-shell">
      <form className="login-card" onSubmit={login}>
        <img src="/logo-geogis.png" alt="GEOGIS" />
        <h1>Acesso ao painel</h1>
        <p>Entre com o usuário administrativo cadastrado no Supabase.</p>
        <label>E-mail<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} /></label>
        <label>Senha<input type="password" required value={password} onChange={e=>setPassword(e.target.value)} /></label>
        <button className="primary-button">Entrar</button>
        {error && <span className="login-error">{error}</span>}
      </form>
    </main>
  );

  return (
    <main className="admin-shell">
      <aside className="sidebar">
        <img src="/logo-geogis.png" alt="GEOGIS" />
        <nav>
          <a className="active"><BarChart3 size={18}/> Dashboard</a>
          <a><CalendarDays size={18}/> Agenda</a>
          <a><Users size={18}/> Equipe</a>
        </nav>
        <button onClick={logout}><LogOut size={17}/> Sair</button>
      </aside>

      <section className="admin-content">
        <header className="admin-header">
          <div><span>PAINEL INTERNO</span><h1>Controle de Agendamentos</h1><p>Acompanhe, atribua responsáveis e atualize cada atendimento.</p></div>
          <div className="header-actions">
            <a href="/" className="secondary-button">Ver página pública</a>
            <button className="primary-small" onClick={openNew}><Plus size={17}/> Novo agendamento</button>
          </div>
        </header>

        <div className="stats-grid">
          {stats.map(([label,value]) => <article key={String(label)}><span>{label}</span><strong>{value}</strong></article>)}
        </div>

        <section className="data-panel">
          <div className="panel-header">
            <div><h2>Agendamentos recebidos</h2><p>Novos cadastros aparecem aqui após serem enviados pelo requerente.</p></div>
            <button className="secondary-button" onClick={exportCsv}><Download size={16}/> Exportar CSV</button>
          </div>

          <div className="filters">
            <label className="search-field"><Search size={17}/><input placeholder="Buscar nome, CPF, telefone ou bairro" value={search} onChange={e=>setSearch(e.target.value)}/></label>
            <select value={status} onChange={e=>setStatus(e.target.value)}><option value="">Todos os status</option>{STATUSES.map(x=><option key={x}>{x}</option>)}</select>
            <select value={person} onChange={e=>setPerson(e.target.value)}><option value="">Todos os responsáveis</option>{TEAM.map(x=><option key={x}>{x}</option>)}</select>
          </div>

          <div className="table-scroll">
            <table>
              <thead><tr><th>Data/hora</th><th>Requerente</th><th>Endereço</th><th>Responsável</th><th>Status</th><th>Pendência</th><th>Ações</th></tr></thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id}>
                    <td><b>{new Date(item.date+"T12:00").toLocaleDateString("pt-BR")}</b><small>{item.time}</small></td>
                    <td><b>{item.name}</b><small>{item.phone} • CPF {item.cpf}</small></td>
                    <td>{item.address}<small>{item.district} • Ref.: {item.reference}</small></td>
                    <td><select value={item.assigned_to} onChange={e=>patch(item.id,{assigned_to:e.target.value})}>{TEAM.map(x=><option key={x}>{x}</option>)}</select></td>
                    <td><select value={item.status} onChange={e=>patch(item.id,{status:e.target.value})}>{STATUSES.map(x=><option key={x}>{x}</option>)}</select></td>
                    <td>{item.pendencies?.length ? item.pendencies.join(", ") : <small>Sem pendência</small>}</td>
                    <td className="actions-cell">
                      <a className="wa-action" target="_blank" href={`https://wa.me/55${item.phone.replace(/\D/g,"")}?text=${encodeURIComponent(`Olá, ${item.name}! Entramos em contato sobre seu atendimento do Programa Minha Casa Legal em ${new Date(item.date+"T12:00").toLocaleDateString("pt-BR")} às ${item.time}.`)}`}><MessageCircle size={15}/></a>
                      <button onClick={()=>openEdit(item)}>Editar</button>
                      <button className="danger" onClick={()=>remove(item.id)}>Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!filtered.length && <div className="empty-state">Nenhum agendamento encontrado.</div>}
        </section>
      </section>

      {modal && <div className="modal-backdrop" onMouseDown={e=>{if(e.currentTarget===e.target)setModal(false)}}>
        <div className="modal-card">
          <div className="modal-title"><h2>{editingId ? "Editar atendimento" : "Novo atendimento"}</h2><button onClick={()=>setModal(false)}>×</button></div>
          <div className="modal-grid">
            {[
              ["name","Nome"],["cpf","CPF"],["phone","WhatsApp"],["district","Bairro"],
              ["address","Endereço"],["reference","Referência"]
            ].map(([key,label])=><label key={key} className={key==="address"||key==="reference"?"full":""}>{label}<input value={(draft as any)[key]} onChange={e=>setDraft({...draft,[key]:e.target.value})}/></label>)}
            <label>Data<input type="date" value={draft.date} onChange={e=>setDraft({...draft,date:e.target.value})}/></label>
            <label>Horário<select value={draft.time} onChange={e=>setDraft({...draft,time:e.target.value})}>{TIMES.map(x=><option key={x}>{x}</option>)}</select></label>
            <label>Responsável<select value={draft.assigned_to} onChange={e=>setDraft({...draft,assigned_to:e.target.value})}>{TEAM.map(x=><option key={x}>{x}</option>)}</select></label>
            <label>Status<select value={draft.status} onChange={e=>setDraft({...draft,status:e.target.value})}>{STATUSES.map(x=><option key={x}>{x}</option>)}</select></label>
            <label className="full">Observação<textarea rows={3} value={draft.notes} onChange={e=>setDraft({...draft,notes:e.target.value})}/></label>
            <div className="full"><b className="field-label">Pendências documentais</b><div className="checks">{PENDENCIES.map(p=><label key={p}><input type="checkbox" checked={draft.pendencies.includes(p)} onChange={e=>setDraft({...draft,pendencies:e.target.checked?[...draft.pendencies,p]:draft.pendencies.filter(x=>x!==p)})}/>{p}</label>)}</div></div>
          </div>
          <button className="primary-button" onClick={saveDraft}>Salvar atendimento</button>
        </div>
      </div>}
    </main>
  );
}
