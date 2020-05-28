#!/bin/bash

# Errors and logz
set -e

# Set defaults
: ${VHOST:="$1"}

# Get the lando logger
. /helpers/log.sh

# Set the module
LANDO_MODULE="landonginx"

# Render the template if needed
mkdir -p /opt/bitnami/nginx/conf/vhosts
lando_debug "Created directory /opt/bitnami/nginx/conf/vhosts..."
ln -sf "${NGINX_CONFDIR}/server_blocks" "${NGINX_CONFDIR}/vhosts"
lando_debug "Ensured legacy vhosts directory remains symlinked for backwards compatibility..."

# Render the template if render-template exists
# @NOTE: is this a sufficient protection?
if [ -x "$(command -v render-template)" ]; then
  render-template "$VHOST" > /opt/bitnami/nginx/conf/vhosts/lando.conf
else
  cat "$VHOST"
  sed 's@{{LANDO_WEBROOT}}@'"${LANDO_WEBROOT}"'@g' "$VHOST" > /opt/bitnami/nginx/conf/vhosts/lando.conf
fi

# Log
lando_info "Rendered template $VHOST to /opt/bitnami/nginx/conf/vhosts/lando.conf"


# Detect and run the correct entrypoint script. THANKS BITNAMI!
if [ -f "/opt/bitnami/scripts/nginx/entrypoint.sh" ]; then
  /opt/bitnami/scripts/nginx/entrypoint.sh /opt/bitnami/scripts/nginx/run.sh
else
  /entrypoint.sh /run.sh
fi
