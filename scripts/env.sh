#!/bin/bash

# Set up our FPM env
# We want this separate so we can source from other things ie tests

# Set some basic info
PKG_NAME="lando"
PKG_PKG="build/installer/dist/lando.$PKG_TYPE"
PKG_DESCRIPTION="The best local dev in the galaxy."
PKG_MAINTAINER="Mike Pirog <mike@thinktandem.io>"
PKG_URL="https://docs.devwithlando.io/"
PKG_LICENSE="MIT"
PKG_EXTRA_OPTS="--force"
PKG_SCRIPTS_DIR=build/installer/pkg/scripts

# Set scripts
PKG_SCRIPTS="\
--after-install $PKG_SCRIPTS_DIR/$PKG_TYPE/postinst \
--before-install $PKG_SCRIPTS_DIR/$PKG_TYPE/preinst \
--after-remove $PKG_SCRIPTS_DIR/$PKG_TYPE/postrm \
--before-remove $PKG_SCRIPTS_DIR/$PKG_TYPE/prerm"

# Set our dependencies
DEPS=( iptables git-core procps docker-ce )

# Add OS specific deps
if [ "$1" == "rpm" ]; then
  DEPS+=('libcgroup')
elif [ "$1" == "deb" ]; then
  DEPS+=('cgroup-bin')
fi

# Loop through to build our PKG_DEPS
for i in "${DEPS[@]}"
do
  PKG_DEPS="$PKG_DEPS --depends $i"
done
