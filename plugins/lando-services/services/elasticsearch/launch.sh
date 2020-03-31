#!/bin/bash

# Errors and logz
set -e

# Try the new entrypoint and then fallback to the older one
/opt/bitnami/scripts/elasticsearch/entrypoint.sh /opt/bitnami/scripts/elasticsearch/run.sh \
  || /entrypoint.sh /run.sh
