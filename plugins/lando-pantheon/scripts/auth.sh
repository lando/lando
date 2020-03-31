#!/bin/bash
set -e

# Get the auth and site

AUTH=${1:-${TERMINUS_TOKEN}}
SITE=${2:-${PANTHEON_SITE}}
ENV=${3:-${TERMINUS_ENV}}

# Attempting various logins
if [ ! -z "$AUTH" ]; then
  echo "Attempting to login via terminus..."
  terminus auth:login --machine-token="$AUTH" || terminus auth:login --email="$TERMINUS_USER" || terminus auth:login || exit 1
  echo "Logged in as `terminus auth:whoami`"

  # Do some basic validation to make sure we can access the site correctly
  if [ ! -z "$SITE" ]; then
    echo "Verifying that you have accesss to $SITE..."
    terminus site:info $SITE || exit 1

    # LOCKR integration
    # If we don't have our dev cert already let's get it
    if ! openssl x509 -noout -text -in /var/www/certs/binding.pem 2>/dev/null | grep Pantheon 1>/dev/null; then
      echo "Pantheon LOCKR setup"
      rm -f /var/www/certs/binding.pem
      $(terminus connection:info $SITE.dev --field=sftp_command):certs/binding.pem /var/www/certs/binding.pem
    fi

    # Lets also check to see if we should refresh our cert
    if openssl x509 -checkend 86400 -noout -in /var/www/certs/binding.pem; then
      echo "Cert is good!"
    else
      rm -f /var/www/certs/binding.pem
      $(terminus connection:info $SITE.dev --field=sftp_command):certs/binding.pem /var/www/certs/binding.pem
    fi
  fi

  # Validate this environment
  if [ ! -z "$SITE" ] && [ ! -z "$ENV" ]; then
    echo "Validating whether $ENV is a valid environment and that you have access to it"
    terminus env:list $SITE | grep $ENV || exit 1
  fi
fi
