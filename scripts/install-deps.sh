#!/bin/bash

#
# A script to install the Lando build and dev dependencies on POSIX
#
# You need to run this script first aka right after you boot up a clean
# machine
#

# Make sure we are root
if [ "${USER}" != "root" ]; then
  echo "$0 must be run as root!"
  exit 2
fi

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
elif [ -f /etc/gentoo-release ]; then
  FLAVOR="gentoo"
elif [ -f /etc/fedora-release ]; then
  FLAVOR="fedora"
elif [ -f /etc/redhat-release ]; then
  FLAVOR="redhat"
elif [ -f /etc/debian_version ]; then
  FLAVOR="debian"
elif [[ $(uname) == 'Darwin' ]]; then
  FLAVOR="osx"
else
  FLAVOR="whoknows"
fi

# Print flavor info
echo "Mmmmm this ${FLAVOR} flavor is so delcious"

# Do stuff on each distro
case $FLAVOR in
  debian)
    apt-get update && apt-get -y --force-yes install \
      build-essential \
      curl \
      file \
      rpm
    ;;
  fedora)
    echo "Not implemented yet!"
    ;;
  osx)
    echo "Not implemented yet!"
    ;;
  *)
    echo "Platform not supported!"
    ;;
esac
