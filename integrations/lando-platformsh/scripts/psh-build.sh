#!/bin/bash
# Wrapper to execute the platform build process

set -e

# Get the lando logger
. /helpers/log.sh

# Set the module
LANDO_MODULE="platformsh-build"

# Load Platform variables.
for script in /etc/profile.d/*.sh ; do
  if [ -r "$script" ] ; then
    . "$script"
  fi
done

# Add standard variables.
export HOME="/var/www"
export USER="web"
export SHELL="/bin/dash"
export LANG="C.UTF-8"
export PLATFORM_CACHE_DIR="/var/www"

# Install the platform-cli if we need it
if [ ! -f "$HOME/.platformsh/bin/platform" ]; then
  curl -sS https://platform.sh/cli/installer | php
fi

# Make sure platform things are sourced for this script
. "$HOME/.bashrc"

# Attempting to run build
platform local:build $PLATFORM_APPLICATION_NAME
