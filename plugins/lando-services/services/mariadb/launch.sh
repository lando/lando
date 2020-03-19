#!/bin/bash

# Errors and logz
set -e

# Try the new entrypoint and then fallback to the older one
/opt/bitnami/scripts/mariadb/entrypoint.sh /opt/bitnami/scripts/mariadb/run.sh \
  || /entrypoint.sh /run.sh
