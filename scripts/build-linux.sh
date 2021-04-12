#!/bin/bash

# Versions and things
LANDO_VERSION=$(node -pe 'JSON.parse(process.argv[1]).version' "$(cat package.json)")
DOCKER_COMPOSE_VERSION="1.29.0"

# Checking to see that we have the correct core build dependencies
if [ ! $(type -p rpmbuild) ] || [ ! $(type -p bsdtar) ]; then
  echo "You do not have the correct dependencies installed to build Lando! Trying to install them..."
  ./scripts/install-deps.sh
fi

# Make sure ruby gems are in the path
export PATH="$PATH:$(ruby -e 'print Gem.user_dir')/bin:/home/travis/.gem/bin"
export GEM_HOME=$HOME/.gem

# Making sure we have FPM
if [ ! $(type -p fpm) ]; then
  echo "You do not have fpm! Trying to install it..."
  ./scripts/install-deps.sh
  gem install --verbose fpm || sudo gem install --verbose fpm
fi

# Start up our build directory and go into it
mkdir -p build/installer
mkdir -p build/installer/lando
mkdir -p build/installer/lando/bin
mkdir -p build/installer/lando/docs
cd build/installer/lando

# Get our Lando dependencies
cp -rf ../../../build/cli/lando-linux-x64-v${LANDO_VERSION} bin/lando
chmod +x bin/lando

# Get our Docker dependencies
curl -fsSL -o bin/docker-compose "https://github.com/docker/compose/releases/download/$DOCKER_COMPOSE_VERSION/docker-compose-Linux-x86_64"
chmod +x bin/docker-compose

# Copy our docs
cp -rf ../../../README.md docs/README.md
cp -rf ../../../PRIVACY.md docs/PRIVACY.md
cp -rf ../../../TERMS.md docs/TERMS.md
cp -rf ../../../LICENSE.md docs/LICENSE.md

# Back out to install root
cd .. && mkdir -p dist

# Build our three packages
cd ../..
./scripts/build-pkg.sh deb $LANDO_VERSION
./scripts/build-pkg.sh pacman $LANDO_VERSION
./scripts/build-pkg.sh rpm $LANDO_VERSION
