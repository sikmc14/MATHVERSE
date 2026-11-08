@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
echo ==========================================
echo        MATHVERSE - تشغيل المشروع
echo ==========================================
where node >nul 2>nul
if errorlevel 1 (
  echo لم يتم العثور على Node.js. ثبّت إصدار Node.js 20.19 أو أحدث من https://nodejs.org ثم أعد تشغيل هذا الملف.
  pause
  exit /b 1
)
if not exist node_modules (
  echo جاري تثبيت ملفات المشروع لأول مرة... قد يستغرق ذلك عدة دقائق.
  call npm install
  if errorlevel 1 (
    echo فشل تثبيت المكتبات. تحقق من اتصال الإنترنت ثم حاول مرة أخرى.
    pause
    exit /b 1
  )
)
echo جاري تشغيل MATHVERSE...
echo افتح المتصفح على: http://localhost:3000
call npm run dev
pause
