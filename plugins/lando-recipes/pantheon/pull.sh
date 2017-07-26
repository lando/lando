#!/bin/bash

# Set option defaults
DATABASE=${TERMINUS_ENV:-dev}
FILES=${TERMINUS_ENV:-dev}
RSYNC=false

# Set helpers
FRAMEWORK=${FRAMEWORK:-drupal}
SITE=${PANTHEON_SITE_NAME:-${TERMINUS_SITE:-whoops}}
ENV=${TERMINUS_ENV:-dev}
FILE_DUMP="/tmp/files.tar.gz"
PV=""
PULL_DB=""
PULL_FILES=""

# PARSE THE ARGZZ
while (( "$#" )); do
  case "$1" in
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
    --rsync)
        RSYNC=$1
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
      shift
      ;;
  esac
done

# Inform the user of things
echo "Preparing to grab database and files from the $DATABASE and $FILES environments respectively..."

# Do some basic validation to make sure we are logged in
echo "Verifying that you are logged in and authenticated by getting info about $SITE..."
terminus site:info $SITE || exit 1
echo "Logged in as `terminus auth:whoami`"
echo "Detected that $SITE is a $FRAMEWORK site"

# Get the database
if [ "$DATABASE" != "none" ]; then

  # Get drush aliases
  echo "Downloading drush aliases..."
  terminus aliases

  # Only pull the DB on drupal for now
  if [ "$FRAMEWORK" != "wordpress" ]; then
    if drush sa | grep @pantheon.playbox.dev 2>&1; then

      # Cleaning things up for a more efficient pull
      echo "Clearing remote cache to shrink db size"
      if [ "$FRAMEWORK" == "drupal8" ]; then
        drush @pantheon.$SITE.$ENV cr all --strict=0
      else
        drush @pantheon.$SITE.$ENV cc all --strict=0
      fi

      # Build the DB command
      PULL_DB="drush @pantheon.$SITE.$DATABASE sql-dump"
      if command -v pv >/dev/null 2>&1; then
        PULL_DB="$PULL_DB | pv"
      fi
      PULL_DB="$PULL_DB | mysql --user=pantheon --password=pantheon --database=pantheon --host=database --port=3306"

      # Importing database
      echo "Importing database..."
      eval "$PULL_DB"

    else
      echo "No drush alias detected for $SITE.$ENV. Please make sure you have full access to this site."
      exit 1
    fi

  else
    # Do some post DB things on WP
    # if [ "$FRAMEWORK" == "wordpress" ]; then
    #  wp search-replace '$ENV-$SITE.pantheon.io' '$LANDO_APP_NAME.lndo.site'
    # fi
    echo "WordPress database pull not currently supported. See: https://docs.lndo.io/tutorials/pantheon-working.html for manual db import steps."
  fi

fi

# Get the files
if [ "$FILES" != "none" ]; then

  # Build the rsync command
  RSYNC_CMD="rsync -rlvz \
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
    $ENV.$PANTHEON_SITE@appserver.$ENV.$PANTHEON_SITE.drush.in:files/ \
    $LANDO_WEBROOT/$FILEMOUNT"

  # Build the extract CMD
  if [ "$RSYNC" == "false" ]; then
    PULL_FILES="rm -f $FILE_DUMP && terminus backup:get $SITE.$FILES --element=files --to=$FILE_DUMP && mkdir -p $LANDO_WEBROOT/$FILEMOUNT &&"
    if command -v pv >/dev/null 2>&1; then
      PULL_FILES="$PULL_FILES pv $FILE_DUMP | tar xzf - -C $LANDO_WEBROOT/$FILEMOUNT --strip-components 1 &&"
    else
      PULL_FILES="$PULL_FILES tar -xzf $FILE_DUMP -C $LANDO_WEBROOT/$FILEMOUNT/ --strip-components 1 &&"
    fi
  fi

  # Add in rsync regardless
  PULL_FILES="$PULL_FILES $RSYNC_CMD"

  # Importing database
  echo "Importing files..."
  eval "$PULL_FILES"

fi
