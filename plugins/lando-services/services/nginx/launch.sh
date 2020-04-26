#!/bin/bash

# Errors and logz
set -e

# Detect and run the correct entrypoint script. THANKS BITNAMI!
if [ -f "/opt/bitnami/scripts/nginx/entrypoint.sh" ]; then
  /opt/bitnami/scripts/nginx/entrypoint.sh /opt/bitnami/scripts/nginx/run.sh
else
  /entrypoint.sh /run.sh
fi
