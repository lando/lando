#!/bin/bash

# Errors and logz
set -e

# Enable SSL if we have to
if [ -f "/etc/apache2/mods-available/ssl.load" ]; then
  echo "Enabling apache ssl modz"
  cp -rf /etc/apache2/mods-available/ssl* /etc/apache2/mods-enabled || true
  cp -rf /etc/apache2/mods-available/socache_shmcb* /etc/apache2/mods-enabled || true
fi

# Detect and run the correct entrypoint script. THANKS BITNAMI!
if [ -f "/opt/bitnami/scripts/apache/entrypoint.sh" ]; then
  /opt/bitnami/scripts/apache/entrypoint.sh /opt/bitnami/scripts/apache/run.sh
elif [ -f "/app-entrypoint.sh" ]; then
  /app-entrypoint.sh httpd -f /opt/bitnami/apache/conf/httpd.conf -DFOREGROUND
else
  /entrypoint.sh /run.sh
fi
