#!/bin/bash

# Errors and logz
set -e

# Try the new entrypoint and then fallback to the older one
/opt/bitnami/scripts/apache/entrypoint.sh /opt/bitnami/scripts/apache/run.sh \
  || /entrypoint.sh /run.sh \
  || /app-entrypoint.sh httpd -f /opt/bitnami/apache/conf/httpd.conf -DFOREGROUND
