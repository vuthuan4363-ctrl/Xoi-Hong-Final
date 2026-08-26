@echo off
setlocal
cd /d "%~dp0"

echo ============================================================
echo          XOI VIET DUONG DAI - LOCAL SERVER
echo ============================================================
echo.
echo Dang khoi dong server bang Node.js (npx http-server)...
echo.
echo Sau khi server chay xong:
echo   May tinh nay            : http://localhost:8000
echo   Dien thoai (cung Wi-Fi) : dung dia chi IPv4 cua may tinh + :8000
echo.
echo De xem IPv4 cua may tinh, mo CMD moi va go: ipconfig
echo (Tim dong "IPv4 Address" trong phan Wi-Fi dang dung)
echo.
echo Nhan Ctrl+C trong cua so nay de dung server.
echo ------------------------------------------------------------
echo.

start "" http://localhost:8000
npx http-server . -p 8000 -a 0.0.0.0 -c-1

echo.
echo Server da dung. Dong cua so nay hoac nhan phim bat ky de thoat.
pause >nul
