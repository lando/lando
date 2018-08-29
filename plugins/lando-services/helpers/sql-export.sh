#!/bin/bash

# Set generic things
HOST=localhost
STDOUT=false

# colors
GREEN='\033[0;32m'
RED='\033[31m'
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

# Set the default filename
FILE=${DATABASE}.`date +"%Y%m%d%s"`

# PARSE THE ARGZZ
# TODO: compress the mostly duplicate code below?
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

# Get type-specific dump cpmmand
if [[ ${POSTGRES_DB} != '' ]]; then
  DUMPER="pg_dump postgresql://$USER:$PASSWORD@localhost:$PORT/$DATABASE"
else
  DUMPER="mysqldump --opt --user=${USER} --host=${HOST} --port=${PORT} ${DATABASE}"
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
