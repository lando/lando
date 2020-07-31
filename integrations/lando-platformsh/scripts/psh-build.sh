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

# Run build
# NOTE: if the build destination does not already exist we assume
# it is created as part of the build and therefore we need to make sure
# it is accessible from the same directory as specificed in web.locations
if [ ! -d "$LANDO_BUILD_DESTINATION" ] || [ -L "$LANDO_BUILD_DESTINATION" ]; then
  platform local:build $PLATFORM_APPLICATION_NAME --destination $LANDO_BUILD_DESTINATION

# Otherwise its safe to use the default destination
else
  platform local:build $PLATFORM_APPLICATION_NAME
fi
