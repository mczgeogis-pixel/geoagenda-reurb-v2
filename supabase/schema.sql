create extension if not exists pgcrypto;

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  time text not null check (time in ('08:00','09:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00')),
  name text not null,
  cpf text not null,
  phone text not null,
  district text not null,
  address text not null,
  reference text not null,
  notes text,
  assigned_to text not null default 'Não atribuído',
  status text not null default 'Agendado',
  pendencies text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists appointments_active_slot_unique
on public.appointments(date, time)
where status <> 'Cancelado';

alter table public.appointments enable row level security;

-- A tabela não recebe políticas públicas diretas.
-- O cadastro público e o painel acessam o banco por rotas seguras no servidor.
