#!/usr/bin/env bats

#
# Some helpful functions we can reuse across tests
#

#
# Make sure we are all set up to run tests
#
lando-setup-preflight() {

  set -e

  if [ ! -f "./dist/$LANDO_PKG" ]; then
    echo "You dont have a lando installer to use. Please run 'grunt pkg' first."
    exit 1
  fi

}

#
# Run the lando install
#
lando-install() {

  # Make sure we dont already have a mounted thing
  hdiutil detach "/Volumes/Lando" || true
  # Mount the lando.dmg
  hdiutil attach "./dist/lando.dmg"
  # Install the package
  echo "${LANDO_SUDO_PASSWORD}" | sudo -S installer -pkg "/Volumes/Lando/LandoInstaller.pkg" -target /
  # DISSSSSMOUNT
  hdiutil detach "/Volumes/Lando"

}

#
# Run the Lando uninstall
#
lando-uninstall() {

  echo "${LANDO_SUDO_PASSWORD}" | sudo -S "$LANDO_UNINSTALL" -f

}

#
# Function to rety docker builds if they fail
#
lando-docker-build-retry() {

  # Get args
  IMAGE=$1
  TAG=$2
  DOCKERFILE=$3

  # Try a few times
  NEXT_WAIT_TIME=0
  until $DOCKER build -t $IMAGE:$TAG $DOCKERFILE || [ $NEXT_WAIT_TIME -eq 5 ]; do
    sleep $(( NEXT_WAIT_TIME++ ))
  done

  # If our final try has been met we assume failure
  #
  # @todo: this can be better since this could false negative
  #        on the final retry
  #
  if [ $NEXT_WAIT_TIME -eq 5 ]; then
    exit 666
  fi

}
