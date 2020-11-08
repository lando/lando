#!/bin/bash
#
# Wrapper around /helpers/get-remote-url.sh
#
# We need a wrapper here so we can target with a specific ssh key

set -e

# Get the URL arg and opz
URL=$1
KEY=$2

# Setup
SRC_DIR=/tmp/source
# Start with a clear slate
rm -rf "$SRC_DIR"
mkdir -p "$SRC_DIR"

# Error if we already have a git repo
if [ -d "/app/.git" ]; then
  echo "Whoooops! Looks like you've already got a git repo here!"
  echo "Either delete this repo or try to lando init in a folder without .git in it"
  exit 666
fi

# Clone and do the stuff
GIT_SSH_COMMAND="ssh -o 'IdentityFile $KEY' -v" git -C "$SRC_DIR" clone "$URL" ./
echo "Copying git clone over to /app..."
cp -rfT "$SRC_DIR" /app
