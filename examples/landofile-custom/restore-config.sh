#!/bin/bash
set -e

: ${CONFIG_LOCATION:="$HOME/.lando/config.yml"}
: ${RESTORE_LOCATION:="$HOME/.lando/config.yml.test"}

# Remove the current config
rm -f "$CONFIG_LOCATION"

# Restore the old one if we have one
if [ -f "$RESTORE_LOCATION" ]; then
  echo "Detected old config... restoring"
  mv -f "$RESTORE_LOCATION" "$CONFIG_LOCATION"
fi

# Cat print the results
cat "$CONFIG_LOCATION"
