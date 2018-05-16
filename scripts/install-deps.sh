#!/bin/bash

#
# A script to install the Lando build and dev dependencies on POSIX
#
# You need to run this script first aka right after you boot up a clean
# machine
#

#
# Gather information about the system and state

# Let's first try to get our system
# Some OS do not implement /etc/os-release yet so lets have some
# backups in place.
if [ -f /etc/os-release ]; then
  source /etc/os-release
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
elif [[ $(uname) == 'Darwin' ]]; then
  FLAVOR="osx"
else
  FLAVOR="whoknows"
fi

# Print flavor info
echo "Mmmmm this ${FLAVOR} flavor is so delcious"

# Do stuff on each distro
case $FLAVOR in
  manjaro|arch)

    # Get our base deps
    sudo pacman -Syu --noconfirm && sudo pacman -S --noconfirm \
      base-devel \
      curl \
      ruby \
      yaourt

    # Get RPM build tools
    yaourt -S --noconfirm rpmdevtools

    ;;
  debian)
    sudo apt-get update && sudo apt-get -y --force-yes install \
      bsdtar \
      build-essential \
      curl \
      file \
      rpm \
      ruby \
      ruby-dev
    ;;
  fedora)
    echo "Not implemented yet!"
    ;;
  gentoo)
    echo "Not implemented yet!"
    ;;
  redhat)
    echo "Not implemented yet!"
    ;;
  osx)
    echo "Not implemented yet!"
    ;;
  *)
    echo "Platform not supported!"
    ;;
esac
