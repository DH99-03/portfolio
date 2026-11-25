@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================
echo  Portfolio site upload (git add / commit / push)
echo ============================================
echo.
echo [1/3] Changed files
git status --short
echo.
echo [2/3] Commit
git add -u
git add assets pdf
git commit -m "Update portfolio: add Mirigabom, VeriOrder hackathon, role versions, PDFs"
echo.
echo [3/3] Push to GitHub
git push origin main
echo.
if errorlevel 1 (
  echo [FAILED] Push did not finish. Copy the message above and send it to Claude.
) else (
  echo [OK] Uploaded. Check https://dh99-03.github.io/portfolio/ in 1-2 minutes.
)
echo.
pause
