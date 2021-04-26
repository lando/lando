#!/bin/bash

# Lando
LANDO_VERSION=$(node -pe 'JSON.parse(process.argv[1]).version' "$(cat package.json)")
# We are spoofing the binary as a text file because it will then pass app notarization
# This is not ideal but its what we have to do until https://github.com/zeit/pkg/issues/128
# is resolved
#
# LANDO="lando"
LANDO="lando.txt"
TARGET_ARCH="amd64"

# Allow arch to be overridden
while (( "$#" )); do
  case "$1" in
    --arch|--arch=*)
      if [ "${1##--arch=}" != "$1" ]; then
        TARGET_ARCH="${1##--arch=}"
        shift
      else
        TARGET_ARCH=$2
        shift 2
      fi
      ;;
    --)
      shift
      break
      ;;
    -*|--*=)
      shift
      ;;
    *)
      shift
      ;;
  esac
done

# Docker
DOCKER_VERSION="3.3.1"
DOCKER_DOWNLOAD="63152"

# Certs
TEAM_ID="FY8GAUX282"
PKG_SIGN=false
DMG_SIGN=false
NOTARIZE=false

# Load in certs if they are stored in the ENV
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

# Check our certificates and notarization situation
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
if \
  [ -z "$APPLE_NO_NOTARIZE" ] && \
  [ ! -z "$APPLE_NOTARY_USER" ] && \
  [ ! -z "$APPLE_NOTARY_PASSWORD" ] && \
  [ "$DMG_SIGN" == "true" ] && \
  [ "$PKG_SIGN" == "true" ];
then
  NOTARIZE=true
fi

# Start up our build directory and go into it
mkdir -p build/installer
cd build/installer

# Prepare Lando
PKG_ARCH="$TARGET_ARCH"
# Map amd64 -> x64
if [ "$PKG_ARCH" == "amd64" ]; then
  PKG_ARCH="x64"
fi

cp -rf "../../build/cli/lando-osx-${PKG_ARCH}-v${LANDO_VERSION}" "${LANDO}"
chmod +x "${LANDO}"
# We cannot codesign the binary until https://github.com/zeit/pkg/issues/128 is resolved
# if [ "$PKG_SIGN" == "true" ]; then
#   codesign --force --options runtime -s "$TEAM_ID" "${LANDO}" || true
# fi

# Prepare Docker Desktop
curl -fsSL -o docker.dmg "https://desktop.docker.com/mac/stable/${TARGET_ARCH}/${DOCKER_DOWNLOAD}/Docker.dmg" && \
  mkdir -p /tmp/lando/docker && \
  hdiutil attach -mountpoint /tmp/lando/docker Docker.dmg && \
  cp -Rf /tmp/lando/docker/Docker.app ./Docker.app && \
  hdiutil detach -force /tmp/lando/docker && \
  rm -f docker.dmg

# Build lando.pkg
cd mpkg/lando.pkg && \
  chmod +x Scripts/* && \
  cd Scripts && find . | cpio -o --format odc | gzip -c > ../Scripts.bin && cd .. && \
  rm -r Scripts && mv Scripts.bin Scripts && \
  mkdir ./rootfs && \
  cd ./rootfs && \
  mv "../../../${LANDO}" . && \
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

# Build docker.pkg
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

# Add in version info
sed -i "" -e "s/%LANDO_VERSION%/$LANDO_VERSION/g" mpkg/Resources/en.lproj/Localizable.strings mpkg/Resources/en.lproj/welcome.rtfd/TXT.rtf mpkg/Distribution
sed -i "" -e "s/%DOCKER_VERSION%/$DOCKER_VERSION/g" mpkg/Resources/en.lproj/Localizable.strings mpkg/Resources/en.lproj/welcome.rtfd/TXT.rtf mpkg/Distribution

# Build the package
mkdir -p dmg && mkdir -p dist && cd mpkg && xar -c --compression=none -f ../dmg/LandoInstaller.pkg .
# Sign the package if we can
if [ "$PKG_SIGN" == "true" ]; then
  # Move around the pkg
  mv ../dmg/LandoInstaller.pkg ../dmg/UnsignedLandoInstaller.pkg
  # Sign
  productsign --sign "$TEAM_ID" ../dmg/UnsignedLandoInstaller.pkg ../dmg/LandoInstaller.pkg
  # Verify
  pkgutil --check-signature ../dmg/LandoInstaller.pkg
  # Remove unsigned
  rm -f ../dmg/UnsignedLandoInstaller.pkg
fi

# Build the DMG
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

# Notarize if possible
if [ "$NOTARIZE" == "true" ]; then
  # Start the notarization process
  echo "Uploading Lando for notarization..."
  RID=$(xcrun altool \
    --notarize-app \
    --primary-bundle-id "io.lando.mpkg.lando" \
    --username "$APPLE_NOTARY_USER" \
    --password "$APPLE_NOTARY_PASSWORD" \
    --file "dist/lando.dmg" 2>&1 | awk '/RequestUUID/ { print $NF; }')

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
  xcrun stapler staple "dist/lando.dmg"
fi
