#!/bin/bash

# Errors and logz
set -e

# Set defaults
: ${VHOST:="$1"}

# Get the lando logger
. /helpers/log.sh

# Set the module
LANDO_MODULE="landovarnish"

# Render the template if needed
mkdir -p /opt/bitnami/nginx/conf/vhosts
lando_debug "Created directory /opt/bitnami/nginx/conf/vhosts..."
ln -sf "${NGINX_CONFDIR}/server_blocks" "${NGINX_CONFDIR}/vhosts"
lando_debug "Ensured legacy vhosts directory remains symlinked for backwards compatibility..."
lando_debug $(cat /opt/bitnami/nginx/conf/nginx.conf)

# Render the template if render-template exists
sed 's@{{LANDO_VARNISH_ALIAS}}@'"${LANDO_VARNISH_ALIAS}"'@g' "$VHOST" > /opt/bitnami/nginx/conf/vhosts/lando.conf

# Log
lando_info "Rendered template $VHOST to /opt/bitnami/nginx/conf/vhosts/lando.conf"
lando_debug $(cat "$VHOST")

# Run
/opt/bitnami/scripts/nginx/entrypoint.sh /opt/bitnami/scripts/nginx/run.sh
