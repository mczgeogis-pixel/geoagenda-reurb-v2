# GEOAgenda REURB — versão estável para Vercel

Projeto sem dependências externas no build. Usa HTML/CSS/JS e funções nativas da Vercel.

Variáveis necessárias na Vercel:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- SUPABASE_SECRET_KEY

Rotas:
- `/` página pública
- `/painel` painel administrativo

O usuário administrador deve existir em Supabase > Authentication > Users.
