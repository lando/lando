#!/
#
# MCFLY YOU BOJO! YOU KNOW HOVERBOARDS DON'T FLOAT ON WATER!
# UNLESS YOU'VE GOT POWER!!!!.... shell
#
# A script to build Lando on win32
#
$ErrorActionPreference = "Stop"

# Set defaults
$lando_cli_version = $env:LANDO_CLI_VERSION

# Download urls
$lando_url="https://files.lando.dev/cli/lando-win-x64-v$lando_cli_version.exe"

# Installer things
$base_dir = "$pwd\build\installer"
$bundle_dir = "$base_dir\bundle"
$gui_dir = "$bundle_dir\gui"
$docs_dir = "$bundle_dir\docs"
$bin_dir = "$bundle_dir\bin"
$plugins_dir = "$bundle_dir\plugins"

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
Write-Output "Building with Lando from $lando_url"

# Prep our workspace
Remove-Item -LiteralPath "$base_dir" -Force -Recurse -ErrorAction Ignore
New-Item -type directory "$base_dir"
# Copy installer assets
Copy-Item -Path "$pwd/installer/win/*" -Destination "$base_dir" -Recurse
Dir -Recurse "$base_dir" | Get-Childitem

# Get the things we need
New-Item -type directory -force -path $bundle_dir, $docs_dir, $bin_dir, $plugins_dir, $gui_dir
Write-Output "Grabbing the files we need..."
# Lando CLI
# NOTE: this should already be signed so we omit
Download -Url "$lando_url" -Destination "$bin_dir\lando.exe"

# Copy over some other assets
Write-Output "Copying over static assets..."
New-Item $docs_dir -type directory -force
Copy-Item "$pwd\README.md" "$docs_dir\README.md" -force
Copy-Item "$pwd\PRIVACY.md" "$docs_dir\PRIVACY.md" -force
Copy-Item "$pwd\TERMS.md" "$docs_dir\TERMS.md" -force
Copy-Item "$pwd\LICENSE.md" "$docs_dir\LICENSE.md" -force
