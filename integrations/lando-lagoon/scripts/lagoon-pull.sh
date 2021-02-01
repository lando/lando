#!/bin/bash

set -e

# Get the lando logger
. /helpers/log.sh

# Set the module
LANDO_MODULE="lagoon"

# This script requires the following:
#   --keyfile        SSH key filename
#   --database       Remote drush alias, without the leading "lagoon." (openshiftProjectName value from the API)
#   --files          Remote drush alias, without the leading "lagoon." (openshiftProjectName value from the API)
#
# Set DEBUG=1 for helpful output
DEBUG=0

if [ $DEBUG = 1 ]; then
  echo "1: ${1}"
  echo "2: ${2}"
  echo "3: ${3}"
fi

# Set option defaults
LANDO_SSH_KEY=
LANDO_DB_ALIAS="none"
LANDO_FILES_ALIAS="none"

# Set drupal paths
DRUPAL_FILES_PATH="web/sites/default/files"

# Auth options
AUTH_HOST="ssh.lagoon.amazeeio.cloud"
AUTH_USER="lagoon"
AUTH_PORT="32222"

# PARSE THE ARGS
while (( "$#" )); do
  case "$1" in
    --keyfile|--keyfile=*)
      if [ "${1##--keyfile=}" != "$1" ]; then
        LANDO_SSH_KEY="${1##--keyfile=}"
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
    -p|--port|--port=*)
      if [ "${1##--port=}" != "$1" ]; then
        AUTH_PORT="${1##--port=}"
        shift
      else
        AUTH_PORT=$2
        shift 2
      fi
      ;;
    -h|--host|--host=*)
      if [ "${1##--host=}" != "$1" ]; then
        AUTH_HOST="${1##--host=}"
        shift
      else
        AUTH_HOST=$2
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

# Dynamically prefix alias if project name was not included
if [[ "${LANDO_DB_ALIAS}" != "${LANDO_LAGOON_PROJECT}"* ]]; then
  LANDO_DB_ALIAS="${LANDO_LAGOON_PROJECT}-${LANDO_DB_ALIAS}"
fi
if [[ "${LANDO_FILES_ALIAS}" != "${LANDO_LAGOON_PROJECT}"* ]]; then
  LANDO_FILES_ALIAS="${LANDO_LAGOON_PROJECT}-${LANDO_FILES_ALIAS}"
fi

# Prefix aliases with lagoon.
LANDO_DB_ALIAS="lagoon.${LANDO_DB_ALIAS}"
LANDO_FILES_ALIAS="lagoon.${LANDO_FILES_ALIAS}"

if [ $DEBUG = 1 ]; then
  echo "--"
  echo "Args"
  echo "LANDO_SSH_KEY: ${LANDO_SSH_KEY}"
  echo "LANDO_DB_ALIAS: ${LANDO_DB_ALIAS}"
  echo "LANDO_FILES_ALIAS: ${LANDO_FILES_ALIAS}"
  echo "--"
  echo "LANDO_SSH_KEY: ${LANDO_SSH_KEY}"
fi

# Update aliases
lando_pink "Refreshing aliases..."
drush la 1>/dev/null

# Sync database
if [ "${LANDO_DB_ALIAS}" != "lagoon.${LANDO_LAGOON_PROJECT}-none" ]; then
  # Validate environment exists
  lando_pink "Validating database alias @${LANDO_DB_ALIAS} exists and you have access to it..."
  if ! drush la | grep -q ${LANDO_DB_ALIAS}; then
    lando_red "@${LANDO_DB_ALIAS} does not appear to be a valid environment!"
    exit 1
  fi


  # Validate we can ping the remote environment
  if ! drush "@${LANDO_DB_ALIAS}" status -y >/dev/null; then
    lando_red "Database alias @${LANDO_DB_ALIAS} access failed!"
    exit 1
  fi

  lando_green "Database alias @${LANDO_DB_ALIAS} access confirmed!"

  # Suppress drush messaging by assigning output
  echo "Destroying all current tables in database if needed... "
  drush sql:drop -y >/dev/null

  # Drop tables and import from remote
  echo "Pulling your database... This miiiiight take a minute"
  LANDO_SSH_KEY=${LANDO_SSH_KEY} drush "@${LANDO_DB_ALIAS}" sql:dump -y | drush sql:cli -y
else
  lando_green "Skipping database"
fi

# Sync files
if [ "${LANDO_FILES_ALIAS}" != "lagoon.${LANDO_LAGOON_PROJECT}-none" ]; then
  # Validate environment exists
  lando_pink "Validating file alias @${LANDO_FILES_ALIAS} exists and you have access to it..."
  if ! drush la | grep -q ${LANDO_FILES_ALIAS}; then
    lando_red "@${LANDO_FILES_ALIAS} does not appear to be a valid environment!"
    exit 1
  fi

  # Validate we can ping the remote environment
  if ! drush "@${LANDO_FILES_ALIAS}" status -y >/dev/null; then
    lando_red "Files alias @${LANDO_FILES_ALIAS} access failed!"
    exit 1
  fi
  lando_green "Files alias @${LANDO_FILES_ALIAS} access confirmed!"

  # Get the files path
  # NOTE: It may not be safe to assume this "goes well" under all conditions eg does something
  # helpful when it fails but lets wait until we know more before we do anything else
  DRUPAL_FILES_PATH=$(drush @${LANDO_FILES_ALIAS} dd files | tr -d '\n' 2>/dev/null)
  lando_pink "Attemping to sync files to/from directory: ${DRUPAL_FILES_PATH}"

  # Import files with rsync
  LANDO_SSH_KEY=${LANDO_SSH_KEY} drush rsync "@${LANDO_FILES_ALIAS}":${DRUPAL_FILES_PATH} ${DRUPAL_FILES_PATH} -y
else
  lando_green "Skipping files"
fi

# Finish up!
lando_green "Pull completed successfully!"
