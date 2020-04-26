#!/bin/bash

set -e

# Get the lando logger
. /helpers/log.sh

# Set the module
LANDO_MODULE="pantheon"

# Args
AUTH=${1:-${TERMINUS_TOKEN}}
SITE=${2:-${PANTHEON_SITE}}
ENV=${3:-${TERMINUS_ENV}}

# Attempting various logins
if [ ! -z "$AUTH" ]; then
  lando_pink "Attempting to login via terminus..."
  terminus auth:login --machine-token="$AUTH" || terminus auth:login --email="$TERMINUS_USER" || terminus auth:login || exit 1
  lando_green "Logged in as `terminus auth:whoami`"

  # Do some basic validation to make sure we can access the site correctly
  if [ ! -z "$SITE" ]; then
    lando_pink "Verifying that you have access to $SITE..."
    terminus site:info $SITE || exit 1
    lando_green "Access confirmed!"

    # LOCKR integration
    # If we don't have our dev cert already let's get it
    if ! openssl x509 -noout -text -in /var/www/certs/binding.pem 2>/dev/null | grep Pantheon 1>/dev/null; then
      echo "Pantheon LOCKR setup"
      rm -f /var/www/certs/binding.pem
      $(terminus connection:info $SITE.dev --field=sftp_command):certs/binding.pem /var/www/certs/binding.pem
    fi

    # Lets also check to see if we should refresh our cert
    if openssl x509 -checkend 86400 -noout -in /var/www/certs/binding.pem; then
      lando_green "Cert is good!"
    else
      rm -f /var/www/certs/binding.pem
      $(terminus connection:info $SITE.dev --field=sftp_command):certs/binding.pem /var/www/certs/binding.pem
    fi
  fi
fi
