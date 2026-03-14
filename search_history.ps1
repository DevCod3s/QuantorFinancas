$path1 = "C:\Users\devel\AppData\Roaming\Code\User\History"
$path2 = "C:\Users\devel\AppData\Roaming\Cursor\User\History"
$paths = @($path1, $path2)

foreach ($path in $paths) {
  if (Test-Path $path) {
    Write-Host "Verificando $path:"
    Get-ChildItem -Path $path -Recurse -File | 
      Where-Object { $_.Length -gt 150000 -and $_.Length -lt 200000 } | 
      Sort-Object LastWriteTime -Descending | 
      Select-Object -First 30 FullName, LastWriteTime, Length | 
      Format-Table -AutoSize
  }
}
