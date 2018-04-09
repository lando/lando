#!/bin/sh

set -e

# Set up some things
LOCKR_CERT="/var/www/certs/binding.pem"

# Kick it off
echo "Pantheon pre-run scripting"

# Set up some new dirs
mkdir -p /var/www/certs

# Emulate /srv/bindings
if [ "$LANDO_SERVICE_NAME" = "appserver" ]; then
  mkdir -p /srv/bindings
  ln -s /var/www "/srv/bindings/lando" || true
  # Set the tmp directory
  ln -sf /tmp /srv/bindings/lando/tmp
fi

# LOCKR integration
# If we don't have our dev cert already let's get it
if [ ! -f "$LOCKR_CERT" ]; then
  $(terminus connection:info $PANTHEON_SITE_NAME.dev --field=sftp_command):certs/binding.pem $LOCKR_CERT
fi

# Lets also check to see if we should refresh our cert
if openssl x509 -checkend 86400 -noout -in /certs/binding.pem; then
  echo "Cert is good!"
else
  rm -f $LOCKR_CERT
  $(terminus connection:info $PANTHEON_SITE_NAME.dev --field=sftp_command):certs/binding.pem $LOCKR_CERT
fi
