#!/bin/bash

# Get the lando logger
. /helpers/log.sh

# Set the module
LANDO_MODULE="mounter"

# Set defaults
: ${LANDO_HOST_UID:='1000'}
: ${LANDO_HOST_GID:='1000'}

# Inform the user what is happening
echo -ne "\n\033[35m"
  cat << "EOF"
________             ______       ______  ___     _________
___  __/___  ___________  /__________   |/  /___________  /____
__  /  _  / / /_  ___/_  __ \  __ \_  /|_/ /_  __ \  __  /_  _ \
_  /   / /_/ /_  /   _  /_/ / /_/ /  /  / / / /_/ / /_/ / /  __/
/_/    \__,_/ /_/    /_.___/\____//_/  /_/  \____/\__,_/  \___/
EOF
echo -ne "\033[39m"
echo -e "\033[32m\n"
echo "Lando has detected that you wish to exclude certain directories from Docker file sharing!"
echo "Please allow a few moments for us to sync your host into the container"
echo -e "\033[39m"

# Rysync the things
for MOUNT in "$@"; do
  SOURCE="/source/$MOUNT"
  DEST="/tmp/$MOUNT"
  mkdir -p $SOURCE
  echo "Syncing $MOUNT..."
  rsync --archive --info=progress2 $SOURCE/ $DEST
  chown $LANDO_HOST_UID:$LANDO_HOST_GID -R $DEST
done
