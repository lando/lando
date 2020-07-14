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
MESSAGE="My Awesome Lando-based commit"
CODE=${TERMINUS_ENV:-dev}
DATABASE=${TERMINUS_ENV:-dev}
FILES=${TERMINUS_ENV:-dev}

# Set helpers
FRAMEWORK=${FRAMEWORK:-drupal}
SITE=${PANTHEON_SITE_NAME:-${TERMINUS_SITE:-whoops}}
ENV=${TERMINUS_ENV:-dev}
PV=""
PUSH_DB=""
PUSH_FILES=""

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

# Do some basic valdiation on test/live pushing
if [ "$CODE" == "test" ] || [ "$CODE" == "live" ]; then
  error "Cannot push the code to the test or live environments"
  exit 3
fi
if [ "$DATABASE" == "test" ] || [ "$DATABASE" == "live" ]; then
  error "Cannot push the database to the test or live environments"
  exit 3
fi
if [ "$FILES" == "test" ] || [ "$FILES" == "live" ]; then
  error "Cannot push the files to the test or live environments"
  exit 3
fi

# Go through the auth procedure
/helpers/auth.sh "$AUTH" "$SITE"

# Push the codez
if [ "$CODE" != "none" ]; then
  # Validate before we begin
  lando_pink "Validating you can push code to $CODE..."
  terminus env:info $SITE.$CODE
  lando_green "Confirmed!"

  # Get connection mode
  lando_pink "Checking connection mode"
  CONNECTION_MODE=$(terminus env:info $SITE.$CODE --field=connection_mode)
  # If we are not in git mode lets check for uncommited changes
  if [ "$CONNECTION_MODE" != "git" ]; then
    # Get the code diff
    CODE_DIFF=$(terminus env:diffstat $SITE.$CODE --format=json)
    if [ "$CODE_DIFF" != "[]" ]; then
      lando_yellow "Lando has detected you have uncommitted changes on Pantheon."
      lando_yellow "Please login to your Pantheon dashboard, commit those changes and then try lando push again."
      exit 5
    else
      lando_yellow "Changing connection mode to git for the pushy push"
      terminus connection:set $SITE.$CODE git
    fi
  fi
  lando_green "Connected with git"

  # Switch to git root
  cd $LANDO_MOUNT

  # Get the git branch
  GIT_BRANCH=$CODE

  # Get on the right branch
  if [ "$CODE" == "dev" ]; then
    GIT_BRANCH=master
  fi

  # Set the git config if we need to
  git config user.name "$(terminus auth:whoami --field='First Name') $(terminus auth:whoami --field='Last Name')"
  git config user.email "$(terminus auth:whoami --field='Email')"

  # Commit the goods
  echo "Pushing code to $CODE as $(git config --local --get user.name) <$(git config --local --get user.email)> ..."
  git checkout $GIT_BRANCH
  git add --all
  git commit -m "$MESSAGE" --allow-empty
  git push origin $GIT_BRANCH

  # Set the mode back to what it was before because we are responsible denizens
  if [ "$CONNECTION_MODE" != "git" ]; then
    echo "Changing connection mode back to $CONNECTION_MODE"
    terminus connection:set $SITE.$CODE $CONNECTION_MODE
  fi
fi

# Push the database
if [ "$DATABASE" != "none" ]; then
  # Validate before we begin
  lando_pink "Validating you can push data to $DATABASE..."
  terminus env:info $SITE.$DATABASE
  lando_green "Confirmed!"

  # Wake up the site so we can actually connect
  lando_pink "Making sure your database is awake!"
  terminus env:wake $SITE.$DATABASE
  lando_green "Awake!"

  # And push
  echo "Pushing your database... This miiiiight take a minute"
  REMOTE_CONNECTION="$(terminus connection:info $SITE.$DATABASE --field=mysql_command)"
  PUSH_DB="mysqldump -u pantheon -ppantheon -h database --no-autocommit --single-transaction --opt -Q pantheon | $REMOTE_CONNECTION"
  eval "$PUSH_DB"
fi

# Push the files
if [ "$FILES" != "none" ]; then
  # Validate before we begin
  lando_pink "Validating you can push files to $FILES..."
  terminus env:info $SITE.$FILES
  lando_green "Confirmed!"

  # Build the rsync command
  PUSH_FILES="rsync -rLvz \
    --size-only \
    --ipv4 \
    --progress \
    --exclude js \
    --exclude css \
    --exclude ctools \
    --exclude imagecache \
    --exclude xmlsitemap \
    --exclude backup_migrate \
    --exclude php/twig/* \
    --exclude styles \
    --exclude less \
    -e 'ssh -p 2222' \
    $LANDO_WEBROOT/$FILEMOUNT/. \
     --temp-dir=~/tmp/ \
    $FILES.$PANTHEON_SITE@appserver.$FILES.$PANTHEON_SITE.drush.in:files/"

  # Pushing files
  eval "$PUSH_FILES"
fi

# Finish up!
lando_green "Push completed successfully!"
