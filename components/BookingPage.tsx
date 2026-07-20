"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, LockKeyhole, MessageCircle, ShieldCheck } from "lucide-react";
import { TIMES } from "@/lib/constants";

type FormData = {
  name: string; cpf: string; phone: string; district: string;
  address: string; reference: string; notes: string;
};

const initialForm: FormData = {
  name: "", cpf: "", phone: "", district: "", address: "", reference: "", notes: ""
};

function isoLocal(date: Date) {
  const copy = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return copy.toISOString().slice(0, 10);
}

function formatDate(value: string) {
  return new Date(value + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "long", day: "2-digit", month: "long"
  });
}

export default function BookingPage() {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [occupied, setOccupied] = useState<string[]>([]);
  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const dates = useMemo(() => {
    const result: Date[] = [];
    const today = new Date();
    for (let i = 1; result.length < 10 && i < 40; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      if (date.getDay() > 0 && date.getDay() < 6) result.push(date);
    }
    return result;
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    fetch(`/api/availability?date=${selectedDate}`)
      .then(r => r.json())
      .then(data => setOccupied(data.occupied ?? []))
      .catch(() => setOccupied([]));
  }, [selectedDate]);

  const update = (key: keyof FormData, value: string) =>
    setForm(current => ({ ...current, [key]: value }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSuccess("");
    if (!selectedDate || !selectedTime) {
      alert("Escolha a data e o horário.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, date: selectedDate, time: selectedTime }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível agendar.");

      setSuccess(`Agendamento confirmado para ${formatDate(selectedDate)}, às ${selectedTime}.`);
      setForm(initialForm);
      setSelectedTime("");
      setOccupied(current => [...current, selectedTime]);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao realizar o agendamento.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="public-shell">
      <header className="public-header">
        <img src="/logo-geogis.png" alt="GEOGIS" className="public-logo" />
        <span className="secure-badge"><LockKeyhole size={14} /> Agendamento seguro</span>
      </header>

      <div className="public-grid">
        <section className="hero-copy">
          <span className="program-badge">PROGRAMA MINHA CASA LEGAL</span>
          <h1>Agende sua visita<br /><strong>sem complicação.</strong></h1>
          <p>Escolha uma data e um horário disponível para receber a equipe de cadastro e visita social em sua residência.</p>

          <div className="benefit-row">
            {["Gratuito", "Rápido", "Fácil pelo celular"].map(item => (
              <span key={item}><i><Check size={14} /></i>{item}</span>
            ))}
          </div>

          <div className="whatsapp-card">
            <MessageCircle size={25} />
            <div>
              <b>Recebeu este link pelo WhatsApp?</b>
              <small>Use o mesmo número no preenchimento para facilitar o contato da equipe.</small>
            </div>
          </div>
        </section>

        <section className="booking-card">
          <div className="booking-title">
            <div>
              <span>AGENDAMENTO ONLINE</span>
              <h2>Escolha seu atendimento</h2>
            </div>
            <em>3 etapas</em>
          </div>

          <section className="booking-section">
            <div className="step-title"><b>1</b><div><strong>Escolha a data</strong><small>Somente dias úteis disponíveis.</small></div></div>
            <div className="date-grid">
              {dates.map(date => {
                const value = isoLocal(date);
                return (
                  <button key={value} className={selectedDate === value ? "choice selected" : "choice"}
                    onClick={() => { setSelectedDate(value); setSelectedTime(""); }}>
                    {date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}
                    <strong>{date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</strong>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="booking-section">
            <div className="step-title"><b>2</b><div><strong>Escolha o horário</strong><small>Atendimento das 8h às 17h, sem horário às 12h.</small></div></div>
            {!selectedDate ? <p className="field-hint">Selecione uma data para visualizar os horários.</p> :
              <div className="time-grid">
                {TIMES.map(time => {
                  const unavailable = occupied.includes(time);
                  return (
                    <button key={time} disabled={unavailable}
                      className={`choice ${selectedTime === time ? "selected" : ""} ${unavailable ? "disabled" : ""}`}
                      onClick={() => setSelectedTime(time)}>
                      {unavailable ? `${time} ocupado` : time}
                    </button>
                  );
                })}
              </div>
            }
          </section>

          <section className="booking-section">
            <div className="step-title"><b>3</b><div><strong>Preencha seus dados</strong><small>As informações serão usadas apenas para o atendimento.</small></div></div>
            <form onSubmit={submit} className="booking-form">
              <label className="full">Nome completo<input required value={form.name} onChange={e => update("name", e.target.value)} /></label>
              <label>CPF<input required value={form.cpf} onChange={e => update("cpf", e.target.value)} /></label>
              <label>WhatsApp<input required value={form.phone} onChange={e => update("phone", e.target.value)} /></label>
              <label>Bairro<input required value={form.district} onChange={e => update("district", e.target.value)} /></label>
              <label className="full">Endereço completo<input required value={form.address} onChange={e => update("address", e.target.value)} /></label>
              <label className="full">Ponto de referência<input required value={form.reference} onChange={e => update("reference", e.target.value)} /></label>
              <label className="full">Observação <small>(opcional)</small><textarea rows={3} value={form.notes} onChange={e => update("notes", e.target.value)} /></label>

              <div className="selection-box full">
                <CalendarDays size={22} />
                <div><small>Data e horário escolhidos</small>
                  <strong>{selectedDate && selectedTime ? `${formatDate(selectedDate)}, às ${selectedTime}` : "Nenhum horário selecionado"}</strong>
                </div>
              </div>

              <button className="primary-button full" disabled={loading}>
                {loading ? "Enviando..." : "Confirmar agendamento"}
              </button>
            </form>

            {success && <div className="success-box"><ShieldCheck size={22} /><div><b>Agendamento realizado!</b><p>{success}</p></div></div>}
          </section>
        </section>
      </div>
    </main>
  );
}
