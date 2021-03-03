#!/bin/bash

set -e

# Get the lando logger
. /helpers/log.sh

# Set the module
LANDO_MODULE="acquia"

# Set option defaults
CODE='dev';
DATABASE='dev';
FILES='dev';
KEY='none'
SECRET='none'

# Set helpers
SITE=${PANTHEON_SITE_NAME:-${TERMINUS_SITE:-whoops}}
ENV=${TERMINUS_ENV:-dev}
PUSH_DB=""
PUSH_FILES=""

# PARSE THE ARGZZ
while (( "$#" )); do
  case "$1" in
    -k|--acquia-key|--acquia-key=*)
      echo '--'
      if [ "${1##--acquia-key=}" != "$1" ]; then
        KEY="${1##--acquia-key=}"
        shift
      else
        KEY=$2
        shift 2
      fi
      ;;
    -s|--acquia-secret|--acquia-secret=*)
      if [ "${1##--acquia-secret=}" != "$1" ]; then
        SECRET="${1##--acquia-secret=}"
        shift
      else
        SECRET=$2
        shift 2
      fi
      ;;
    -c|--code|--code=*)
      if [ "${1##--code=}" != "$1" ]; then
        CODE="${1##--code=}"
        shift
      else
        CODE=$2
        shift 2
      fi
      ;;
    -m|--message|--message=*)
      if [ "${1##--message=}" != "$1" ]; then
        MESSAGE="${1##--message=}"
        shift
      else
        MESSAGE=$2
        shift 2
      fi
      ;;
    -d|--database|--database=*)
      if [ "${1##--database=}" != "$1" ]; then
        DATABASE="${1##--database=}"
        shift
      else
        DATABASE=$2
        shift 2
      fi
      ;;
    -f|--files|--files=*)
      if [ "${1##--files=}" != "$1" ]; then
        FILES="${1##--files=}"
        shift
      else
        FILES=$2
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

# Generate token with the key passed from tooling
if [ "$KEY" != "none" ]; then
  /usr/local/bin/acli auth:login -k "$KEY" -s "$SECRET" -n
fi

# Push the codez
if [ "$CODE" != "none" ]; then
  # Switch to git root
  cd $LANDO_MOUNT;

  # Commit the goods
  echo "Pushing code to $CODE ...";
  eval "acli push:code";

fi

# Push the database
if [ "$DATABASE" != "none" ]; then
  # And push
  echo "Pushing your database... This might take a minute";
  PUSH_DB="acli push:db $DATABASE";
  eval "$PUSH_DB";
fi

# Push the files
if [ "$FILES" != "none" ]; then
  # Build the rsync command
  PUSH_FILES="acli push:files $FILES";

  # Pushing files
  eval "$PUSH_FILES"
fi

# Finish up!
lando_green "Push completed successfully!"
