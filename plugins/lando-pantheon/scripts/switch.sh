#!/bin/bash
set -e

# Get the lando logger
. /helpers/log.sh

# Set the module
LANDO_MODULE="pantheon"

# Set the default terminus environment to the currently checked out branch
TERMINUS_ENV=$(cd $LANDO_MOUNT && git branch | sed -n -e 's/^\* \(.*\)/\1/p')

# Map the master branch to dev
if [ "$TERMINUS_ENV" == "master" ]; then
  TERMINUS_ENV="dev"
fi

# Set option defaults
AUTH=${TERMINUS_USER}

# Set helpers
FRAMEWORK=${FRAMEWORK:-drupal}
SITE=${PANTHEON_SITE_NAME:-${TERMINUS_SITE:-whoops}}
ENV=${TERMINUS_ENV:-dev}
SWITCH_ENV=""

# PARSE THE ARGZZ
while (( "$#" )); do
  case "$1" in
    --auth|--auth=*)
      if [ "${1##--auth=}" != "$1" ]; then
        AUTH="${1##--auth=}"
        shift
      else
        AUTH=$2
        shift 2
      fi
      ;;
    -e|--env|--env=*)
      if [ "${1##--env=}" != "$1" ]; then
        ENV="${1##--env=}"
        shift
      else
        ENV=$2
        shift 2
      fi
      ;;
    --no-files)
        NO_FILES=none
        shift
      ;;
    --no-db)
        NO_DB=none
        shift
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

# Set the files/db values
FILES=${NO_FILES:-${ENV:-dev}}
DATABASE=${NO_DB:-${ENV:-dev}}

# Auth procedure
/helpers/auth.sh "$AUTH" "$SITE" "$ENV"

# LOGZ
lando_pink "Switching to $ENV..."

# Stash the .lando.yml in case the branch we switched to does not have one
CURRENT_LANDO_YML="$LANDO_MOUNT/.lando.yml"
STASHED_LANDO_YML="/tmp/.lando.yml.$ENV"
cp -rf "$CURRENT_LANDO_YML" "$STASHED_LANDO_YML"

# Build out our switch command by piggybacking off of pull
SWITCH_ENV="/helpers/pull.sh --code=$ENV --files=$FILES --database=$DATABASE --rsync --no-auth"
eval "$SWITCH_ENV"

# Move in the .lando.yml if the branch we switched to does not have one
if [ ! -f "$CURRENT_LANDO_YML" ]; then
  cp -rf "$STASHED_LANDO_YML" "$CURRENT_LANDO_YML"
fi

# Finish up!
lando_green "Switch completed!"
