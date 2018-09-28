#!/bin/sh

# Set defaults
: ${LANDO_WEBROOT_USER:='www-data'}
: ${LANDO_WEBROOT_GROUP:='www-data'}
: ${LANDO_WEBROOT_UID:='33'}
: ${LANDO_WEBROOT_GID:='33'}

# Let's log some helpful things
echo "user-perms.sh kicking off as user $(id)"
echo "Lando ENVVARS set at"
echo "LANDO_WEBROOT_USER: $LANDO_WEBROOT_USER"
echo "LANDO_WEBROOT_GROUP: $LANDO_WEBROOT_GROUP"
echo "LANDO_WEBROOT_UID: $LANDO_WEBROOT_UID"
echo "LANDO_WEBROOT_GID: $LANDO_WEBROOT_GID"

# Lets only do this if we are root
if [ $(id -u) = 0 ]; then

  # Make things
  mkdir -p /var/www/.ssh
  mkdir -p /user/.ssh
  mkdir -p "$LANDO_MOUNT"

  # Symlink the gitconfig
  if [ -f "/user/.gitconfig" ]; then
    rm -f /var/www/.gitconfig
    ln -sf /user/.gitconfig /var/www/.gitconfig
  fi

  # Symlink the known_hosts
  if [ -f "/user/.ssh/known_hosts" ]; then
    mkdir -p /var/www/.ssh
    rm -f /var/www/.ssh/known_hosts
    ln -sf /user/.ssh/known_hosts /var/www/.ssh/known_hosts
  fi

  # Adding user if needed
  echo "Making sure correct user:group ($LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP) exists..."
  groups | grep "$LANDO_WEBROOT_GROUP" &>/dev/null || groupadd --force --gid "$LANDO_WEBROOT_GID" "$LANDO_WEBROOT_GROUP"
  id -u "$LANDO_WEBROOT_USER" &>/dev/null || useradd --gid "$LANDO_WEBROOT_GID" -M -N --uid "$LANDO_WEBROOT_UID" "$LANDO_WEBROOT_USER"

  # Verify the user exists
  id -u "$LANDO_WEBROOT_USER"
  groups | grep "$LANDO_WEBROOT_GROUP"

  # Make sure the account is active
  chsh -s /bin/bash $LANDO_WEBROOT_USER || true

  # Correctly map users if we are on linux
  if [ "$LANDO_HOST_OS" = "linux" ]; then
    echo "Remapping ownership to handle Linux docker volume sharing..."
    echo "LANDO_HOST_UID: $LANDO_HOST_UID"
    echo "LANDO_HOST_GID: $LANDO_HOST_GID"
    echo "Resetting $LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP from $LANDO_WEBROOT_UID:$LANDO_WEBROOT_GID to $LANDO_HOST_UID:$LANDO_HOST_GID"
    usermod -o -u "$LANDO_HOST_UID" "$LANDO_WEBROOT_USER"
    groupmod -g "$LANDO_HOST_GID" "$LANDO_WEBROOT_GROUP" || true
    echo "$LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP is now running as $(id $LANDO_WEBROOT_USER)!"

    # If this mapping is incorrect lets abort here
    if [ "$(id -u $LANDO_WEBROOT_USER)" != "$LANDO_HOST_UID" ]; then
      echo "Looks like host/container user mapping was not possible! aborting..."
      exit 0
    fi

  fi

  # Make sure we chown the appropriate directories
  chown -R $LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP "$(getent passwd $LANDO_WEBROOT_USER | cut -d : -f 6)" &>/dev/null
  chown -R $LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP "$LANDO_MOUNT" &>/dev/null
  chown -R $LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP /usr/local &>/dev/null
  chown -R $LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP /lando &>/dev/null
  chown -R $LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP /user &>/dev/null
  chmod -R 755 "$(getent passwd $LANDO_WEBROOT_USER | cut -d : -f 6)" &>/dev/null
fi
