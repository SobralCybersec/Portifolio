@echo off
echo ========================================
echo    Deploy to Vercel
echo ========================================
echo.

echo [1/3] Verificando Vercel CLI...
vercel --version >nul 2>&1
if errorlevel 1 (
    echo Instalando Vercel CLI...
    pnpm add --global vercel
)

echo [2/3] Limpando build anterior...
if exist .next rmdir /s /q .next
if exist .vercel rmdir /s /q .vercel

echo [3/3] Fazendo deploy...
vercel --prod

echo.
echo Deploy concluido!
echo.
pause
