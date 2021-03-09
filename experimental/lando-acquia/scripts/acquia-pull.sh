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
    -d|--database|--database=*)
      if [ "${1##--database=}" != "$1" ]; then
        DATABASE="${1##--database=}";
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

# Generate token with the key passed from tooling
if [ "$KEY" != "none" ]; then
  /usr/local/bin/acli auth:login -k "$KEY" -s "$SECRET" -n
fi

# Get the codez
if [ "$CODE" != "none" ]; then
  PULL_CODE="$LANDO_CODE_PULL_COMMAND $CODE";
      # Fetching code
      eval "$PULL_CODE"
fi

# Get the database
if [ "$DATABASE" != "none" ]; then
  PULL_DB="$LANDO_DB_PULL_COMMAND $DATABASE"

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
  echo "Pulling your database... This might take a minute"
  $PULL_DB;

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
  PULL_FILES="$LANDO_FILES_PULL_COMMAND $FILES";

  # Importing files
  eval "$PULL_FILES"
fi

# Finish up!
lando_green "Pull completed successfully!"
