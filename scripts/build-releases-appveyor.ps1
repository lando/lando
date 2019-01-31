#!/
#
# MCFLY YOU BOJO! YOU KNOW HOVERBOARDS DON'T FLOAT ON WATER!
# UNLESS YOU'VE GOT POWER!!!!.... shell
#
# A script to build Lando on win32
#
If ($env:APPVEYOR_REPO_BRANCH -eq "master") {
  Copy-Item "dist\lando.exe" -Destination "release\lando-$env:APPVEYOR_REPO_TAG_NAME.exe" -Force
  Copy-Item "dist\lando.exe" -Destination "release\lando-$env:APPVEYOR_REPO_COMMIT-dev.exe" -Force
} Else {
  Copy-Item "dist\lando.exe" -Destination "release\lando-deploy-test.exe" -Force
}
If ($env:APPVEYOR_REPO_TAG -eq "true") {
  Copy-Item "dist\lando.exe" -Destination "release\lando-stable.exe" -Force
}
