#!/bin/sh

set -e

# Get the lando logger
. /helpers/log.sh

# Show the welcome message if this is a first boot
if [ ! -f "/tmp/lando-started" ]; then
  echo ""
  echo ""
  echo ""
  lando_blue     "                         STARTING UP                            "
  echo ""
  lando_pink      "         ██       █████  ███    ██ ██████   ██████             "
  lando_pink      "         ██      ██   ██ ████   ██ ██   ██ ██    ██            "
  lando_pink      "         ██      ███████ ██ ██  ██ ██   ██ ██    ██            "
  lando_pink      "         ██      ██   ██ ██  ██ ██ ██   ██ ██    ██            "
  lando_pink      "         ███████ ██   ██ ██   ████ ██████   ██████             "
  echo ""
  lando_blue      "       The best local development tool in the galaxy!          "            
  echo ""
  echo ""
  lando_green     "==============================================================="
  echo ""
  echo ""
  touch /tmp/lando-started
fi

# Executable all the helpers
if [ -d "/helpers" ]; then
  chmod +x /helpers/* || true
fi;

if [ -f "/helpers/user-perms.sh" ] && [ -z ${LANDO_NO_USER_PERMS+x} ]; then
  chmod +x /helpers/user-perms.sh || true
  /helpers/user-perms.sh
fi;

# Run any scripts that we've loaded into the mix for autorun
if [ -d "/scripts" ] && [ -z ${LANDO_NO_SCRIPTS+x} ]; then
  lando_debug "Running $(ls /scripts)"
  chmod +x /scripts/* || true
  find /scripts/ -type f -exec {} \;
fi;

# Run the COMMAND
# @TODO: We should def figure out whether we can get away with running everything through exec at some point
lando_info "Lando handing off to: $@"
if [ ! -z ${LANDO_NEEDS_EXEC+x} ]; then
  lando_debug "Ran command with exec!"
  exec "$@" || tail -f /dev/null
else
 "$@" || tail -f /dev/null
fi;
