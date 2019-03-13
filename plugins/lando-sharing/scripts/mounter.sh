#!/bin/bash

# Set defaults
: ${LANDO_WEBROOT_USER:='www-data'}
: ${LANDO_WEBROOT_GROUP:='www-data'}
: ${LANDO_WEBROOT_UID:='33'}
: ${LANDO_WEBROOT_GID:='33'}

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
  chown $LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP -R $DEST
done
