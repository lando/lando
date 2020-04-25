#!/bin/bash

# Errors and logz
set -e

# Detect and run the correct entrypoint script. THANKS BITNAMI!
if [ -f "/opt/bitnami/scripts/mysql/entrypoint.sh" ]; then
  /opt/bitnami/scripts/mysql/entrypoint.sh /opt/bitnami/scripts/mysql/run.sh
else
  /entrypoint.sh /run.sh
fi
