#!/bin/sh

set -e

# Make sure we set the ownership of the webroot when we start the app
nohup chown -R $LANDO_WEBROOT_USER:$LANDO_WEBROOT_USER $LANDO_WEBROOT &>/dev/null &
