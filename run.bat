@echo off
title UMKM Korowelang Kulon - Local Development Server
echo ===================================================
echo   MEMULAI SERVER LOCALHOST UMKM KOROWELANG KULON
echo ===================================================
echo.

echo [1/2] Menjalankan Backend Express (Port 5000)...
start "Backend API Server (Port 5000)" cmd /k "cd backend && npm run dev"

echo [2/2] Menjalankan Frontend Next.js (Port 3000)...
start "Frontend Next.js (Port 3000)" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo   SERVER BERHASIL DIJALANKAN!
echo   - Website Utama : http://localhost:3000
echo   - Backend API   : http://localhost:5000
echo ===================================================
echo Jendela terminal backend & frontend telah dibuka.
echo.
pause
