#!/usr/bin/env bats

#
# Basic tests to verify that Lando has been installed
#

# Load up common environment stuff
load env

# Load OS specific stuff
load "$UNIX_TYPE/common"

#
# Get us set up for all the tests
#
setup() {
  lando-setup-preflight
}

# Check that we can install Lando.
@test "Check that we can install Lando successfully." {
  # Run our uninstaller first just in case
  lando-uninstall || true
  # Run the install
  lando-install
}

# Check that the LANDO is in the PATH
@test "Check that lando is in PATH" {
  run which $LANDO
  [ "$status" -eq 0 ]
}

# Check that '$LANDO' returns without error
@test "Check that '$LANDO' returns correctly" {
  run $LANDO
  [ "$status" -eq 1 ]
}

# Check that '$LANDO config' returns without error
@test "Check that '$LANDO config' returns without error" {
  run $LANDO config
  [ "$status" -eq 0 ]
}

# Check that '$LANDO list' returns without error
@test "Check that '$LANDO list' returns without error" {
  run $LANDO list
  [ "$status" -eq 0 ]
}

# Check that '$LANDO version' returns without error
@test "Check that '$LANDO version' returns without error" {
  run $LANDO version
  [ "$status" -eq 0 ]
}

# Check that we can uninstall Lando.
@test "Check that we can uninstall Lando successfully." {
  lando-uninstall
}

#
# BURN IT TO THE GROUND!!!!
#
teardown() {
  sleep 1
  echo "Test complete."
}
