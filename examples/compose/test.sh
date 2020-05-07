#!/bin/sh

# Set defaults
: ${SILENT:=$1}

# Echo helper to recognize silence
if [ "$SILENT" = "--silent" ]; then
  LANDO_QUIET="yes"
fi

# Get the lando logger
. /helpers/log.sh

# Set the module
LANDO_MODULE="loadkeys"

# Bail if we are not root
if [ $(id -u) != 0 ]; then
  lando_warn "We are not root so bailing on key loading! This is probably ok..."
  exit 0
fi

DIR='/user/.ssh'
for FILE in $(ls "$DIR")
do
    echo "$FILE"
done

