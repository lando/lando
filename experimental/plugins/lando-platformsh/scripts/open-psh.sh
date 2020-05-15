#!/bin/sh

: ${DATA:=$1}

# @TODO: Def need better guidance on the below but this is probably
# an acceptbale workaround for local for now
chmod -R 777 /tmp/log
chmod -R 777 /run

# Open
# echo $DATA > /tmp/relationships.json
echo "$DATA" | /etc/platform/commands/open
