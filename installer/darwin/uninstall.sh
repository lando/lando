#!/bin/bash

set -e

# Uninstall Script
# -# Get our options
FORCE=false
while getopts 'f' flag; do
  case "${flag}" in
    f) FORCE='true' ;;
  esac
done

#
# Uninstall Lando function
#
uninstall-lando() {

  echo "Making sure Lando is powered down"
  lando poweroff

  echo "Removing Application..."
  sudo rm -rf /usr/local/bin/lando

  echo "Lando Removed!"

}

#
# Uninstall Docker function
#
uninstall-docker() {

  echo "Removing Docker..."
  sudo /Applications/Docker.app/Contents/MacOS/Docker --uninstall
  sudo rm -rf /Applications/Docker.app

  echo "Docker Removed!"

}

# Primary logic
while true; do
  if [ $FORCE == false ]; then
    read -p "Are you sure you want to remove Lando? (Y/N): " yn
  else
    yn=y
  fi
  case $yn in
    [Yy]* ) uninstall-lando; break;;
    [Nn]* ) break;;
    * ) echo "Please answer yes or no."; exit 1;;
  esac
done

while true; do
  if [ $FORCE == false ]; then
    read -p "Also remove Docker for Mac? (Y/N): " yn
  else
    yn=y
  fi
  case $yn in
    [Yy]* ) uninstall-docker; break;;
    [Nn]* ) break;;
    * ) echo "Please answer yes or no."; exit 1;;
  esac
done

