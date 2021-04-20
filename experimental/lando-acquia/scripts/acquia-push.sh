#!/bin/bash

set -e

# Get the lando logger
. /helpers/log.sh

# Set the module
LANDO_MODULE="acquia"

# Set option defaults
CODE='none';
DATABASE='none';
FILES='none';
KEY='none'
SECRET='none'

# PARSE THE ARGZZ
while (( "$#" )); do
  case "$1" in
    -k|--key|--key=*)
      echo '--'
      if [ "${1##--key=}" != "$1" ]; then
        KEY="${1##--key=}"
        shift
      else
        KEY=$2
        shift 2
      fi
      ;;
    -s|--secret|--secret=*)
      if [ "${1##--secret=}" != "$1" ]; then
        SECRET="${1##--secret=}"
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

# @TODO: if lando has not already generated and exchanged a key with acquia cloud let us do that here
# Let's do this?

# Push the codez
if [ "$CODE" != "none" ]; then
  cd $LANDO_MOUNT
  acli -n push:code
fi

# Push the database
if [ "$DATABASE" != "none" ]; then
  acli -n push:db "$AH_SITE_GROUP.$DATABASE"
fi

# Push the files
if [ "$FILES" != "none" ]; then
  acli -n push:files "$AH_SITE_GROUP.$FILES"
fi

# Finish up!
echo -n "    "
lando_check "Push completed successfully!"
