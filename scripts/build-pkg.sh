#!/bin/bash

# Get the args
PKG_TYPE=$1
PKG_VERSION=$2

# Translate the version string so its ARCH friendly on pacmanz
if [ "$PKG_TYPE" == "pacman" ]; then
  PKG_VERSION=${PKG_VERSION//-/.}
fi

# Get our build env
source ./scripts/env.sh

# Build pkg install scripts
./scripts/build-scripts.sh preinst $PKG_TYPE
./scripts/build-scripts.sh postinst $PKG_TYPE
./scripts/build-scripts.sh prerm $PKG_TYPE
./scripts/build-scripts.sh postrm $PKG_TYPE

# Build a $PKG_TYPE package
fpm -s dir -t $PKG_TYPE \
  --package "$PKG_PKG" \
  --name "$PKG_NAME" \
  --description "$PKG_DESCRIPTION" \
  --maintainer "$PKG_MAINTAINER" \
  --url "$PKG_URL" \
  --license "$PKG_LICENSE" \
  --version "$PKG_VERSION" \
  $PKG_EXTRA_OPTS \
  $PKG_SCRIPTS \
  $PKG_DEPS \
  -C build/installer \
  lando=/usr/share \
  desktop/lando.desktop=/usr/share/applications/lando.desktop \
  desktop/lando.png=/usr/share/lando/lando.png
