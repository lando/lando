#!/bin/sh

# Get the linux flavor
if [ -f /etc/os-release ]; then
  . /etc/os-release
  : ${FLAVOR:=$ID_LIKE}
  : ${FLAVOR:=$ID}
elif [ -f /etc/arch-release ]; then
  FLAVOR="arch"
elif [ -f /etc/debian_version ]; then
  FLAVOR="debian"
elif [ -f /etc/fedora-release ]; then
  FLAVOR="fedora"
elif [ -f /etc/gentoo-release ]; then
  FLAVOR="gentoo"
elif [ -f /etc/redhat-release ]; then
  FLAVOR="redhat"
else
  FLAVOR="debian"
fi

# Set defaults
: ${LANDO_WEBROOT_USER:='www-data'}
: ${LANDO_WEBROOT_GROUP:='www-data'}
: ${LANDO_WEBROOT_UID:='33'}
: ${LANDO_WEBROOT_GID:='33'}
: ${SILENT:=$1}

# Source da helpas
. /helpers/user-perm-helpers.sh

# Echo helper to recognize silence
echo_maybe() {
  MESSAGE=$1
  if [ "$SILENT" != "--silent" ]; then
    echo "$MESSAGE"
  fi
}

# Lets only do this if we are root
if [ $(id -u) = 0 ]; then
  # Let's log some helpful things
  echo_maybe "This is a $ID container"
  echo_maybe "user-perms.sh kicking off as user $(id)"
  echo_maybe "Lando ENVVARS set at"
  echo_maybe "LANDO_WEBROOT_USER: $LANDO_WEBROOT_USER"
  echo_maybe "LANDO_WEBROOT_GROUP: $LANDO_WEBROOT_GROUP"
  echo_maybe "LANDO_WEBROOT_UID: $LANDO_WEBROOT_UID"
  echo_maybe "LANDO_WEBROOT_GID: $LANDO_WEBROOT_GID"
  echo_maybe "LANDO_HOST_UID: $LANDO_HOST_UID"
  echo_maybe "LANDO_HOST_GID: $LANDO_HOST_GID"

  # Make things
  mkdir -p /var/www/.ssh
  mkdir -p /user/.ssh
  mkdir -p /app

  # Symlink the gitconfig
  if [ -f "/user/.gitconfig" ]; then
    rm -f /var/www/.gitconfig
    ln -sf /user/.gitconfig /var/www/.gitconfig
  fi

  # Symlink the known_hosts
  if [ -f "/user/.ssh/known_hosts" ]; then
    rm -f /var/www/.ssh/known_hosts
    ln -sf /user/.ssh/known_hosts /var/www/.ssh/known_hosts
  fi

  # Adding user if needed
  echo_maybe "Making sure correct user:group ($LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP) exists..."
  add_user $LANDO_WEBROOT_USER $LANDO_WEBROOT_GROUP $LANDO_WEBROOT_UID $LANDO_WEBROOT_GID $FLAVOR
  verify_user $LANDO_WEBROOT_USER $LANDO_WEBROOT_GROUP $FLAVOR

  # Correctly map users
  # Lets do this regardless of OS now
  echo_maybe "Remapping ownership to handle docker volume sharing..."
  echo_maybe "LANDO_HOST_UID: $LANDO_HOST_UID"
  echo_maybe "LANDO_HOST_GID: $LANDO_HOST_GID"
  echo_maybe "Resetting $LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP from $LANDO_WEBROOT_UID:$LANDO_WEBROOT_GID to $LANDO_HOST_UID:$LANDO_HOST_GID"
  reset_user $LANDO_WEBROOT_USER $LANDO_WEBROOT_GROUP $LANDO_HOST_UID $LANDO_HOST_GID $FLAVOR
  echo_maybe "$LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP is now running as $(id $LANDO_WEBROOT_USER)!"

  # Make sure we set the ownership of the mount and HOME when we start a service
  echo_maybe "And here. we. go."
  perm_sweep $LANDO_WEBROOT_USER $LANDO_WEBROOT_GROUP
fi
