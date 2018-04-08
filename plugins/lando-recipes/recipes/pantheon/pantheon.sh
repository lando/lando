#!/bin/sh

set -e

# Set up some things
CERT_DIR="/lando/keys/pantheon/${LANDO_APP_NAME}"
INDEX_CERT="$CERT_DIR/cert.crt"
INDEX_PEM="$CERT_DIR/cert.pem"

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

# Setting up client key
echo "Setting up client key $INDEX_PEM"
cp -rf $INDEX_PEM /var/www/certs/binding.pem

# LOCKR integration
# If we don't have our dev cert already let's get it
# if [ ! -f "/certs/binding.pem" ]; then
#   $(terminus site connection-info --field=sftp_command):certs/binding.pem /certs/binding.pem
# fi

# Lets also check to see if we should refresh our cert
# if openssl x509 -checkend 86400 -noout -in /certs/binding.pem; then
#  echo "Cert is good!"
# else
#   $(terminus site connection-info --field=sftp_command):certs/binding.pem /certs/binding.pem
# fi
