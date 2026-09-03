#!/bin/bash

echo "========================================"
echo "    Deploy to Vercel"
echo "========================================"
echo ""

echo "[1/3] Verificando Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    echo "Instalando Vercel CLI..."
    pnpm add --global vercel
fi

echo "[2/3] Limpando build anterior..."
rm -rf .next .vercel

echo "[3/3] Fazendo deploy..."
vercel --prod

echo ""
echo "Deploy concluido!"
echo ""
