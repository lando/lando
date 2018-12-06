#!/bin/bash

# Set generic config
FILE=""
WIPE=true
HOST=localhost

GREEN='\033[0;32m'
RED='\033[0;31m'
DEFAULT_COLOR='\033[0;0m'

# Get type-specific config
if [[ ${POSTGRES_DB} != '' ]]; then
  DATABASE=${POSTGRES_DB:-database}
  PASSWORD=${PGPASSWORD:-password}
  PORT=5432
  USER=postgres
else
  DATABASE=${MYSQL_DATABASE:-database}
  PORT=3306
  USER=root
fi

# PARSE THE ARGZZ
while (( "$#" )); do
  case "$1" in
    # This doesnt do anything anymore
    # we just keep it around for option validation
    -h|--host|--host=*)
      if [ "${1##--database=}" != "$1" ]; then
        shift
      else
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

  # Build DB specific connection string
  if [[ ${POSTGRES_DB} != '' ]]; then
    CMD="psql postgresql://$USER:$PASSWORD@$HOST:$PORT/$DATABASE"
  else
    CMD="mysql -h $HOST -P $PORT -u $USER"
  fi

  # Read stdin into DB
  $CMD #>/dev/null
  exit 0;

fi

# Inform the user of things
echo "Preparing to import $FILE into $DATABASE on $HOST:$PORT as $USER..."

# Wipe the database if set
if [ "$WIPE" == "true" ]; then

  echo "Destroying all current tables in $DATABASE... "
  echo "NOTE: See the --no-wipe flag to avoid this step!"


  # DO db specific wiping
  if [[ ${POSTGRES_DB} != '' ]]; then

    # Drop and recreate database
    printf "\t\t${GREEN}Dropping database ...\n\n${DEFAULT_COLOR}"
    psql postgresql://$USER:$PASSWORD@$HOST:$PORT/postgres -c "drop database $DATABASE"

    printf "\t\t${GREEN}Creating database ...\n\n${DEFAULT_COLOR}"
    psql postgresql://$USER:$PASSWORD@$HOST:$PORT/postgres -c "create database $DATABASE"

  else

    # Build the SQL prefix
    SQLSTART="mysql -h $HOST -P $PORT -u $USER $DATABASE"

    # Gather and destroy tables
    TABLES=$($SQLSTART -e 'SHOW TABLES' | awk '{ print $1}' | grep -v '^Tables' )

    # PURGE IT ALL! BURN IT TO THE GROUND!!!
    for t in $TABLES; do
      echo "Dropping $t table from $DATABASE database..."
      $SQLSTART -e "DROP TABLE $t"
    done

  fi
fi

# Check to see if we have any unzipping options or GUI needs
if command -v gunzip >/dev/null 2>&1 && gunzip -t $FILE >/dev/null 2>&1; then
  echo "Gzipped file detected!"
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

# Build DB specific import command
if [[ ${POSTGRES_DB} != '' ]]; then
  CMD="$CMD | psql postgresql://$USER:$PASSWORD@$HOST:$PORT/$DATABASE"
else
  CMD="$CMD | mysql -h $HOST -P $PORT -u $USER $DATABASE"
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
