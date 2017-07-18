#!/bin/sh

set -e

# Set defaults
: ${LANDO_WEBROOT_USER:='www-data'}
: ${LANDO_WEBROOT_GROUP:='www-data'}
: ${LANDO_WEBROOT_UID:='33'}
: ${LANDO_WEBROOT_GID:='33'}

# Lets only do this if we are root
if [ $(id -u) = 0 ]; then

  # Make things
  mkdir -p /var/www
  mkdir -p "$LANDO_MOUNT"

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

  # Make sure we set the ownership of the mount and HOME when we start a service
  chown $LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP "$LANDO_MOUNT"
  chown $LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP /var/www
  nohup chown -R $LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP "$LANDO_MOUNT" &
  nohup chown -R $LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP /var/www &

  # Make sure we chown the $LANDO_WEBROOT_USER home directory
  nohup chown -R $LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP $(getent passwd $LANDO_WEBROOT_USER | cut -d : -f 6) &
  nohup chown -R $LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP /user/.ssh
  nohup chown -R $LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP /user/.lando

  # Lets also make some /usr/locals chowned
  nohup chown -R $LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP /usr/local/bin &
  nohup chown -R $LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP /usr/local/lib &
  nohup chown -R $LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP /usr/local/share &

  # Move over .gitconfig if it exists
  if [ -f "/user/.gitconfig" ]; then
    cp -rf /user/.gitconfig /var/www/.gitconfig
  fi

fi

# Run any scripts that we've loaded into the mix
if [ -d "/scripts" ] && [ -z ${LANDO_NO_SCRIPTS+x} ]; then
  chmod +x /scripts/*
  find /scripts/ -type f -exec {} \;
fi;

# Run the COMMAND
echo "Running command $@"
"$@"
