#!/bin/dash
# Wrapper to execute commands in the right
# environment.

# Load Platform variables.
for script in /etc/profile.d/*.sh ; do
  if [ -r "$script" ] ; then
    . "$script"
  fi
done

# Load helpful lando envvars

# Add standard variables.
export HOME="/var/www"
export USER="web"
export SHELL="/bin/dash"
export LANG="C.UTF-8"

exec "$@"
