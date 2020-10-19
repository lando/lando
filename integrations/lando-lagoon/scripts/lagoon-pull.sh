#!/bin/sh

# This script relies on the following environment variables:
#   LANDO_DB_HOST
#   LANDO_DB_USER
#   LANDO_DB_PASS
#   LANDO_DB_NAME
#   LANDO_SSH_KEY
#   LANDO_DRUSH_ALIAS

# TODO: dynamically set in tooling
LANDO_DRUSH_ALIAS="lagoon.drupal9-example-simple-9-x"

# TODO: dynamically set in tooling
LANDO_SSH_KEY="/lando/keys/lagoon_milano-at-thinktandem.io_ssh.lagoon.amazeeio.cloud"

# Drop and re-create database
mysql -h ${LANDO_DB_HOST} -u ${LANDO_DB_USER} -p${LANDO_DB_PASS} -e "DROP DATABASE ${LANDO_DB_NAME};CREATE DATABASE ${LANDO_DB_NAME};"
# Pipe output of drush sql:dump into mysql
drush "@${LANDO_DRUSH_ALIAS}" sql:dump | mysql -h ${LANDO_DB_HOST} -u ${LANDO_DB_USER} -p${LANDO_DB_PASS} ${LANDO_DB_NAME}

# Import files with rsync
drush rsync @${DRUSH_ALIAS}:web/sites/default/files web/sites/default -y
