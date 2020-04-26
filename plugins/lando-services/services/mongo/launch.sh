#!/bin/bash

# Errors and logz
set -e

# Detect and run the correct entrypoint script. THANKS BITNAMI!
if [ -f "/opt/bitnami/scripts/memcached/entrypoint.sh" ]; then
  /opt/bitnami/scripts/memcached/entrypoint.sh /opt/bitnami/scripts/memcached/run.sh
else
  /entrypoint.sh /run.sh
fi
