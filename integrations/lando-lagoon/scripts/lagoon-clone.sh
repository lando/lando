#!/bin/bash
#
# Wrapper around /helpers/get-remote-url.sh
#
# We need a wrapper here so we can target with a specific ssh key

set -e

# Get the URL arg and opz
URL=$1
KEY=$2

# Its safe to clone using the lando keys
GIT_SSH_COMMAND="ssh -o 'IdentityFile $KEY' -v" /helpers/get-remote-url.sh $URL
