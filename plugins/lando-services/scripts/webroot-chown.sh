#!/bin/sh

set -e

# Make sure we set the ownership of the mount when we start the app
nohup chown -R $LANDO_WEBROOT_USER:$LANDO_WEBROOT_USER $LANDO_MOUNT &>/dev/null &

# Also make sure we chown /var/www
nohup chown $LANDO_WEBROOT_USER:$LANDO_WEBROOT_USER /var/www &>/dev/null &
