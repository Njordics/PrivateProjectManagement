@echo off
setlocal
cd /d "%~dp0"
set PORT=51001

if not exist ".venv" (
    echo Creating virtual environment...
    python -m venv .venv  || goto :error
)

call ".venv\Scripts\activate"
echo Installing requirements (if needed)...
pip install -r requirements.txt  || goto :error

echo Starting Project Manager on http://127.0.0.1:51001
python app.py
goto :eof

:error
echo.
echo Failed to start. See messages above.
pause
exit /b 1
