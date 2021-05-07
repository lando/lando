#!/
#
# MCFLY YOU BOJO! YOU KNOW HOVERBOARDS DON'T FLOAT ON WATER!
# UNLESS YOU'VE GOT POWER!!!!.... shell
#
# A script to build Lando on win32
#
$ErrorActionPreference = "Stop"

# Lando version information
$lando_pkg = Get-Content "package.json" | Out-String | ConvertFrom-Json
$lando_version = $lando_pkg.version
$docker_version = "3.3.1"
$docker_build = "63152"

# Get some ENV things for certs
$temp_dir = $env:TMP
$cert_data = $env:WINDOZE_CERTS_DATA
$cert_password = $env:WINDOZE_CERTS_PASSWORD
$cert_secure_password = $null

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

# Cert factors
$can_sign = $false
$cert_path = "$temp_dir\lando.windoze.p12"
$signtool = "${env:ProgramFiles(x86)}\Windows Kits\10\bin\x64\signtool.exe"

# Unzip helper
function Unzip($file, $destination)
{
  Write-Output "Unzipping $file to $destination..."
  $shell = new-object -com shell.application
  if (!(Test-Path "$file"))
  {
      throw "$file does not exist"
  }
  New-Item -ItemType Directory -Force -Path $destination -WarningAction SilentlyContinue
  $shell.namespace($destination).copyhere($shell.namespace("$file").items())
  Write-Output "Unzip complete."
}

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

# Make sure our dependencies are installed
If (!(Test-Path $inno_bin)) {
  Write-Output "Grabbing and installing some needed dependencies..."
  Download -Url $inno_url -Destination $inno_dest
  InstallExe -File $inno_dest
}

# If cert data and pw exist then dump to temp file
if (!([string]::IsNullOrEmpty($cert_data)) -and !([string]::IsNullOrEmpty($cert_password))) {
  Write-Output "Certs detected!"
  # Decode and dump to temp file
  If (!(Test-Path $cert_path)) {
    Write-Output "Dumping certs to $cert_path..."
    $bytes = [Convert]::FromBase64String($cert_data)
    [IO.File]::WriteAllBytes($cert_path, $bytes)
  }
  # Verify the cert and password are good
  Write-Output "Verifying certs are good to go..."
  $cert_secure_password = ConvertTo-SecureString $cert_password -AsPlainText -Force
  Import-PfxCertificate -FilePath "$cert_path" -Password $cert_secure_password -CertStoreLocation "Cert:\LocalMachine\My"
  # If we get this far we should be good!
  Write-Output "We can sign!"
  $can_sign = $true
}

# Get the things we need
New-Item -type directory -force -path $bundle_dir, $docs_dir, $bin_dir, $plugins_dir, $gui_dir
Write-Output "Grabbing the files we need..."

# Lando things
Copy-Item "build\cli\lando-win32-x64-v$lando_version.exe" "$bin_dir\lando.exe" -force
if ($can_sign) {
  Write-Output "Trying to sign the Lando binary with $signtool..."
  & $signtool sign -f "$cert_path" -p "$cert_password" -fd sha256 -tr "http://timestamp.comodoca.com/?td=sha256" -td sha256 -as -v "$bin_dir\lando.exe"
  Write-Output "Verifying Lando binary has been signed with the signtool..."
  & $signtool verify -pa -v "$bin_dir\lando.exe"
}

# Docker Desktop
Download -Url "https://desktop.docker.com/win/stable/amd64/$docker_build/Docker%20Desktop%20Installer.exe" -Destination "$base_dir\Docker.exe"

# Copy over some other assets
Write-Output "Copying over static assets..."
New-Item $docs_dir -type directory -force
Copy-Item "$pwd\README.md" "$docs_dir\README.md" -force
Copy-Item "$pwd\PRIVACY.md" "$docs_dir\PRIVACY.md" -force
Copy-Item "$pwd\TERMS.md" "$docs_dir\TERMS.md" -force
Copy-Item "$pwd\LICENSE.md" "$docs_dir\LICENSE.md" -force

# Create our inno-installer
Write-Output "Creating our package..."
if ($can_sign) {
  $signer = "$signtool sign /f $cert_path /p $cert_password /fd sha256 /tr http://timestamp.comodoca.com/?td=sha256 /td sha256 `$f"
  & iscc /DMyAppVersion=$lando_version /DDockerVersion=$docker_version /Ssigntool=$signer "$base_dir\Lando.iss"
} else {
  & iscc /DMyAppVersion=$lando_version /DDockerVersion=$docker_version "$base_dir\UnsecuredLando.iss"
}
