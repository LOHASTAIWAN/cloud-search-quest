@echo off
chcp 65001 >nul
echo ========================================================
echo   CyberCloud 雲端神搜特工隊 - Cloudflare 一鍵部署小幫手
echo ========================================================
echo.
echo [1/3] 正在檢查 Cloudflare 登入狀態...
call npx wrangler whoami >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo 尚未登入 Cloudflare，正在為您開啟登入視窗...
    echo (瀏覽器將跳出授權頁面，請點選 Allow 授權)
    call npx wrangler login
) else (
    echo [OK] 已成功辨識您的 Cloudflare 帳號！
)

echo.
echo [2/3] 正在將後端 API 服務 (worker.js) 部署至 Cloudflare...
call npx wrangler deploy

echo.
echo ========================================================
echo [3/3] 部署完成！
echo 請複製上方終端顯示的 Worker 網址 (例如 https://cybercloud-backend.xxxx.workers.dev)
echo 到網頁右上角「教師後台」->「Cloudflare 串接設定」貼上即可自動連動！
echo ========================================================
echo.
pause
