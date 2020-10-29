#!/bin/bash
set -e

# This script requires the following:
#   --auth        SSH key filename located in /lando/keys
#   --database    Remote drush alias, without the leading "lagoon." (openshiftProjectName value from the API)
#   --files       Remote drush alias, without the leading "lagoon." (openshiftProjectName value from the API)
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
  echo "Args"
  echo "LANDO_SSH_KEY: ${LANDO_SSH_KEY}"
  echo "LANDO_DB_ALIAS: ${LANDO_DB_ALIAS}"
  echo "LANDO_FILES_ALIAS: ${LANDO_FILES_ALIAS}"
  echo "--"
  echo "LANDO_SSH_KEY: ${LANDO_SSH_KEY}"
fi

# Sync database
if [ $LANDO_DB_ALIAS != "lagoon.none" ]; then
  # Drop and re-create database
  echo "Pushing database..."
  # Suppress drush messaging by assigning output
  LANDO_SSH_KEY=${LANDO_SSH_KEY} drush "@${LANDO_DB_ALIAS}" sql:drop -y
  # Pipe output of drush sql:dump into mysql
  LANDO_SSH_KEY=${LANDO_SSH_KEY} drush sql:dump -y | drush "@${LANDO_DB_ALIAS}" sql:cli -y
else
  echo "Skipping database"
fi

# Sync files
if [ $LANDO_FILES_ALIAS != "lagoon.none" ]; then
  # Import files with rsync
  echo "Pushing files..."
  # Suppress drush messaging by assigning output
  LANDO_SSH_KEY=${LANDO_SSH_KEY} drush rsync web/sites/default/files @${LANDO_FILES_ALIAS}:web/sites/default -y -- --omit-dir-times --no-perms --no-group --no-owner --chmod=ugo=rwX
else
  echo "Skipping files"
fi
