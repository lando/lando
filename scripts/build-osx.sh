#!/bin/bash

# Uncomment to debug
set -x
set -e

# Lando things
LANDO_VERSION=$(node -pe 'JSON.parse(process.argv[1]).version' "$(cat package.json)")
DOCKER_VERSION="1.13.1"

# Start up our build directory and go into it
mkdir -p build/installer
cd build/installer

# Get our Lando dependencies
cp -rf "../../dist/cli/lando-osx-x64-v${LANDO_VERSION}" lando
chmod +x lando

# Get Docker for mac
# @todo: Would be great to pin this version
curl -fsSL -o docker.dmg "https://download.docker.com/mac/edge/Docker.dmg" && \
  mkdir -p /tmp/lando/docker && \
  hdiutil attach -mountpoint /tmp/lando/docker Docker.dmg && \
  cp -rf /tmp/lando/docker/Docker.app ./Docker.app && \
  hdiutil detach -force /tmp/lando/docker && \
  rm -f docker.dmg

# lando.pkg
cd mpkg/lando.pkg && \
  cd Scripts && find . | cpio -o --format odc | gzip -c > ../Scripts.bin && cd .. && \
  rm -r Scripts && mv Scripts.bin Scripts && \
  mkdir ./rootfs && \
  cd ./rootfs && \
  mv ../../../lando . && \
  ls -al . && \
  find . | cpio -o --format odc | gzip -c > ../Payload && \
  mkbom . ../Bom && \
  sed -i "" \
    -e "s/%LANDO_NUMBER_OF_FILES%/`find . | wc -l`/g" \
    ../PackageInfo && \
  sed -i "" \
    -e "s/%LANDO_INSTALL_KBYTES%/`du -sk | cut -f1`/g" \
    ../PackageInfo ../../Distribution && \
  sed -i "" \
    -e "s/%LANDO_VERSION%/$LANDO_VERSION/g" \
    ../PackageInfo ../../Distribution && \
  cd .. && \
  rm -rf rootfs && \
  cd ../..

# docker.pkg
cd mpkg/docker.pkg && \
  cd Scripts && find . | cpio -o --format odc | gzip -c > ../Scripts.bin && cd .. && \
  rm -r Scripts && mv Scripts.bin Scripts && \
  mkdir ./rootfs && \
  cd ./rootfs && \
  mv ../../../Docker.app . && \
  ls -al . && \
  find . | cpio -o --format odc | gzip -c > ../Payload && \
  mkbom . ../Bom && \
  sed -i "" \
    -e "s/%DOCKER_NUMBER_OF_FILES%/`find . | wc -l`/g" \
    ../PackageInfo && \
  sed -i "" \
    -e "s/%DOCKER_INSTALL_KBYTES%/`du -sk | cut -f1`/g" \
    ../PackageInfo ../../Distribution && \
  sed -i "" \
    -e "s/%DOCKER_VERSION%/$DOCKER_VERSION/g" \
    ../PackageInfo ../../Distribution && \
  cd .. && \
  rm -rf rootfs && \
  cd ../..

# Add in more version info
sed -i "" -e "s/%LANDO_VERSION%/$LANDO_VERSION/g" mpkg/Resources/en.lproj/Localizable.strings mpkg/Resources/en.lproj/welcome.rtfd/TXT.rtf mpkg/Distribution
sed -i "" -e "s/%DOCKER_VERSION%/$DOCKER_VERSION/g" mpkg/Resources/en.lproj/Localizable.strings mpkg/Resources/en.lproj/welcome.rtfd/TXT.rtf mpkg/Distribution

# Build the package
mkdir -p dmg && mkdir -p dist && cd mpkg && \
  xar -c --compression=none -f ../dmg/LandoInstaller.pkg . && cd .. && \
  mv -f uninstall.sh dmg/uninstall.command && \
  mv -f lando.icns dmg/.VolumeIcon.icns && \
  cp -rf ../../README.md dmg/README.md && \
  cp -rf ../../TERMS.md dmg/TERMS.md && \
  cp -rf ../../LICENSE.md dmg/LICENSE.md

# This seems to fail on travis periodically so lets add a retry to it
NEXT_WAIT_TIME=0
until hdiutil create -volname Lando -srcfolder dmg -ov -format UDZO dist/lando.dmg || [ $NEXT_WAIT_TIME -eq 5 ]; do
  sleep $(( NEXT_WAIT_TIME++ ))
done
