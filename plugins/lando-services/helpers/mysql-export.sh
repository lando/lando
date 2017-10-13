#!/bin/bash

# Set the things
FILE=${DB_NAME}.`date +"%Y%m%d%s"`
HOST=${DB_HOST:-localhost}
USER=${DB_USER:-${MYSQL_USER:-root}}
PASSWORD=${DB_PASSWORD:-${MYSQL_PASSWORD:-}}
DATABASE=${DB_NAME:-${MYSQL_DATABASE:-database}}
PORT=${DB_PORT:-3306}
STDOUT=false

# colors
GREEN='\033[0;32m'
RED='\033[31m'
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
    --stdout)
        STDOUT=true
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

# Start the dump
DUMPER="mysqldump --opt --user=${USER} --host=${HOST} --port=${PORT}"

# Get the pdub in there if needed
if [ ! -z "$PASSWORD" ]; then
  DUMPER="${DUMPER} --password=${PASSWORD} ${DATABASE}"
else
  DUMPER="${DUMPER} ${DATABASE}"
fi

# Do the dump to stdout
if [ "$STDOUT" == "true" ]; then
  $DUMPER
else

  # Clean up last dump before we dump again
  unalias rm     2> /dev/null
  rm ${FILE}     2> /dev/null
  rm ${FILE}.gz  2> /dev/null
  $DUMPER > ${FILE}

  # Get result code
  ret_val=$?

  # Show the user the result
  if [ $ret_val -ne 0 ] && [ "$STDOUT" == "false" ]; then
      rm ${FILE}
      echo -e "${RED}Failed ${DEFAULT_COLOR}to create file: ${FILE}.gz."
    else
      # Gzip the mysql database dump file
      gzip $FILE
      echo -e "${GREEN}Success${DEFAULT_COLOR} ${FILE}.gz was created!"
  fi

fi
