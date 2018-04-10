#!/bin/sh

set -e

# Kick it off
echo "Pantheon pre-run scripting"

# Emulate /srv/bindings
if [ "$LANDO_SERVICE_NAME" = "appserver" ]; then
  mkdir -p /srv/bindings
  ln -s /var/www "/srv/bindings/lando" || true
  # Set the tmp directory
  ln -sf /tmp /srv/bindings/lando/tmp
fi
