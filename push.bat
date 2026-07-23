@echo off
title Push Commit ke GitHub Repository
echo ========================================================
echo   AUTOMATION PUSH COMMIT TO GITHUB REPOSITORY
echo   Repo: https://github.com/Amirul-Hasan99/WEB-UMKM-DESA-KOROWELANG-KULON
echo ========================================================
echo.

:: Check Git installation
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git tidak ditemukan! Pastikan Git telah terinstall di komputer Anda.
    echo Unduh Git di: https://git-scm.com/
    pause
    exit /b
)

:: Initialize Git if not initialized
if not exist ".git" (
    echo [1/5] Inisialisasi Repository Git Local...
    git init
    git branch -M main
    git remote add origin https://github.com/Amirul-Hasan99/WEB-UMKM-DESA-KOROWELANG-KULON.git
) else (
    echo [1/5] Repository Git lokal sudah terinisialisasi.
    git remote set-url origin https://github.com/Amirul-Hasan99/WEB-UMKM-DESA-KOROWELANG-KULON.git
)

echo.
echo [2/5] Menambahkan seluruh file perubahan (git add .)...
git add .

echo.
set /p commit_msg="[3/5] Masukkan Pesan Commit (atau tekan ENTER untuk default): "
if "%commit_msg%"=="" (
    set commit_msg=Update Website Portal UMKM Desa Korowelang Kulon
)

echo.
echo Memuat commit dengan pesan: "%commit_msg%"...
git commit -m "%commit_msg%"

echo.
echo [4/5] Mengatur branch utama ke 'main'...
git branch -M main

echo.
echo [5/5] Mengunggah commit ke GitHub (git push origin main)...
git push -u origin main

echo.
echo ========================================================
echo   PROSES PUSH SELESAI!
echo   Periksa repository Anda di:
echo   https://github.com/Amirul-Hasan99/WEB-UMKM-DESA-KOROWELANG-KULON
echo ========================================================
echo.
pause
