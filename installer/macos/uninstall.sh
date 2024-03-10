#!/bin/bash

set -e

LANDO_UNINSTALLED=false

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
  echo "Making sure Lando is powered down..."
  lando poweroff
  echo "Removing Application..."
  sudo rm -rf /usr/local/bin/lando
  echo -e "\033[32mLando removed!\033[39m"
  echo ""
  LANDO_UNINSTALLED=true
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

# Print some messages afterwards
if [ $LANDO_UNINSTALLED == true ]; then
  echo ""
  echo "We have removed the lando binary but you still may have lingering lando configuration files"
  echo "You can optionally remove these by running"
  echo -e "\033[91mrm -rf ~/.lando\033[39m"
fi

echo ""
