#!/bin/bash
#
# Wrapper around /helpers/get-remote-url.sh
#
# We need a wrapper here because there seems to be a delay between when you post
# a public key to platform and when you can actually use it to clone down a site
#
# We suspect there is some sort queue or polling operation that gets flushed every
# five minutes or so because sometimes the key is ready in less than 10 seconds
# and sometimes it takes minutes, but it never seems to take longer than 5

set -e

# Get the lando logger
. /helpers/log.sh

# Get the URL arg and opz
URL=$1
CONNECT=$2
KEY="/lando/keys/platformsh.lando.id_rsa"

# Set expectations
echo "Validating SSH keys... sometimes this can take a few minutes..."

# Do an initial check on JUST the platformsh key
# NOTE: we use -F /dev/null so the keys set up in the global ssh config are not
# used when this fails
if ssh -T -F /dev/null -o "StrictHostKeyChecking no" -i $KEY $CONNECT 2>&1 | grep "Permission denied" > /dev/null; then
  # Try other keys so we can just move on right away if thats possible
  if ! ssh -T -o "StrictHostKeyChecking no" $CONNECT 2>&1 | grep "Permission denied" > /dev/null; then
    /helpers/get-remote-url.sh $URL
    exit 0
  fi

  # Otherwise we gotta attempt to retry until the key is ready
  # TODO: set a max retry limit?
  while ssh -T -F /dev/null -o "StrictHostKeyChecking no" -i $KEY $CONNECT 2>&1 | grep "Permission denied" > /dev/null; do
    sleep 10
  done
fi

# We should be ready to clone now
/helpers/get-remote-url.sh $URL
