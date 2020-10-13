#!/bin/sh
# Wrapper for /helpers/generate-key.sh to support a 3rd
# parameters since this script will kill the lando init
# and we don't always want that to happen.
if [ $# -eq 2 ]; then
  # Don't generate a new key if one already exists
  if [ ! -f $1 ]; then
    /helpers/generate-key.sh $1 $2
  fi
  echo "\n\n"
  echo "*********************"
  echo "** ACTION REQUIRED **"
  echo "*********************\n"
  echo "Login to Lagoon and add the SSH key below to your Lagoon account:\n"
  cat "/lando/keys/$1.pub"
  echo "\nOnce the key has been added, re-run lando init.\n"
fi
