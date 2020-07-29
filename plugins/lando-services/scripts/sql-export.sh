#!/bin/bash
set -e

# Get the lando logger
. /helpers/log.sh

# Set the module
LANDO_MODULE="sqlexport"

# Set generic things
HOST=localhost
SERVICE=$LANDO_SERVICE_NAME
STDOUT=false

# Get type-specific config
if [[ ${POSTGRES_DB} != '' ]]; then
  DATABASE=${POSTGRES_DB:-database}
  PORT=${LANDO_DB_EXPORT_PORT:-5432}
  USER=${LANDO_DB_EXPORT_USER:-postgres}
else
  DATABASE=${MYSQL_DATABASE:-database}
  PORT=${LANDO_DB_EXPORT_PORT:-3306}
  USER=${LANDO_DB_EXPORT_USER:-root}
fi

# Set the default filename
FILE=${DATABASE}.`date +"%Y-%m-%d-%s"`.sql

# PARSE THE ARGZZ
# TODO: compress the mostly duplicate code below?
while (( "$#" )); do
  case "$1" in
    # This doesn't do anything anymore
    # we just keep it around for option validation
    -h|--host|--host=*)
      if [ "${1##--host=}" != "$1" ]; then
        shift
      else
        shift 2
      fi
      ;;
    --stdout)
        STDOUT=true
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
      if [[ "$1" = /* ]]; then
        FILE="${1//\\//}"
      else
        FILE="$(pwd)/${1//\\//}"
      fi
      shift
      ;;
  esac
done

# Get type-specific dump cpmmand
if [[ ${POSTGRES_DB} != '' ]]; then
  DUMPER="pg_dump postgresql://$USER@localhost:$PORT/$DATABASE"
else
  DUMPER="mysqldump --opt --user=${USER} --host=${HOST} --port=${PORT} ${LANDO_EXTRA_DB_EXPORT_ARGS} ${DATABASE}"
fi

# Do the dump to stdout
if [ "$STDOUT" == "true" ]; then
  $DUMPER
else
  # Inform the user of things
  echo "Preparing to export $FILE from database '$DATABASE' on service '$SERVICE' as user $USER..."

  # Clean up last dump before we dump again
  unalias rm 2> /dev/null || true
  rm -f ${FILE} 2> /dev/null
  $DUMPER > ${FILE} || { rm -f ${FILE}; lando_red "Failed to create file: ${FILE}"; exit 1; }

  # Gzip the mysql database dump file
  gzip $FILE
  # Reset perms on linux
  if [ "$LANDO_HOST_OS" = "linux" ] && [ $(id -u) = 0 ]; then
    chown $LANDO_HOST_UID:$LANDO_HOST_GID "${FILE}.gz"
  fi
  # Report
  lando_green "Success ${FILE}.gz was created!"
fi
