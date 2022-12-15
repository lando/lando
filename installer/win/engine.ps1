#!/
#
# MCFLY YOU BOJO! YOU KNOW HOVERBOARDS DON'T FLOAT ON WATER!
# UNLESS YOU'VE GOT POWER!!!!.... shell
#
# A script to modify docker config
# PowerShell.exe -ExecutionPolicy Bypass -File settings.ps1
#

# Get paths to things
$docker_desktop = "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe"

# Boot up docker desktop
Start-Process "$docker_desktop"

while (!(Test-Path "$docker_settings"))
{
  Start-Sleep -s 10
}
