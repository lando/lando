#!/bin/bash
# Runs composer install if composer.json exists in /app
FILE=/app/composer.json
if test -f "$FILE"; then
    cd /app
    composer install
fi
