#!/bin/bash
set -e

: ${CONFIG_LOCATION:="$HOME/.lando/config.yml"}
: ${RESTORE_LOCATION:="$HOME/.lando/config.yml.test"}

# If we already have a config file move it
if [ -f $CONFIG_LOCATION ]; then
  echo "Detected old config... saving for later"
  cp -f "$CONFIG_LOCATION" "$RESTORE_LOCATION"
fi

# Then set the one here
cp -f "./config.yml" "$CONFIG_LOCATION"

# Cat print the results
cat "$CONFIG_LOCATION"
