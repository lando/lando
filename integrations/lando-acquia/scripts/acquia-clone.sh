#!/bin/bash

set -e

# Get the URL arg and opz
URL=$1
# Get options
if [ "$2" = '""' ]; then
  OPTIONS=
else
  OPTIONS="$2"
fi

# And then get other things
KEY=$3
SRC_DIR=/tmp/source

# Set expectations
echo "Setting up SSH keys..."
# Chill for a sec
sleep 1
# Wait until key is available
echo "Verifying key ($KEY) is available on Acquia Cloud..."
echo "This could take a minute or so..."
# Otherwise we gotta attempt to retry until the key is ready
# TODO: set a max retry limit?
while GIT_SSH_COMMAND='ssh -o IdentityFile=/lando/keys/$KEY -o StrictHostKeyChecking=no' git ls-remote "$URL" 2>&1 | grep "Permission denied (publickey)" > /dev/null; do
  sleep 10
done

# Take another break just to make sure we are ready
sleep 5

# Passthrough to our normal mechanism
/helpers/get-remote-url.sh $URL "$OPTIONS"
