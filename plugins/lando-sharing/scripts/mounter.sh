#!/bin/bash

# Inform the user what is happening
# @TODO: update below
echo "Lando has detected that you wish to exclude certain directories from Docker file sharing!"
echo "Please allow a few moments for us to sync your host into the container"

# Rysync the things
for MOUNT in "$@"; do
  SOURCE="/source/$MOUNT"
  DEST="/tmp/$MOUNT"
  echo "Syncing $MOUNT..."
  # @TODO: verify the below
  rsync --archive --info=progress2 $SOURCE/ $DEST
done
