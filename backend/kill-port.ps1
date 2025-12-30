# Script para encerrar processo na porta 3001
$port = 3001
$process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

if ($process) {
    $pid = $process.OwningProcess
    Write-Host "Encerrando processo PID $pid na porta $port..."
    Stop-Process -Id $pid -Force
    Write-Host "Processo encerrado com sucesso!"
} else {
    Write-Host "Nenhum processo encontrado na porta $port"
}

