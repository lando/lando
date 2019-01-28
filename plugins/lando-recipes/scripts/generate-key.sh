#!/bin/bash

set -e

# Get the key and comment
KEY="$1"
COMMENT="$2"

# Make sure we are set up for success
mkdir -p /lando/keys

# Setup the key if we have it
if [ ! -f "/lando/keys/$KEY" ]; then
  echo "$KEY does not yet exist, generating one..."
  ssh-keygen -t rsa -N "" -C "$COMMENT" -f "/lando/keys/$KEY"
fi
