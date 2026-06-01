# Install Impeccable skills into .cursor/skills (Windows-friendly).
# Official `npx impeccable skills install` needs `unzip`; this uses Git sparse checkout instead.
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Vendor = Join-Path $Root "_vendor-impeccable"
$SkillsDest = Join-Path $Root ".cursor\skills"

if (Test-Path $Vendor) { Remove-Item $Vendor -Recurse -Force }

Write-Host "Cloning impeccable (.cursor/skills only)..."
git clone --depth 1 --filter=blob:none --sparse https://github.com/pbakaus/impeccable.git $Vendor
Push-Location $Vendor
git sparse-checkout set ".cursor/skills"
Pop-Location

New-Item -ItemType Directory -Path $SkillsDest -Force | Out-Null
Copy-Item -Path (Join-Path $Vendor ".cursor\skills\*") -Destination $SkillsDest -Recurse -Force
Remove-Item $Vendor -Recurse -Force

Write-Host "Installed: $SkillsDest\impeccable"
Write-Host "Run /impeccable init in Cursor after setup."
