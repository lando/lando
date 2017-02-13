#!/bin/bash

# Uncomment to debug
set -x
set -e

# Check to see that we have the correct dependencies
if [ ! $(type -p fpm) ] || [ ! $(type -p alien) ]; then
  echo "You do not have the correct dependencies installed to build Lando. Trying to install them..."
  sudo ./scripts/install-deps.sh
  gem install --verbose fpm || sudo gem install --verbose fpm
fi

# Lando things
LANDO_VERSION=$(node -pe 'JSON.parse(process.argv[1]).version' "$(cat package.json)")

# Docker things
DOCKER_ENGINE_VERSION="1.9.1"
DOCKER_COMPOSE_VERSION="1.6.2"

# Start up our build directory and go into it
mkdir -p build/installer
mkdir -p build/installer/lando
mkdir -p build/installer/lando/bin
mkdir -p build/lando/lando/docs
cd build/installer/lando

# Get our Lando dependencies
cp -rf ../../../dist/cli/lando-linux-x64-v${LANDO_VERSION} bin/lando
chmod +x bin/lando

# Get our Docker dependencies
curl -fsSL -o bin/docker "https://get.docker.com/builds/Linux/x86_64/docker-$DOCKER_ENGINE_VERSION"
curl -fsSL -o bin/docker-compose "https://github.com/docker/compose/releases/download/$DOCKER_COMPOSE_VERSION/docker-compose-Linux-x86_64"
chmod +x bin/docker
chmod +x bin/docker-compose

# Back out to install root
cd .. && mkdir -p dist && \
  cp -rf ../../README.md lando/docs/README.md && \
  cp -rf ../../TERMS.md lando/docs/TERMS.md && \
  cp -rf ../../LICENSE.md lando/docs/LICENSE.md

# Build our two packages
cd ../..
./scripts/build-pkg.sh deb $LANDO_VERSION
./scripts/build-pkg.sh rpm $LANDO_VERSION
