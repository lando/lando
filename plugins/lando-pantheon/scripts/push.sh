#!/bin/bash
set -e

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
GREEN='\033[0;32m'
DEFAULT_COLOR='\033[0;0m'

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
  echo "Cannot push the code to the test or live environments"
  exit 3
fi
if [ "$DATABASE" == "test" ] || [ "$DATABASE" == "live" ]; then
  echo "Cannot push the database to the test or live environments"
  exit 3
fi
if [ "$FILES" == "test" ] || [ "$FILES" == "live" ]; then
  echo "Cannot push the files to the test or live environments"
  exit 3
fi

# Go through the auth procedure
/helpers/auth.sh "$AUTH" "$SITE"

# Push the codez
if [ "$CODE" != "none" ]; then

  # Get connection mode
  echo "Checking connection mode"
  CONNECTION_MODE=$(terminus env:info $SITE.$ENV --field=connection_mode)

  # If we are not in git mode lets check for uncommited changes
  if [ "$CONNECTION_MODE" != "git" ]; then

    # Get the code diff
    CODE_DIFF=$(terminus env:diffstat $SITE.$ENV --format=json)
    if [ "$CODE_DIFF" != "[]" ]; then
      echo "Lando has detected you have uncommitted changes on Pantheon."
      echo "Please login to your Pantheon dashboard, commit those changes and then try lando push again."
      exit 5
    else
      echo "Changing connection mode to git for the pushy push"
      terminus connection:set $SITE.$ENV git
    fi

  fi

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
  git config user.email "$TERMINUS_USER"

  # Commit the goods
  echo "Pushing code to $CODE as $(git config --local --get user.name) <$(git config --local --get user.email)> ..."
  git checkout $GIT_BRANCH
  git add --all
  git commit -m "$MESSAGE" --allow-empty
  git push origin $GIT_BRANCH

  # Set the mode back to what it was before because we are responsible denizens
  if [ "$CONNECTION_MODE" != "git" ]; then
    echo "Changing connection mode back to $CONNECTION_MODE"
    terminus connection:set $SITE.$ENV $CONNECTION_MODE
  fi
fi

# Push the database
if [ "$DATABASE" != "none" ]; then

  # Wake up the site so we can actually connect
  echo "Making sure your database is awake!"
  terminus env:wake $SITE.$ENV

  # And push
  echo "Pushing database to $DATABASE..."
  REMOTE_CONNECTION="$(terminus connection:info $SITE.$ENV --field=mysql_command)"
  PUSH_DB="mysqldump -u pantheon -ppantheon -h database --no-autocommit --single-transaction --opt -Q pantheon | $REMOTE_CONNECTION"
  eval "$PUSH_DB"

fi

# Push the files
if [ "$FILES" != "none" ]; then

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
  echo "Pushing files to $FILES..."
  eval "$PUSH_FILES"

fi

# Finish up!
echo ""
printf "${GREEN}Push completed succesfully!${DEFAULT_COLOR}"
echo ""
