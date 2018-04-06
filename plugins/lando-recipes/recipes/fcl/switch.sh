#!/bin/bash

# Set the default terminus environment to the currently checked out branch
TERMINUS_ENV=$(cd $LANDO_MOUNT && git branch | sed -n -e 's/^\* \(.*\)/\1/p')

# Map the master branch to dev
if [ "$TERMINUS_ENV" == "master" ]; then
  TERMINUS_ENV="dev"
fi

# Set helpers
FRAMEWORK=${FRAMEWORK:-drupal}
SITE=${PANTHEON_SITE_NAME:-${TERMINUS_SITE:-whoops}}
ENV=${TERMINUS_ENV:-dev}
SWITCH_ENV=""
GREEN='\033[0;32m'

# PARSE THE ARGZZ
while (( "$#" )); do
  case "$1" in
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
      echo "Error: Unsupported flag $1" >&2
      exit 1
      ;;
    *)
      ENV="$1"
      shift
      ;;
  esac
done

# Set the files/db values
FILES=${NO_FILES:-${ENV:-dev}}
DATABASE=${NO_DB:-${ENV:-dev}}

# LOGZ
echo "Switching to $ENV..."

# Validate this environment
echo "Validating whether $ENV is a valid environment and that you have access to it"
terminus env:list $SITE | grep $ENV || exit 1
echo "Logged in as `terminus auth:whoami`"

# Stash the .lando.yml in case the branch we switched to does not have one
CURRENT_LANDO_YML="$LANDO_MOUNT/.lando.yml"
STASHED_LANDO_YML="/tmp/.lando.yml.$ENV"
cp -rf "$CURRENT_LANDO_YML" "$STASHED_LANDO_YML"

# Build out our switch command by piggybacking off of pull
SWITCH_ENV="/helpers/pull.sh --code=$ENV --files=$FILES --database=$DATABASE --rsync"
eval "$SWITCH_ENV"

# Move in the .lando.yml if the branch we switched to does not have one
if [ ! -f "$CURRENT_LANDO_YML" ]; then
  cp -rf "$STASHED_LANDO_YML" "$CURRENT_LANDO_YML"
fi

# Finish up!
echo ""
printf "${GREEN}Switch complete!"
echo ""
