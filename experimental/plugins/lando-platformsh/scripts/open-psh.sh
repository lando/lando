#!/bin/sh

# @TODO: Def need better guidance on the below but this is probably
# an acceptbale workaround for local for now
chmod -R 777 /tmp/log
chmod -R 777 /run

# Open
# @TODO: i dont think we need to ever do more than this since
# we are just relying on lando's built in networking for stuff
echo '{"relationships": {}}' | /etc/platform/commands/open
