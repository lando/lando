#!/
#
# MCFLY YOU BOJO! YOU KNOW HOVERBOARDS DON'T FLOAT ON WATER!
# UNLESS YOU'VE GOT POWER!!!!.... shell
#
# A script to build Lando on win32
#
$ErrorActionPreference = "Stop"

# Set defaults
$base_dir = "$pwd\build\installer"
$docker_version = $env:DOCKER_DESKTOP_VERSION
$lando_pkg = Get-Content "package.json" | Out-String | ConvertFrom-Json
$lando_version = $lando_pkg.version
$issfile = "$base_dir\Lando.iss"

# Build dependencies
$inno_url = "http://www.jrsoftware.org/download.php/is.exe"
$inno_dest = "$temp_dir\inno-installer.exe"
$inno_bin = "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe"

# Cert things
$temp_dir = $env:TMP
$cert_path = "$temp_dir\lando.windoze.p12"
$cert_password = $env:WINDOZE_CERT_PASSWORD
$signtool = "${env:ProgramFiles(x86)}\Windows Kits\10\bin\x64\signtool.exe"

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

$signer = "$signtool sign /f $cert_path /p $cert_password /fd sha256 /tr http://timestamp.digicert.com /td sha256 `$f"
& iscc /DMyAppVersion=$lando_version /DDockerVersion=$docker_version /Ssigntool=$signer "$issfile"
