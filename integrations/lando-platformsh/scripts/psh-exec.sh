#!/bin/dash
# Wrapper to execute commands in the right
# environment.

# Load Platform variables.
for script in /etc/profile.d/*.sh; do
  if [ -r "$script" ]; then
    . "$script"
  fi
done

# Add standard variables.
export HOME="/var/www"
export USER="web"
export SHELL="/bin/dash"
export LANG="C.UTF-8"

# @NOTE: This is not guaranteed to work. It is here as a convenience.
if [ ! -z "${NODE_VERSION}" ]; then
  export PATH="$PLATFORM_APP_DIR/.nvm/versions/node/${NODE_VERSION}/bin:${PATH}"
fi

# If we are running platform CLI commands we actually need to
# Unset PLATFORM_RELATIONSHIPS and PLATFORM_APPLICATION for this script
#
# PLATFORM_RELATIONSHIPS is what the platform cli uses to determine whether
# you are actually on platform or not so if this is set then things like
# platform db:command will use localhost instead of the remote environment
#
# PLATFORM_APPLICATION is similarly used to determine for platform mount:command
if [ "$1" = "platform" ]; then
  unset PLATFORM_RELATIONSHIPS
  unset PLATFORM_APPLICATION
fi

exec "$@"
