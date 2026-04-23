# Torciblox (TBX) — Product Requirements

## Original Problem Statement
Loja online para torcidas organizadas / comunidade de jogo. Identidade visual preto + branco com textura grunge/street, tipografia graffiti nos títulos (Bangers/Permanent Marker) + Poppins no corpo, raios brancos nos cantos, botões escuros com leve glow. Grid por categoria em 2 colunas mobile, preços grandes em branco, botão "Comprar agora". Carrinho funcional com múltiplos itens, checkout via Pix (chave copia-e-cola + confirmação via WhatsApp), painel administrativo com login.

## User Personas
- **Cliente (Torcida/Organizada)** — navega pelo catálogo, adiciona itens ao carrinho, gera pedido com Pix e confirma via WhatsApp.
- **Admin TBX** — gerencia catálogo (CRUD de produtos) e acompanha pedidos (altera status pending → paid → delivered).

## Core Requirements (static)
- 8 categorias: Serviços, Torcoins, Sistema, Fardamentos, Itens Mensais, Itens 30 Dias, Itens Wipe, Acesso.
- Pagamento via Pix manual (sem gateway automático) — chave copia-e-cola + confirmação por WhatsApp.
- Contato oficial: WhatsApp 11949850080, Discord https://discord.gg/QdgCXuGJNK.
- Paleta: preto/cinza base, branco principal, roxo (Discord) como único destaque. Sem verde.

## What's been implemented (2025-12)
- Backend FastAPI (server.py): auth JWT + bcrypt, seed admin automático, CRUD produtos, criação/listagem/status de pedidos, endpoint público /api/config.
- Migration automática Brasas → Torcoins em on_startup.
- 26 produtos seedados com preços conforme briefing.
- Frontend React: Home com hero + 8 seções por categoria, ProductCard com imagem temática por categoria + ícone lucide grande + título em graffiti, CartDrawer, CheckoutModal com geração de código TBX-XXXXXX e copy de chave Pix + WhatsApp, SupportFab, Footer.
- Páginas admin: /admin/login e /admin (abas Produtos e Pedidos).
- Testing agent passou 100% backend (15/15) + todos os fluxos frontend validados.

## Admin Credentials
- Email: admin@torciblox.gg
- Senha: torciblox2025
- Arquivo: /app/memory/test_credentials.md

## Backlog (prioritized)
- P1: Gateway Pix automático (Mercado Pago / Asaas) com geração de QR dinâmico e webhook de confirmação.
- P1: Upload de imagens reais por produto (substituir placeholders) + compressão no backend.
- P2: Cupons de desconto e combos (ex: Fardamentos volume).
- P2: Notificação automática para o admin (Discord webhook) a cada pedido novo.
- P2: Histórico do cliente por WhatsApp (lookup de pedidos anteriores).
- P3: SEO/meta tags por categoria e sitemap.
- P3: Analytics (GA4) e tracking de eventos adicionar-ao-carrinho / gerar-pix.

## Next Tasks
- Integrar gateway Pix real (requer chaves do Mercado Pago/Asaas).
- Permitir upload de imagem do produto no admin.
- Webhook Discord para notificar pedidos novos.

## Update (2025-12) — Imagens IA + Chave Pix real
- Chave Pix atualizada para **31990667635** (telefone) em /app/backend/.env
- Integração **Gemini Nano Banana** (gemini-3.1-flash-image-preview) via Emergent LLM Key para geração automática de imagens dos 26 produtos
- Auto-geração dispara em background no startup se houver produtos sem imagem
- Admin tem botões: "Gerar imagens faltantes" (batch) e ícone por produto para regenerar individualmente
- Endpoints: POST /api/admin/generate-images (batch background), POST /api/admin/products/{id}/regenerate-image
- Arquivos servidos em /api/static/products/{id}.png
