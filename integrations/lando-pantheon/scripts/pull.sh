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
CODE=${TERMINUS_ENV:-dev}
DATABASE=${TERMINUS_ENV:-dev}
FILES=${TERMINUS_ENV:-dev}
RSYNC=false
NO_AUTH=false

# Set helpers
FRAMEWORK=${FRAMEWORK:-drupal}
SITE=${PANTHEON_SITE_NAME:-${TERMINUS_SITE:-whoops}}
ENV=${TERMINUS_ENV:-dev}
FILE_DUMP="/tmp/files.tar.gz"

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
    --rsync|--rsync=*)
        RSYNC=$1
        shift
      ;;
    --no-auth)
        NO_AUTH=true
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


# Go through the auth procedure
if [ "$NO_AUTH" == "false" ]; then
  /helpers/auth.sh "$AUTH" "$SITE"
fi

# Get the codez
if [ "$CODE" != "none" ]; then
  # Validate before we begin
  lando_pink "Validating you can pull code from $CODE..."
  terminus env:info $SITE.$CODE
  lando_green "Confirmed!"

  # Get the git branch
  GIT_BRANCH=master

  # Make sure we are in the git root
  cd $LANDO_MOUNT

  # On Pantheon this matches a protected multidev env, which only uses branch `master`
  PROTECTED_ENV=("dev" "test" "live")
  # Fetch the origin if this is a new branch and set the branch
  if ! [[ $(printf "_[%s]_" "${PROTECTED_ENV[@]}") =~ .*_\[$CODE\]_.* ]]; then
    git fetch --all
    GIT_BRANCH=$CODE
  fi

  # Checkout and pull
  git checkout $GIT_BRANCH
  git pull -Xtheirs --no-edit origin $GIT_BRANCH
fi


# Get the database
if [ "$DATABASE" != "none" ]; then
  # Holla at @uberhacker for this fu
  FALLBACK_PULL_DB="$(echo $(terminus connection:info $SITE.$DATABASE --field=mysql_command) | sed 's,^mysql,mysqldump --no-autocommit --single-transaction --opt -Q,')"
  LOCAL_MYSQL_CONNECT_STRING="mysql --user=pantheon --password=pantheon --database=pantheon --host=database --port=3306"

  # Make sure the terminus command returned from buildDbPullCommand() has the
  # correct <site.env> specified.
  PULL_DB="$LANDO_DB_PULL_COMMAND $SITE.$DATABASE $LANDO_DB_PULL_COMMAND_OPTIONS"

  # Validate before we begin
  lando_pink "Validating you can pull the database from $DATABASE..."
  terminus env:info $SITE.$DATABASE
  lando_green "Confirmed!"

  # Destroy existing tables
  # NOTE: We do this so the source DB **EXACTLY MATCHES** the target DB
  TABLES=$(mysql --user=pantheon --password=pantheon --database=pantheon --host=database --port=3306 -e 'SHOW TABLES' | awk '{ print $1}' | grep -v '^Tables' ) || true
  echo "Destroying all current tables in database if needed... "
  for t in $TABLES; do
    echo "Dropping $t from local pantheon database..."
    mysql --user=pantheon --password=pantheon --database=pantheon --host=database --port=3306 <<-EOF
      SET FOREIGN_KEY_CHECKS=0;
      DROP VIEW IF EXISTS \`$t\`;
      DROP TABLE IF EXISTS \`$t\`;
EOF
  done

  # Wake up the database so we can actually connect
  lando_pink "Making sure your site is awake..."
  terminus env:wake $SITE.$DATABASE

  # Importing database
  echo "Pulling your database... This miiiiight take a minute"
  $PULL_DB | pv | $LOCAL_MYSQL_CONNECT_STRING || $FALLBACK_PULL_DB | pv | $LOCAL_MYSQL_CONNECT_STRING

  # Weak check that we got tables
  PULL_DB_CHECK_TABLE=${LANDO_DB_USER_TABLE:-users}
  lando_pink "Checking db pull for expected tables..."
  if ! mysql --user=pantheon --password=pantheon --database=pantheon --host=database --port=3306 -e "SHOW TABLES;" | grep $PULL_DB_CHECK_TABLE; then
    lando_red "Database pull failed... "
    exit 1
  fi

  # Do some post DB things on WP
  if [ "$FRAMEWORK" == "wordpress" ]; then
    echo "Doing the ole post-migration search-replace on WordPress..."
    cd /app && wp search-replace "$ENV-$SITE.pantheonsite.io" "${LANDO_APP_NAME}.${LANDO_DOMAIN}" --skip-plugins --skip-themes
  fi

  if [ "$FRAMEWORK" == "wordpress_network" ]; then
    echo "Doing the ole post-migration search-replace on Wordpress ... Network Style! The --url param will be $ENV-$SITE.pantheonsite.io"
    cd /app && wp search-replace "${ENV}-${SITE}.pantheonsite.io" "${LANDO_APP_NAME}.${LANDO_DOMAIN}" --url="http://${ENV}-${SITE}.pantheonsite.io" --network --skip-plugins --skip-themes
  fi
fi

# Get the files
if [ "$FILES" != "none" ]; then
  PULL_FILES=""

  # Validate before we begin
  lando_pink "Validating you can pull files from $FILES..."
  terminus env:info $SITE.$FILES
  lando_green "Confirmed!"

  # Make sure the filemount actually exists
  mkdir -p $LANDO_WEBROOT/$FILEMOUNT

  # Build the rsync command
  RSYNC_CMD="rsync -rvlz \
    --chmod=u=rwx,g=rx,o=rx \
    --copy-unsafe-links \
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
    $FILES.$PANTHEON_SITE@appserver.$FILES.$PANTHEON_SITE.drush.in:files/ \
    $LANDO_WEBROOT/$FILEMOUNT"

  # Verify we have a files dump, it not let's switch to rsync mode
  if ! terminus backup:list $SITE.$FILES --element=files --format=list | grep "files" 2>&1; then
    RSYNC=true
  fi

  # Build the extract CMD
  if [ "$RSYNC" == "false" ]; then
    PULL_FILES="rm -f $FILE_DUMP && terminus backup:get $SITE.$FILES --element=files --to=$FILE_DUMP &&"
    PULL_FILES="$PULL_FILES pv $FILE_DUMP | tar xzf - -C $LANDO_WEBROOT/$FILEMOUNT --strip-components 1 &&"
  fi

  # Add in rsync regardless
  PULL_FILES="$PULL_FILES $RSYNC_CMD"

  # Importing files
  eval "$PULL_FILES"
fi

# Finish up!
lando_green "Pull completed successfully!"
