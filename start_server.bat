@echo off
chcp 65001 >nul
echo ========================================================
echo   CyberCloud 雲端神搜特工隊 - 本機快速啟動器
echo ========================================================
echo.
echo [1/2] 正在啟動本機伺服器 (Port: 8080)...
start "" http://localhost:8080/index.html
python -m http.server 8080
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo 未偵測到 Python，改以預設瀏覽器直接開啟 index.html...
    start "" "index.html"
)
pause
