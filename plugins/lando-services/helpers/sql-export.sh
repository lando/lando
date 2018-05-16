#!/bin/bash

# colors
GREEN='\033[0;32m'
RED='\033[31m'
DEFAULT_COLOR='\033[0;0m'

#if [[  ${MYSQL_DATABASE} != '' ]]; then
#  let fileExists=1
#else
#  let fileExists=0
#fi
#
#echo $fileExists
#exit

##
 # Function to export mysql/mariadb database.
##
mysqlExport() {
  # Set the things
  FILE=${MYSQL_DATABASE}.`date +"%Y%m%d%s"`
  HOST=localhost
  USER=root
  DATABASE=${MYSQL_DATABASE:-database}
  PORT=3306
  STDOUT=false
  
  # colors
  GREEN='\033[0;32m'
  RED='\033[31m'
  DEFAULT_COLOR='\033[0;0m'
  
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
  
  # Start the dump
  DUMPER="mysqldump --opt --user=${USER} --host=${HOST} --port=${PORT} ${DATABASE}"
  
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
}

##
 # Function to export postrgres database.
## 
postgresExport () {
  # Set the things
  FILE=${POSTGRES_DB:-postgres}.`date +"%Y%m%d%s"`
  HOST=localhost
  USER=${POSTGRES_USER:-root}
  PASSWORD=${POSTGRES_PASSWORD:-}
  DATABASE=${POSTGRES_DB:-database}
  PORT=5432
  STDOUT=false
  
  # PARSE THE ARGZZ
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
      --password|--password=*)
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
  DUMPER="pg_dump postgresql://$USER:$PASSWORD@localhost:$PORT/$DATABASE"
  
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
}

##
 # Check for mysql/mariadb or postgres.
##
if [[ ${MYSQL_DATABASE} != '' ]]; then
  mysqlExport
elif [[ ${POSTGRES_DB} != '' ]]; then
  postgresExport
fi  
