#!/bin/bash

# Errors and logz
set -e

# Try the new entrypoint and then fallback to the older one
/opt/bitnami/scripts/nginx/entrypoint.sh /opt/bitnami/scripts/nginx/run.sh \
  || /entrypoint.sh /run.sh
