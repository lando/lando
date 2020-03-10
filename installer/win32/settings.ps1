#!/
#
# MCFLY YOU BOJO! YOU KNOW HOVERBOARDS DON'T FLOAT ON WATER!
# UNLESS YOU'VE GOT POWER!!!!.... shell
#
# A script to modify docker config
# PowerShell.exe -ExecutionPolicy Bypass -File settings.ps1
#

# Get path to settings File
$docker_settings = "$env:APPDATA\Docker\settings.json"

# Wait a bit until we can ensure the settings file exists
Start-Sleep -Seconds 5

# Exit but dont fail if we cant find 
if (!(Test-Path "$docker_settings"))
{
  exit 0
}

# Start the settings update
Write-Output "Settings file exists at $docker_settings!"
$settings = Get-Content "$docker_settings" -raw | ConvertFrom-Json

# Disabling automatic update checking
Write-Output "Disabling automatic update checking..."
$settings.checkForUpdates = $false

# Dumping new settings
Write-Output $settings
$settings | ConvertTo-Json -depth 32| set-content "$docker_settings"