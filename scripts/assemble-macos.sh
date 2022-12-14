#!/bin/bash

set -e

# We are spoofing the binary as a text file because it will then pass app notarization
# This is not ideal but its what we have to do until https://github.com/zeit/pkg/issues/128
# is resolved
#
LANDO="lando"

# Set defaults
ARCH=$(uname -m)
DOCKER_VERSION="$DOCKER_DESKTOP_VERSION"
DOCKER_BUILD="$DOCKER_DESKTOP_BUILD"
LANDO_CLI_VERSION="$LANDO_CLI_VERSION"
LANDO_VERSION=$(node -pe 'JSON.parse(process.argv[1]).version' "$(cat package.json)")

# Allow things to be overridden
while (( "$#" )); do
  case "$1" in
    --arch|--arch=*)
      if [ "${1##--arch=}" != "$1" ]; then
        ARCH="${1##--arch=}"
        shift
      else
        ARCH=$2
        shift 2
      fi
      ;;
    --docker-url|--docker-url=*)
      if [ "${1##--docker-url=}" != "$1" ]; then
        DOCKER_URL="${1##--docker-url=}"
        shift
      else
        DOCKER_URL=$2
        shift 2
      fi
      ;;
    --lando-url|--lando-url=*)
      if [ "${1##--lando-url=}" != "$1" ]; then
        LANDO_URL="${1##--lando-url=}"
        shift
      else
        LANDO_URL=$2
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

# Standardize ARCH
if [ "$ARCH" == "x86_64" ]; then
  ARCH="x64"
fi

# Docker arch
DOCKER_ARCH="$ARCH"
if [ "$DOCKER_ARCH" == "x64" ]; then
  DOCKER_ARCH="amd64"
fi

# Set Download urls if they are empty
if [ -z "$DOCKER_URL" ]; then
  DOCKER_URL="https://desktop.docker.com/mac/main/${DOCKER_ARCH}/${DOCKER_BUILD}/Docker.dmg"
fi
if [ -z "$LANDO_URL" ]; then
  LANDO_URL="https://files.lando.dev/cli/lando-macos-${ARCH}-${LANDO_CLI_VERSION}"
fi

# Some helpful output
echo "Building with Docker from $DOCKER_URL"
echo "Building with Lando from $LANDO_URL"
echo "Building for $ARCH"

# Prep our workspace
rm -rf build/installer
mkdir -p build/installer
# Copy installer assets to build dir
cp -rf installer/macos/* build/installer

# GO into our working dir and check things out
cd build/installer
ls -lsa

# Get Lando CLI
curl -fsSL -o "$LANDO" "$LANDO_URL" && \
  chmod +x "$LANDO"

# Get Docker Desktop
curl -fsSL -o docker.dmg "$DOCKER_URL" && \
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
    -e "s/%LANDO_VERSION%/$LANDO_CLI_VERSION/g" \
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
sed -i "" -e "s/%LANDO_CLI_VERSION%/$LANDO_CLI_VERSION/g" mpkg/Resources/en.lproj/Localizable.strings mpkg/Resources/en.lproj/welcome.rtfd/TXT.rtf mpkg/Distribution
sed -i "" -e "s/%LANDO_VERSION%/$LANDO_VERSION/g" mpkg/Resources/en.lproj/Localizable.strings mpkg/Resources/en.lproj/welcome.rtfd/TXT.rtf mpkg/Distribution
sed -i "" -e "s/%DOCKER_VERSION%/$DOCKER_VERSION/g" mpkg/Resources/en.lproj/Localizable.strings mpkg/Resources/en.lproj/welcome.rtfd/TXT.rtf mpkg/Distribution
sed -i "" -e "s/%ARCH%/$ARCH/g" mpkg/Resources/en.lproj/Localizable.strings mpkg/Resources/en.lproj/welcome.rtfd/TXT.rtf mpkg/Distribution

# Build the package
mkdir -p dmg && mkdir -p dist && cd mpkg && xar -c --compression=none -f ../dmg/LandoInstaller.pkg .

# Build the DMG
cd .. && \
chmod +x uninstall.sh && \
mv -f uninstall.sh dmg/uninstall.command && \
mv -f lando4.icns dmg/.VolumeIcon.icns && \
cp -rf ../../README.md dmg/README.md && \
cp -rf ../../PRIVACY.md dmg/PRIVACY.md && \
cp -rf ../../TERMS.md dmg/TERMS.md && \
cp -rf ../../LICENSE.md dmg/LICENSE.md
