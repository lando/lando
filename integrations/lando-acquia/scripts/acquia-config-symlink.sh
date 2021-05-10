#!/bin/bash

# Creates a .acquia directory for the project
# which can be used by the container via symlink
ACQUIA_CONFIG_DIR="/lando/config/${LANDO_APP_NAME}/.acquia"
mkdir -p $ACQUIA_CONFIG_DIR
ln -sfn ${ACQUIA_CONFIG_DIR} /var/www/.acquia
