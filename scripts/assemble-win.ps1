#!/
#
# MCFLY YOU BOJO! YOU KNOW HOVERBOARDS DON'T FLOAT ON WATER!
# UNLESS YOU'VE GOT POWER!!!!.... shell
#
# A script to build Lando on win32
#
$ErrorActionPreference = "Stop"

# Set defaults
$lando_pkg = Get-Content "package.json" | Out-String | ConvertFrom-Json
$lando_version = $lando_pkg.version
$lando_cli_version = $env:LANDO_CLI_VERSION
$docker_version = $env:DOCKER_DESKTOP_VERSION
$docker_build = $env:DOCKER_DESKTOP_BUILD

# Get some ENV things for certs
$temp_dir = $env:TMP
$cert_data = $env:WINDOZE_CERTS_DATA
$cert_password = $env:WINDOZE_CERTS_PASSWORD
$cert_secure_password = $null

# Download urls
$default_docker_url="https://desktop.docker.com/mac/stable/amd64/$docker_build/Docker.dmg"
$default_lando_url="https://files.lando.dev/lando-win-x64-$lando_cli_version"

# Installer things
$base_dir = "$pwd\build\installer"
$bundle_dir = "$base_dir\bundle"
$gui_dir = "$bundle_dir\gui"
$docs_dir = "$bundle_dir\docs"
$bin_dir = "$bundle_dir\bin"
$plugins_dir = "$bundle_dir\plugins"
$installer_args = "/DMyAppVersion=$lando_version /DDockerVersion=$docker_version"

# Build dependencies
$inno_url = "http://www.jrsoftware.org/download.php/is.exe"
$inno_dest = "$temp_dir\inno-installer.exe"
$inno_bin = "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe"

# Handle params
param (
  [string]$docker_url = $default_docker_url,
  [string]$lando_url = $default_lando_url
)

# Install helper
function InstallExe($file)
{
  Write-Output "Installing $file..."
  #Start-Process -Wait $file $arguments
  $arguments = '/SP /SILENT /VERYSILENT /SUPRESSMSGBOXES /NOCANCEL /NOREBOOT /NORESTART /CLOSEAPPLICATIONS'
  Start-Process -Wait $file $arguments
  Write-Output "Installed with $file"
}

# Download helper
function Download($url, $destination)
{
  [Net.ServicePointManager]::SecurityProtocol = 'Ssl3, Tls, Tls11, Tls12'
  $webclient = New-Object System.Net.WebClient
  Write-Output "Downloading $url to $destination..."
  $webclient.DownloadFile($url, $destination)
  Write-Output "Downloaded."
}

# Get some basic feedback on things
Write-Output "Building with Docker from $docker_url"
Write-Output "Building with Lando from $lando_url"

# Prep our workspace
Remove-Item -LiteralPath "$base_dir" -Force -Recurse
New-Item -type directory "$base_dir"
# Copy installer assets
Copy-Item -Path "$pwd/installer/win/*" -Destination "$base_dir" -Recurse
Dir -Recurse c:\path\ | Get-Childitem

# Make sure our dependencies are installed
If (!(Test-Path $inno_bin)) {
  Write-Output "Grabbing and installing some needed dependencies..."
  Download -Url $inno_url -Destination $inno_dest
  InstallExe -File $inno_dest
}

# Get the things we need
New-Item -type directory -force -path $bundle_dir, $docs_dir, $bin_dir, $plugins_dir, $gui_dir
Write-Output "Grabbing the files we need..."
# Lando CLI
# NOTE: this should already be signed so we omit
Download -Url "$lando_url" -Destination "$bin_dir\lando.exe"
# Docker Desktop
Download -Url "$docker_url" -Destination "$base_dir\Docker.exe"

# Copy over some other assets
Write-Output "Copying over static assets..."
New-Item $docs_dir -type directory -force
Copy-Item "$pwd\README.md" "$docs_dir\README.md" -force
Copy-Item "$pwd\PRIVACY.md" "$docs_dir\PRIVACY.md" -force
Copy-Item "$pwd\TERMS.md" "$docs_dir\TERMS.md" -force
Copy-Item "$pwd\LICENSE.md" "$docs_dir\LICENSE.md" -force
