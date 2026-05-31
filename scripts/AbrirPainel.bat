@echo off
title Painel de Conteúdo — CarlosCostaPrev
cd /d "C:\Users\NIKE\carloscostaprev-site"
node scripts\distribuir.js
start "" "scripts\social\painel.html"
