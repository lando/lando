#!/bin/bash

# Vars
LANDO_VERSION=$(node -pe 'JSON.parse(process.argv[1]).version' "$(cat package.json)")
DOCKER_VERSION="2.2.0.3"
DOCKER_DOWNLOAD="42716"
TEAM_ID="FY8GAUX282"
PKG_SIGN=false
DMG_SIGN=false

if [ ! -z "$APPLE_CERTS_DATA" ] && [ ! -z "$APPLE_CERTS_PASSWORD" ]; then
  # Export
  echo $APPLE_CERTS_DATA | base64 --decode > /tmp/certs.p12
  # Create keychain and import things
  security create-keychain -p travis macos-build.keychain
  security default-keychain -s macos-build.keychain
  security unlock-keychain -p travis macos-build.keychain
  security set-keychain-settings -t 3600 -u macos-build.keychain
  security import /tmp/certs.p12 -k ~/Library/Keychains/macos-build.keychain -P "$APPLE_CERTS_PASSWORD" -T /usr/bin/codesign -T /usr/bin/productsign
  # Key signing
  security set-key-partition-list -S apple-tool:,apple: -s -k travis macos-build.keychain
  # Verify the things
  security find-identity -v macos-build.keychain | grep FY8GAUX282 | grep "Developer ID Installer"
  security find-identity -v macos-build.keychain | grep FY8GAUX282 | grep "Developer ID Application"
fi

# Check our certificates situation
if security find-identity -v | grep "$TEAM_ID" | grep "Developer ID Application"; then
  echo "Developer ID Installer Found"
  security find-identity -v | grep "$TEAM_ID" | grep "Developer ID Application"
  DMG_SIGN=true
fi
if security find-identity -v | grep "$TEAM_ID" | grep "Developer ID Installer"; then
  echo "Developer ID Installer Found"
  security find-identity -v | grep "$TEAM_ID" | grep "Developer ID Installer"
  PKG_SIGN=true
fi

# Start up our build directory and go into it
mkdir -p build/installer
cd build/installer

# Get our Lando dependencies
cp -rf "../../build/cli/lando-osx-x64-v${LANDO_VERSION}" lando
chmod +x lando
# Sign lando if we can
if [ "$PKG_SIGN" == "true" ]; then
  codesign --force --options runtime -s "$TEAM_ID" lando
fi

# Get Docker for mac
curl -fsSL -o docker.dmg "https://download.docker.com/mac/stable/${DOCKER_DOWNLOAD}/Docker.dmg" && \
  mkdir -p /tmp/lando/docker && \
  hdiutil attach -mountpoint /tmp/lando/docker Docker.dmg && \
  cp -rf /tmp/lando/docker/Docker.app ./Docker.app && \
  hdiutil detach -force /tmp/lando/docker && \
  rm -f docker.dmg

# lando.pkg
cd mpkg/lando.pkg && \
  chmod +x Scripts/* && \
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
  chmod +x Scripts/* && \
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

# Build the package and sign it if we can
mkdir -p dmg && mkdir -p dist && cd mpkg && xar -c --compression=none -f ../dmg/LandoInstaller.pkg .

# Sign the package if applicable
if [ "$PKG_SIGN" == "true" ]; then
  # Move around the pkg
  mv ../dmg/LandoInstaller.pkg ../dmg/UnsignedLandoInstaller.pkg
  # Sign
  productsign --sign "$TEAM_ID" ../dmg/UnsignedLandoInstaller.pkg ../dmg/LandoInstaller.pkg
  # Verify
  pkgutil --check-signature ../dmg/LandoInstaller.pkg
  # Remove unsigned
  rm -f ../dmg/UnsignedLandoInstaller.pkg

  # Notarize if possible
  if [ ! -z "$APPLE_NOTARY_USER" ] && [ ! -z "$APPLE_NOTARY_PASSWORD" ] && [ -z "$APPLE_NO_NOTARIZE" ]; then
    # Start the notarization process
    echo "Uploading Lando for notarization..."
    RID=$(xcrun altool \
      --notarize-app \
      --primary-bundle-id "io.lando.mpkg.lando" \
      --username "$APPLE_NOTARY_USER" \
      --password "$APPLE_NOTARY_PASSWORD" \
      --file "../dmg/LandoInstaller.pkg" 2>&1 | awk '/RequestUUID/ { print $NF; }')

    # Handle success or fail of upload
    echo "Notarization RequestUUID: $RID"
    if [[ $RID == "" ]]; then
      echo "Problem uploading!"
      exit 1
    fi

    # Wait until we good
    NOTARY_STATUS="in progress"
    while [[ "$NOTARY_STATUS" == "in progress" ]]; do
      echo -n "waiting... "
      sleep 10
      NOTARY_STATUS=$(xcrun altool \
        --notarization-info "$RID" \
        --username "$APPLE_NOTARY_USER" \
        --password "$APPLE_NOTARY_PASSWORD" 2>&1 | awk -F ': ' '/Status:/ { print $2; }' )
      echo "We are currently waiting with status of $NOTARY_STATUS"
    done

    # Exit if there is an issue
    if [[ $NOTARY_STATUS != "success" ]]; then
      echo "Could not notarize Lando! Status: $NOTARY_STATUS"
      exit 1
    fi

    # Do a final stapling
    echo "Stapling Lando..."
    xcrun stapler staple "../dmg/LandoInstaller.pkg"
  fi
fi

# Copy in other DMG  asssets
cd .. && \
chmod +x uninstall.sh && \
mv -f uninstall.sh dmg/uninstall.command && \
mv -f lando.icns dmg/.VolumeIcon.icns && \
cp -rf ../../README.md dmg/README.md && \
cp -rf ../../PRIVACY.md dmg/PRIVACY.md && \
cp -rf ../../TERMS.md dmg/TERMS.md && \
cp -rf ../../LICENSE.md dmg/LICENSE.md

# This seems to fail on travis periodically so lets add a retry to it
NEXT_WAIT_TIME=0
until hdiutil create -volname "Lando $LANDO_VERSION" -srcfolder dmg -ov -format UDZO dist/lando.dmg || [ $NEXT_WAIT_TIME -eq 5 ]; do
  sleep $(( NEXT_WAIT_TIME++ ))
done

# Codesign the DMG if applicable
if [ "$DMG_SIGN" == "true" ]; then
  # Sign
  codesign -s "$TEAM_ID" -v dist/lando.dmg
  # Verify
  codesign -v dist/lando.dmg
fi
