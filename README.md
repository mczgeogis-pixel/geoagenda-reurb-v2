# GEOAgenda REURB — versão para publicação

Sistema web com:

- página pública de agendamento;
- bloqueio de horários ocupados;
- banco de dados Supabase;
- login administrativo;
- painel de controle;
- responsável e status;
- pendências documentais;
- WhatsApp;
- exportação CSV;
- layout responsivo.

## 1. Criar o banco de dados

1. Crie um projeto no Supabase.
2. Abra **SQL Editor**.
3. Copie e execute `supabase/schema.sql`.
4. Em **Authentication > Users**, crie o usuário administrativo da Sarah.

## 2. Configurar as chaves

Copie `.env.example` para `.env.local` e preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_WHATSAPP_NUMBER=
```

A chave `SUPABASE_SERVICE_ROLE_KEY` é secreta e nunca deve ser enviada por WhatsApp ou colocada no navegador.

## 3. Rodar no computador

Instale Node.js e execute:

```bash
npm install
npm run dev
```

Abra:

- Página pública: `http://localhost:3000`
- Painel: `http://localhost:3000/painel`

## 4. Publicar na Vercel

1. Coloque esta pasta em um repositório GitHub.
2. Importe o repositório na Vercel.
3. Cadastre as quatro variáveis de ambiente.
4. Clique em Deploy.
5. Depois conecte o domínio desejado, como:
   `agendamento.minhacasalegal.com.br`

## Atenção antes do uso real

Este pacote é uma base funcional pronta para configuração, mas a publicação exige acesso às contas do Supabase, Vercel e ao domínio da empresa.

Antes de utilizar com dados reais, peça à TI para:
- revisar a proteção das rotas administrativas;
- configurar cookies de sessão no servidor;
- criar política de privacidade e aviso LGPD;
- definir backup, retenção e perfis de acesso;
- usar domínio e contas institucionais.

A página pública não solicita quadra, lote ou etapa, conforme solicitado.
