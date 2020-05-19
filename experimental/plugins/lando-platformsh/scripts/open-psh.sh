#!/bin/sh
set -e

# Get the lando logger
. /helpers/log.sh

# Set the module
LANDO_MODULE="platformsh-open"

: ${DATA:=$1}

# Open
echo "$DATA" | /etc/platform/commands/open
