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

# Install the platform-cli if we need it
if [ ! -f "$HOME/.platformsh/bin/platform" ]; then
  curl -sS https://platform.sh/cli/installer | php
fi

# Make sure platform things are sourced for this script
. "$HOME/.bashrc"

# Validate auth
# @TODO: handle automatic login and warning if not authenticated
lando_pink "Verifying you are authenticated against platform.sh..."
platform auth:info

# Validate project
lando_pink "Verifying your current project..."
lando_green "Verified project id: $(platform project:info id)"

# Attempting to run build
platform local:build

# Run the user perm sweeper to recover our root ops
