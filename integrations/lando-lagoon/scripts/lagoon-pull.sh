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
#   --environment Lagoon environment
#   --database    yes/no
#   --files       yes/no
#
# Set DEBUG=1 for helpful output
#
DEBUG=0

if [ $DEBUG = 1 ]; then
  echo "1: ${1}"
  echo "2: ${2}"
  echo "3: ${3}"
  echo "4: ${4}"
fi

# Set option defaults
LANDO_SSH_KEY=
LAGOON_ENV="main"
LANDO_SYNC_DB="no"
LANDO_SYNC_FILES="no"

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
    -e|--environment|--environment=*)
      if [ "${1##--environment=}" != "$1" ]; then
        LAGOON_ENV="${1##--environment=}"
        shift
      else
        LAGOON_ENV=$2
        shift 2
      fi
      ;;
    -d|--database|--database=*)
      if [ "${1##--database=}" != "$1" ]; then
        LANDO_SYNC_DB="${1##--database=}"
        shift
      else
        LANDO_SYNC_DB=$2
        shift 2
      fi
      ;;
    -f|--files|--files=*)
      if [ "${1##--files=}" != "$1" ]; then
        LANDO_SYNC_FILES="${1##--files=}"
        shift
      else
        LANDO_SYNC_FILES=$2
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
LANDO_SSH_KEY="/lando/keys/$LANDO_SSH_KEY"
LANDO_DRUSH_ALIAS="lagoon.${LAGOON_PROJECT}-${LAGOON_ENV}"

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
  echo "LANDO_SYNC_DB: ${LANDO_SYNC_DB}"
  echo "LANDO_SYNC_FILES: ${LANDO_SYNC_FILES}"
  echo "--"
  echo "Args"
  echo "LANDO_SSH_KEY: ${LANDO_SSH_KEY}"
  echo "LANDO_DRUSH_ALIAS: ${LANDO_DRUSH_ALIAS}"
fi

# Sync database
if [ $LANDO_SYNC_DB = "yes" ]; then
  # Drop and re-create database
  echo "Pulling database..."
  mysql -h ${LANDO_DB_HOST} -u ${LANDO_DB_USER} -p${LANDO_DB_PASS} -e "DROP DATABASE ${LANDO_DB_NAME};CREATE DATABASE ${LANDO_DB_NAME};"
  # Pipe output of drush sql:dump into mysql
  LANDO_SSH_KEY=${LANDO_SSH_KEY} drush "@${LANDO_DRUSH_ALIAS}" sql:dump | mysql -h ${LANDO_DB_HOST} -u ${LANDO_DB_USER} -p${LANDO_DB_PASS} ${LANDO_DB_NAME}
fi

# Sync files
if [ $LANDO_SYNC_FILES = "yes" ]; then
  # Import files with rsync
  echo "Pulling files..."
  LANDO_SSH_KEY=${LANDO_SSH_KEY} drush rsync @${LANDO_DRUSH_ALIAS}:web/sites/default/files web/sites/default -y
fi
