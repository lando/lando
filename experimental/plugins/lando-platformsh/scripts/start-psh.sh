#!/bin/sh

echo "PLATFORM START IS HAPPENING!"

# @NOTE: not clear why we need to do the below again
if [ ! -f "/run/shared/agent.sock" ]; then
  python /helpers/fake-rpc.py &> /tmp/fake-rpc.log &
  # Wait a bit before we try to start
  # TODO: Add a more sophisticated check then sleeping a bit?
  sleep 1
fi

# START. IT. UP!
/etc/platform/start

# @TODO: Def need better guidance on the below but this is probably
# an acceptbale workaround for local for now
chmod -Rv 777 /tmp/log
chmod -Rv 777 /run
