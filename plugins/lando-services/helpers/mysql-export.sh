#!/bin/bash

# Set the things
FILE=${DB_NAME}.`date +"%Y%m%d"`
HOST=${DB_HOST:-localhost}
USER=${DB_USER:-${MYSQL_USER:-root}}
PASSWORD=${DB_PASSWORD:-${MYSQL_PASSWORD:-}}
DATABASE=${DB_NAME:-${MYSQL_DATABASE:-database}}
PORT=${DB_PORT:-3306}

# In case you run this more than once a day, remove the previous version of the file
unalias rm     2> /dev/null
rm ${FILE}     2> /dev/null
rm ${FILE}.gz  2> /dev/null

# Use this command for a database server on localhost. Add other options if need be
mysqldump --opt --user=${USER} --host=${DB_HOST} --password=${PASSWORD} ${DATABASE} > ${FILE}

# Gzip the mysql database dump file
gzip $FILE

# Show the user the result
echo "${FILE}.gz was created:"
ls -l ${FILE}.gz
