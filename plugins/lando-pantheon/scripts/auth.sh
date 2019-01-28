#!/bin/bash

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
  fi

  # Validate this environment
  if [ ! -z "$SITE" ] && [ ! -z "$ENV" ]; then
    echo "Validating whether $ENV is a valid environment and that you have access to it"
    terminus env:list $SITE | grep $ENV || exit 1
  fi

fi

# Ensuring a viable ssh key
# NOTE: Figure out what do about below
# echo "Checking for $SSH_KEY"
# if [ ! -f "$SSH_KEY" ]; then
#   ssh-keygen -t rsa -N "" -C "lando" -f "$SSH_KEY"
#   terminus ssh-key:add "$SSH_KEY.pub"
#   /scripts/load-keys.sh
# fi
