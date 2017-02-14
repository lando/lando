#!/usr/bin/env bats

#
# Some tests for install and some reported edge cases
#

# Load up common environment stuff
load ../env

# Load OS specific stuff
load common

#
# Get us set up for all the tests
#
setup() {

  # Do the preflight
  lando-setup-preflight

}

#
# Check that we can install lando on debian/ubuntu using only the cgroup-bin pkg
#
# See: https://github.com/kalabox/kalabox/issues/1206
#
@test "Install Lando on Debian/Linux with ONLY the cgroup-bin pkg" {

  #
  # Skip this test on non-debian
  #
  if [ "${FLAVOR}" != "debian" ]; then
    skip "Test only applies to debian systems"
  fi

  # Make sure cgroup-lite is purged
  echo "${LANDO_SUDO_PASSWORD}" | sudo -S $LINUX_DEP_REMOVE cgroup-lite || true

  # Install cgroup-bin
  echo "${LANDO_SUDO_PASSWORD}" | sudo -S $LINUX_DEP_INSTALL cgroup-bin

  # Run the install
  lando-install

}

#
# BURN IT TO THE GROUND!!!!
#
teardown() {
  sleep 1
}
