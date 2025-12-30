@echo off
echo Verificando processos na porta 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
    echo Encerrando processo PID %%a...
    taskkill /PID %%a /F
    echo Processo encerrado!
)
pause

