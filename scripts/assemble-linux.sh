#!/bin/bash
set -eo pipefail

# Set defaults
DOCKER_COMPOSE_VERSION="$DOCKER_COMPOSE_VERSION"
LANDO_CLI_VERSION="$LANDO_CLI_VERSION"

# Download urls
DOCKER_COMPOSE_URL="https://github.com/docker/compose/releases/download/$DOCKER_COMPOSE_VERSION/docker-compose-Linux-x86_64"
LANDO_URL="https://files.lando.dev/cli/lando-linux-x64-v$LANDO_CLI_VERSION"

# Allow things to be overridden
while (( "$#" )); do
  case "$1" in
    --docker-compose-url|--docker-compose-url=*)
      if [ "${1##--docker-url=}" != "$1" ]; then
        DOCKER_COMPOSE_URL="${1##--docker-url=}"
        shift
      else
        DOCKER_COMPOSE_URL=$2
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

# Some helpful output
echo "Building with Docker from $DOCKER_COMPOSE_URL"
echo "Building with Lando from $LANDO_URL"

# Prep our workspace
rm -rf build/installer

# Copy installer assets to build dir
mkdir -p build/installer
mkdir -p build/installer/lando
mkdir -p build/installer/lando/bin
mkdir -p build/installer/lando/docs
cp -rf installer/linux/* build/installer

# GO into our working dir and check things out
cd build/installer/lando
ls -lsa

# Get our Lando dependencies
curl -fsSL -o bin/lando "$LANDO_URL"
chmod +x bin/lando

# Get our Docker dependencies
curl -fsSL -o bin/docker-compose "$DOCKER_COMPOSE_URL"
chmod +x bin/docker-compose

# Copy our docs
cp -rf ../../../README.md docs/README.md
cp -rf ../../../PRIVACY.md docs/PRIVACY.md
cp -rf ../../../TERMS.md docs/TERMS.md
cp -rf ../../../LICENSE.md docs/LICENSE.md
