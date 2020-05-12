#!/bin/bash

# Errors and logz
set -e

# Set defaults
: ${VHOST:='/opt/bitnami/extra/nginx/templates/default.conf.tpl'}

# Get the lando logger
. /helpers/log.sh

# Set the module
LANDO_MODULE="landonginx"

# Render the template if needed
mkdir -p /opt/bitnami/nginx/conf/vhosts
lando_debug "Created directory /opt/bitnami/nginx/conf/vhosts..."

# Render the templates
render-template "$VHOST" > /opt/bitnami/nginx/conf/vhosts/lando.conf
lando_info "Rendered template $VHOST to /opt/bitnami/nginx/conf/vhosts/lando.conf"

# Detect and run the correct entrypoint script. THANKS BITNAMI!
if [ -f "/opt/bitnami/scripts/nginx/entrypoint.sh" ]; then
  /opt/bitnami/scripts/nginx/entrypoint.sh /opt/bitnami/scripts/nginx/run.sh
else
  /entrypoint.sh /run.sh
fi
