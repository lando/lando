#!/bin/bash

set -e

# Get the lando logger
. /helpers/log.sh

# Set the module
LANDO_MODULE="acquia"

# Set option defaults
SITE=$ACLI_SITE;
CODE='none';
DATABASE='none';
FILES='none';

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
  # @TODO: what/how can we do a simple auth check for acli?
  # Validate before we begin
  # lando_pink "Validating you can pull code from $CODE..."
  # acli api:applications:list $SITE.$CODE
  # lando_green "Confirmed!"

  PULL_CODE="$LANDO_CODE_PULL_COMMAND $SITE.$CODE";

      # Fetching code
      eval "$PULL_CODE"
fi

# Get the database
if [ "$DATABASE" != "none" ]; then
  # Make sure the acli command returned from buildDbPullCommand() has the
  # correct <site.env> specified.
  # PULL_DB="$LANDO_DB_PULL_COMMAND $SITE.$DATABASE $LANDO_DB_PULL_COMMAND_OPTIONS"
  PULL_DB="$LANDO_DB_PULL_COMMAND $SITE.$DATABASE";

  # For some reason terminus remote:thing commands do not return when run through
  # LEIA so we are reseting this here for now
  # if [ $LANDO_LEIA == 1 ]; then PULL_DB="$FALLBACK_PULL_DB"; fi

  # # Validate before we begin
  # lando_pink "Validating you can pull the database from $DATABASE..."
  # terminus env:info $SITE.$DATABASE
  # lando_green "Confirmed!"

  # Destroy existing tables
  # NOTE: We do this so the source DB **EXACTLY MATCHES** the target DB
  TABLES=$(mysql --user=acquia --password=acquia --database=acquia --host=database --port=3306 -e 'SHOW TABLES' | awk '{ print $1}' | grep -v '^Tables' ) || true
  echo "Destroying all current tables in database if needed... "
  for t in $TABLES; do
    echo "Dropping $t from local acquia database..."
    mysql --user=acquia --password=acquia --database=acquia --host=database --port=3306 <<-EOF
      SET FOREIGN_KEY_CHECKS=0;
      DROP VIEW IF EXISTS \`$t\`;
      DROP TABLE IF EXISTS \`$t\`;
EOF
  done

  # Importing database
  echo "Pulling your database... This miiiiight take a minute"
  $PULL_DB | pv | $LOCAL_MYSQL_CONNECT_STRING | pv | $LOCAL_MYSQL_CONNECT_STRING

  # Weak check that we got tables
  PULL_DB_CHECK_TABLE=${LANDO_DB_USER_TABLE:-users}
  lando_pink "Checking db pull for expected tables..."
  if ! mysql --user=acquia --password=acquia --database=acquia --host=database --port=3306 -e "SHOW TABLES;" | grep $PULL_DB_CHECK_TABLE; then
    lando_red "Database pull failed... "
    exit 1
  fi
fi

# Get the files
if [ "$FILES" != "none" ]; then
  PULL_FILES=""

#   # Validate before we begin
#   lando_pink "Validating you can pull files from $FILES..."
#   terminus env:info $SITE.$FILES
#   lando_green "Confirmed!"

PULL_FILES="$LANDO_FILES_PULL_COMMAND $SITE.$FILES";

    # Importing files
    eval "$PULL_FILES"
fi

# Finish up!
lando_green "Pull completed successfully!"
