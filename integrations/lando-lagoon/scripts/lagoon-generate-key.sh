#!/bin/sh

# Get the lando logger
. /helpers/log.sh

# Wrapper for /helpers/generate-key.sh to support a 3rd
# parameters since this script will kill the lando init
# and we don't always want that to happen.
if [ $# -eq 2 ]; then
  # Don't generate a new key if one already exists
  if [ ! -f $1 ]; then
    chmod +x /helpers/generate-key.sh
    /helpers/generate-key.sh $1 $2
  fi
  echo "\n"
  lando_pink "*********************"
  lando_pink "** ACTION REQUIRED **"
  lando_pink "*********************\n"
  echo "Login to Lagoon and add the SSH key below to your Lagoon account:\n"
  lando_green $(cat "/lando/keys/$1.pub")
  echo "\n"
fi
