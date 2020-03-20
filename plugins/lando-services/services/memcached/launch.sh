#!/bin/bash

# Errors and logz
set -e

# Try the new entrypoint and then fallback to the older one
/opt/bitnami/scripts/memcached/entrypoint.sh /opt/bitnami/scripts/memcached/run.s \
  || /entrypoint.sh /run.sh \
  || /app-entrypoint.sh /run.sh
