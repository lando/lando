#!/bin/sh
set -e

# Get the lando logger
. /helpers/log.sh

# Set the module
LANDO_MODULE="platformsh-webuser"

# Recreate the web user so it has the uid/gid of the host user
# NOTE: for some reason the usual resetting we do in user-perms.sh
# is very slow and produces weird results for
deluser app > /dev/null || true
deluser web > /dev/null || true
useradd \
  --uid "$LANDO_HOST_UID" \
  --user-group \
  --home /app \
  --non-unique \
  --shell /bin/bash \
  -M \
  web > /dev/null
useradd \
  --user-group \
  --home /mnt \
  --shell /bin/false \
  -M \
  app > /dev/null
