$zip = Join-Path $PSScriptRoot 'smart-lorem-ipsum.zip'
if (Test-Path $zip) { Remove-Item $zip }

Add-Type -Assembly System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::Open($zip, 'Create')

$base = Join-Path $PSScriptRoot 'extension'
$files = Get-ChildItem -Path $base -Recurse -File | Where-Object { $_.FullName -notmatch '\\src\\' }

foreach ($f in $files) {
  $entry = $f.FullName.Substring($base.Length + 1).Replace('\', '/')
  [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $f.FullName, $entry) | Out-Null
}
$archive.Dispose()
Write-Host "ZIP created: $((Get-Item $zip).Length) bytes"
