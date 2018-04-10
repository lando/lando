#!/bin/sh

set -e

# Set up some things
LOCKR_CERT="/var/www/certs/binding.pem"

# Kick it off
echo "Pantheon LOCKR setup"

# Set up some new dirs
mkdir -p /var/www/certs

# LOCKR integration
# If we don't have our dev cert already let's get it
if [ ! -f "$LOCKR_CERT" ]; then
  $(terminus connection:info $PANTHEON_SITE_NAME.dev --field=sftp_command):certs/binding.pem $LOCKR_CERT
fi

# Lets also check to see if we should refresh our cert
if openssl x509 -checkend 86400 -noout -in $LOCKR_CERT; then
  echo "Cert is good!"
else
  rm -f $LOCKR_CERT
  $(terminus connection:info $PANTHEON_SITE_NAME.dev --field=sftp_command):certs/binding.pem $LOCKR_CERT
fi
