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
TOKEN=$3
KEY="/lando/keys/platformsh.lando.id_rsa"
CERT="/lando/keys/platformsh.lando.id_rsa-cert"

# Set expectations
echo "Setting up SSH keys..."
# Set up a cert for instant comz
curl -sSH "Authorization: Bearer $TOKEN" -d '{"key": "'"$(< $KEY.pub)"'"}' https://ssh.api.platform.sh/ssh | jq '.certificate' -r > "$CERT"
# Chill for a bit
sleep 1
# Announce intent
echo "Trying to clone from $CONNECT..."

# Do an initial check on JUST the platformsh key
# NOTE: we use -F /dev/null so the keys set up in the global ssh config are not used when this fails
# NOTE: this is mostly useful if you are cloning from somewhere else eg github
if ssh -T -F /dev/null -o "IdentityFile $KEY" -o "IdentityFile $CERT" -o "StrictHostKeyChecking no" $CONNECT 2>&1 | grep "Permission denied" > /dev/null; then
  # Try other keys so we can just move on right away if thats possible
  if ! ssh -T -o "StrictHostKeyChecking no" $CONNECT 2>&1 | grep "Permission denied" > /dev/null; then
    /helpers/get-remote-url.sh $URL
    exit 0
  fi
fi

# Its safe to clone using the lando keys
GIT_SSH_COMMAND="ssh -o 'IdentityFile $KEY' -o 'IdentityFile $CERT' -o 'StrictHostKeyChecking no' -v" /helpers/get-remote-url.sh $URL
