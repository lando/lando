#!/bin/sh

set -e

# Run the usermap script if it exists
if [ -f "/user-perms.sh" ] && [ -z ${LANDO_NO_SCRIPTS+x} ]; then
  chmod +x /user-perms.sh
  /user-perms.sh
fi;

# Run any scripts that we've loaded into the mix
if [ -d "/scripts" ] && [ -z ${LANDO_NO_SCRIPTS+x} ]; then
  chmod +x /scripts/*
  find /scripts/ -type f -exec {} \;
fi;

# Executable all the helpers
if [ -d "/helpers" ] && [ -z ${LANDO_NO_SCRIPTS+x} ]; then
  chmod +x /helpers/*
fi;

# Run the COMMAND
echo "Running command $@"
"$@"
