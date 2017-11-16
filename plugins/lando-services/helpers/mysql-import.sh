#!/bin/bash

# Set the things
FILE=""
HOST=${DB_HOST:-localhost}
USER=${DB_USER:-${MYSQL_USER:-root}}
PASSWORD=${DB_PASSWORD:-${MYSQL_PASSWORD:-}}
DATABASE=${DB_NAME:-${MYSQL_DATABASE:-database}}
PORT=${DB_PORT:-3306}
WIPE=true
GREEN='\033[0;32m'
RED='\033[0;31m'
DEFAULT_COLOR='\033[0;0m'

# PARSE THE ARGZZ
# TODO: compress the mostly duplicate code below?
while (( "$#" )); do
  case "$1" in
    -h|--host|--host=*)
      if [ "${1##--host=}" != "$1" ]; then
        HOST="${1##--host=}"
        shift
      else
        HOST=$2
        shift 2
      fi
      ;;
    -u|--user|--user=*)
      if [ "${1##--user=}" != "$1" ]; then
        USER="${1##--user=}"
        shift
      else
        USER=$2
        shift 2
      fi
      ;;
    -p|--password|--password=*)
      if [ "${1##--password=}" != "$1" ]; then
        PASSWORD="${1##--password=}"
        shift
      else
        PASSWORD=$2
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
    -P|--port|--port=*)
      if [ "${1##--port=}" != "$1" ]; then
        PORT="${1##--port=}"
        shift
      else
        PORT=$2
        shift 2
      fi
      ;;
    --no-wipe)
        WIPE=false
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
      FILE="$(pwd)/$1"
      shift
      ;;
  esac
done

# Set positional arguments in their proper place
eval set -- "$FILE"
PV=""
CMD=""

# Use file or stdin
if [ ! -z "$FILE" ]; then

  # Validate we have a file
  if [ ! -f "$FILE" ]; then
    echo "File $FILE not found!"
    exit 1;
  fi

  CMD="$FILE"

else

  # Build connection string
  CMD="mysql -h $HOST -P $PORT -u $USER"
  if [ ! -z "$PASSWORD" ]; then
     CMD="$CMD -p$PASSWORD $DATABASE"
  else
    CMD="$CMD $DATABASE"
  fi

  # Read stdin into DB
  $CMD #>/dev/null
  exit 0;

fi

# Inform the user of things
echo "Preparing to import $FILE into $DATABASE on $HOST:$PORT as $USER..."

# Wipe the database
if [ "$WIPE" == "true" ]; then

  # Build the SQL prefix
  SQLSTART="mysql -h $HOST -P $PORT -u $USER"

  # Get the pdub in there if needed
  if [ ! -z "$PASSWORD" ]; then
     SQLSTART="$SQLSTART -p$PASSWORD $DATABASE"
  else
    SQLSTART="$SQLSTART $DATABASE"
  fi

  # Gather and destroy tables
  TABLES=$($SQLSTART -e 'SHOW TABLES' | awk '{ print $1}' | grep -v '^Tables' )
  echo "Destroying all current tables in $DATABASE... "
  echo "NOTE: See the --no-wipe flag to avoid this step!"

  # PURGE IT ALL! BURN IT TO THE GROUND!!!
  for t in $TABLES; do
    echo "Dropping $t table from $DATABASE database..."
    $SQLSTART -e "DROP TABLE $t"
  done

fi

# Check to see if we have any unzipping options or GUI needs
if command -v gunzip >/dev/null 2>&1 && gunzip -t $FILE >/dev/null 2>&1; then
  echo "Gunzipped file detected!"
  if command -v pv >/dev/null 2>&1; then
    CMD="pv $CMD"
  else
    CMD="cat $CMD"
  fi
  CMD="$CMD | gunzip"
elif command -v unzip >/dev/null 2>&1 && unzip -t $FILE >/dev/null 2>&1; then
  echo "Zipped file detected!"
  CMD="unzip -p $CMD"
  if command -v pv >/dev/null 2>&1; then
    CMD="$CMD | pv"
  fi
else
  if command -v pv >/dev/null 2>&1; then
    CMD="pv $CMD"
  else
    CMD="cat $CMD"
  fi
fi

# Put the pieces together
CMD="$CMD | mysql -h $HOST -P $PORT -u $USER"
if [ ! -z "$PASSWORD" ]; then
   CMD="$CMD -p$PASSWORD $DATABASE"
else
  CMD="$CMD $DATABASE"
fi

# Import
echo "Importing $FILE..."
if command eval "$CMD"; then
  STATUS=$?
else
  STATUS=1
fi

# Finish up!
if [ $STATUS -eq 0 ]; then
  echo ""
  printf "${GREEN}Import complete!${DEFAULT_COLOR}"
  echo ""
else
  echo ""
  printf "${RED}Import failed.${DEFAULT_COLOR}"
  echo ""
fi
