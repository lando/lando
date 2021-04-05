#!/bin/bash
# This script assures there is a `web` and `app` user
# and that the `web` user is assigned the uid of $LANDO_HOST_UID.
set -e

# Get the lando logger
. /helpers/log.sh

# Set the module
LANDO_MODULE="platformsh-webuser"

APP_USERNAME=app
WEB_USERNAME=web

addWebuser() {
  useradd \
    --uid "$LANDO_HOST_UID" \
    --user-group \
    --home /app \
    --non-unique \
    --shell /bin/bash \
    -M \
    web > /dev/null || true
}

addAppUserIfNotExists() {
  if [[ $(getent passwd $APP_USERNAME) = "" ]]; then
    useradd \
      --user-group \
      --home /mnt \
      --shell /bin/false \
      -M \
      app > /dev/null || true
  fi
}

# Get the username of user with LANDO_HOST_UID
FOUND_USERNAME=$(getent passwd $LANDO_HOST_UID | cut -d: -f1)

# Check if web user has the correct UID
if [ "$FOUND_USERNAME" = $WEB_USERNAME ]; then
  # If so, create app user if it doesn't exist and exit
  addAppUserIfNotExists
  exit 0
fi

# Web user was not found or did not have the correct UID
# Check if a different user was found for the UID
if ! [ "$FOUND_USERNAME" = "" ]; then
  # Delete it (This may be "app"; If so, we'll add it back later)
  deluser $FOUND_USERNAME > /dev/null
fi

# Now check if there's a "web" user with a UID that is not LANDO_HOST_UID
if id -u $WEB_USERNAME >/dev/null 2>&1; then
  # Delete so we can add it with the proper UID
  deluser $WEB_USERNAME > /dev/null
fi

# At this point there is no "web" user and no user with the LANDO_HOST_UID
# Add the web user
addWebuser

# Last, in case app user is missing, or we deleted it because it had the LANDO_HOST_UID
# Create the app user if it doesn't exist
addAppUserIfNotExists

# Add to the root group
# NOTE: this seems to be necessary on M1 macs only for some reason?
addgroup app root > /dev/null || true
addgroup web root > /dev/null || true
