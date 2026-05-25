@echo off
title CarlosCostaPrev — Gerador de Post

REM ── Chaves de API ────────────────────────────────────────────────────────────
set ANTHROPIC_API_KEY=SUA_CHAVE_AQUI
set PEXELS_API_KEY=JP2seZCGS31sO0ASFBNlIQucFQA8QCFVxqJP3j6Rfx6tUp6lHUfNPwRn

REM ── Executar script ───────────────────────────────────────────────────────────
cd /d "C:\Users\NIKE\carloscostaprev-site"
node scripts\gerar-post.js >> scripts\log.txt 2>&1
