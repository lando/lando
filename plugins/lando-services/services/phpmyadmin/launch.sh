#!/bin/bash

# Errors and logz
set -e

# Try the new entrypoint and then fallback to the older one
/docker-entrypoint.sh apache2-foreground \
  || /run.sh phpmyadmin
