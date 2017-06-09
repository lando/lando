#!/bin/sh

set -e

# Set defaults
: ${LANDO_WEBROOT_USER:='www-data'}
: ${LANDO_WEBROOT_GROUP:='www-data'}
: ${LANDO_WEBROOT_UID:='33'}
: ${LANDO_WEBROOT_GID:='33'}

# Lets only do this if we are root
if [ $(id -u) = 0 ]; then

  # Make web root
  mkdir -p /var/www

  # Adding user if needed
  echo "Making sure correct user exists..."
  groupadd --force --gid "$LANDO_WEBROOT_GID" "$LANDO_WEBROOT_GROUP"
  id -u "$LANDO_WEBROOT_USER" &>/dev/null || useradd --gid "$LANDO_WEBROOT_GID" -M -N --uid "$LANDO_WEBROOT_UID" "$LANDO_WEBROOT_USER"

  # Make sure the account is active
  chsh -s /bin/bash $LANDO_WEBROOT_USER || true

  # Correctly map users if we are on linux
  if [ "$LANDO_HOST_OS" = "linux" ]; then
    echo "Remapping ownership to handle Linux docker volume sharing..."
    usermod -o -u "$LANDO_HOST_UID" "$LANDO_WEBROOT_USER"
    groupmod -g "$LANDO_HOST_GID" "$LANDO_WEBROOT_GROUP" || true
  fi

  # Make sure we set the ownership of the mount when we start a service
  nohup chown -R $LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP $LANDO_MOUNT &>/dev/null &

  # Also make sure we chown the $LANDO_WEBROOT_USER home directory
  nohup chown -R $LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP $(getent passwd $LANDO_WEBROOT_USER | cut -d : -f 6) &>/dev/null &

  # Lets also make some /usr/locals chowned
  nohup chown -R $LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP /usr/local/bin &>/dev/null &
  nohup chown -R $LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP /usr/local/lib &>/dev/null &
  nohup chown -R $LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP /usr/local/share &>/dev/null &

fi
