#!/bin/sh

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
  chown $LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP /usr/local/bin
  chmod 755 /var/www
  nohup chown -R $LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP "$LANDO_MOUNT" &>/dev/null &
  nohup chown -R $LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP /var/www &>/dev/null &
  nohup chown -R $LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP /usr/local/bin &>/dev/null &
  nohup chmod -R 755 /var/www &>/dev/null &

  # Make sure we chown the $LANDO_WEBROOT_USER home directory
  nohup chown -R $LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP $(getent passwd $LANDO_WEBROOT_USER | cut -d : -f 6) &>/dev/null &
  nohup chown -R $LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP /user/.ssh &>/dev/null &
  nohup chown -R $LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP /user/.lando &>/dev/null &

  # Lets also make some /usr/locals chowned
  nohup chown -R $LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP /usr/local/lib &>/dev/null &
  nohup chown -R $LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP /usr/local/share &>/dev/null &

  # Symlink the gitconfig
  if [ -f "/user/.gitconfig" ]; then
    rm -f /var/www/.gitconfig
    ln -sf /user/.gitconfig /var/www/.gitconfig
  fi

  # Move over known_hosts if it exists
  if [ -f "/user/.ssh/known_hosts" ]; then
    mkdir -p /var/www/.ssh
    nohup chown -R $LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP /var/www/.ssh &>/dev/null &
    rm -f /var/www/.ssh/known_hosts
    ln -sf /user/.ssh/known_hosts /var/www/.ssh/known_hosts
  fi

fi
