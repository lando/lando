#!/
#
# MCFLY YOU BOJO! YOU KNOW HOVERBOARDS DON'T FLOAT ON WATER!
# UNLESS YOU'VE GOT POWER!!!!.... shell
#
# A script to modify docker config
# PowerShell.exe -ExecutionPolicy Bypass -File settings.ps1
#

# Get paths to things
$docker = "$env:ProgramFiles\Docker\Docker\resources\bin\docker.exe"
$docker_desktop = "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe"
$docker_settings = "$env:APPDATA\Docker\settings.json"

# Boot up docker desktop
Start-Process "$docker_desktop"

while (!(Test-Path "$docker_settings"))
{
  Start-Sleep -s 10
}

# Start the settings update
Write-Output "Settings file exists at $docker_settings!"
$settings = Get-Content "$docker_settings" -raw | ConvertFrom-Json

# Disabling automatic update checking
Write-Output "Disabling automatic update checking..."
$settings.checkForUpdates = $false
Write-Output "Disabling first run tutorial..."
$settings.displayedTutorial = $true

# Dumping new settings
Write-Output $settings
$settings | ConvertTo-Json -depth 32 | set-content "$docker_settings"
