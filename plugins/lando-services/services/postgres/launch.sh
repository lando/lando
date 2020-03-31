#!/bin/bash

# Errors and logz
set -e

# Try the new entrypoint and then fallback to the older one
/opt/bitnami/scripts/postgresql/entrypoint.sh /opt/bitnami/scripts/postgresql/run.sh \
  || /entrypoint.sh /run.sh
