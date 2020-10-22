#!/bin/bash

set -e

# This script requires the following:
#
# env vars:
#   LANDO_DB_HOST
#   LANDO_DB_USER
#   LANDO_DB_PASS
#   LANDO_DB_NAME
#   LAGOON_PROJECT
#
# args:
#   --auth        SSH key filename located in /lando/keys
#   --database    Remote drush alias, without the leading "lagoon." (openshiftProjectName value from the API)
#   --files       Remote drush alias, without the leading "lagoon." (openshiftProjectName value from the API)
#
# Set DEBUG=1 for helpful output
#
DEBUG=0

if [ $DEBUG = 1 ]; then
  echo "1: ${1}"
  echo "2: ${2}"
  echo "3: ${3}"
fi

# Set option defaults
LANDO_SSH_KEY=
LAGOON_ENV="main"
LANDO_DB_ALIAS="none"
LANDO_FILES_ALIAS="none"

# PARSE THE ARGS
while (( "$#" )); do
  case "$1" in
    --auth|--auth=*)
      if [ "${1##--auth=}" != "$1" ]; then
        LANDO_SSH_KEY="${1##--auth=}"
        shift
      else
        LANDO_SSH_KEY=$2
        shift 2
      fi
      ;;
    -d|--database|--database=*)
      if [ "${1##--database=}" != "$1" ]; then
        LANDO_DB_ALIAS="${1##--database=}"
        shift
      else
        LANDO_DB_ALIAS=$2
        shift 2
      fi
      ;;
    -f|--files|--files=*)
      if [ "${1##--files=}" != "$1" ]; then
        LANDO_FILES_ALIAS="${1##--files=}"
        shift
      else
        LANDO_FILES_ALIAS=$2
        shift 2
      fi
      ;;
    --)
      shift
      break
      ;;
    -*|--*=)
      shift
      ;;
    *)
      shift
      ;;
  esac
done

# Set values from input
LANDO_SSH_KEY="/lando/keys/${LANDO_SSH_KEY}"
LANDO_DB_ALIAS="lagoon.${LANDO_DB_ALIAS}"
LANDO_FILES_ALIAS="lagoon.${LANDO_FILES_ALIAS}"

if [ $DEBUG = 1 ]; then
  echo "--"
  echo "Env vars"
  echo "LANDO_DB_HOST: ${LANDO_DB_HOST}"
  echo "LANDO_DB_USER: ${LANDO_DB_USER}"
  echo "LANDO_DB_PASS: ${LANDO_DB_PASS}"
  echo "LANDO_DB_NAME: ${LANDO_DB_NAME}"
  echo "LAGOON_PROJECT: ${LAGOON_PROJECT}"
  echo "--"
  echo "Args"
  echo "LANDO_SSH_KEY: ${LANDO_SSH_KEY}"
  echo "LAGOON_ENV: ${LAGOON_ENV}"
  echo "LANDO_DB_ALIAS: ${LANDO_DB_ALIAS}"
  echo "LANDO_FILES_ALIAS: ${LANDO_FILES_ALIAS}"
  echo "--"
  echo "LANDO_SSH_KEY: ${LANDO_SSH_KEY}"
fi

# Sync database
if [ $LANDO_DB_ALIAS != "none" ]; then
  # Drop and re-create database
  echo "Pulling database..."
  mysql -h ${LANDO_DB_HOST} -u ${LANDO_DB_USER} -p${LANDO_DB_PASS} -e "DROP DATABASE ${LANDO_DB_NAME};CREATE DATABASE ${LANDO_DB_NAME};"
  # Pipe output of drush sql:dump into mysql
  LANDO_SSH_KEY=${LANDO_SSH_KEY} drush "@${LANDO_DB_ALIAS}" sql:dump | mysql -h ${LANDO_DB_HOST} -u ${LANDO_DB_USER} -p${LANDO_DB_PASS} ${LANDO_DB_NAME}
else
  echo "Skipping database"
fi

# Sync files
if [ $LANDO_FILES_ALIAS != "none" ]; then
  # Import files with rsync
  echo "Pulling files..."
  LANDO_SSH_KEY=${LANDO_SSH_KEY} drush rsync @${LANDO_FILES_ALIAS}:web/sites/default/files web/sites/default -y
else
  echo "Skipping files"
fi
