#!/bin/sh
set -e

# Get the lando logger
. /helpers/log.sh

# Set the module
LANDO_MODULE="platformsh-prepare"

# Defaults
: ${LANDO_PSH_INIT_FILE:='/run/lando_init'}
: ${LANDO_PSH_AGENT_SOCKET:='/run/shared/agent.sock'}

# Unmount things platform.sh needs if we need to
lando_info "Ensuring needed files are unmounted..."
if mount | grep "/etc/hosts"; then
  umount /etc/hosts && lando_info "unmounted /etc/hosts"
fi
if mount | grep "/etc/resolv.conf"; then
  umount /etc/resolv.conf && lando_info "unmounted /etc/resolv.conf"
fi

# Prepare needed dirs, this is safe to do every time
lando_info "Ensuring needed directories exist..."
mkdir -p /run/shared /run/rpc_pipefs/nfs /run/runit
chmod 777 /run
# NOTE: This seems to only be relevant on M1 macs and maybe is fixed in the future?
chmod 666 /dev/null

# Make sure there is a group that has $LANDO_HOST_GID
# This is rare but can happen if the host gid is different than the uid
groupadd --gid $LANDO_HOST_GID lando -f

# We are using this as our mock $HOME directory for commands right now
chown $LANDO_HOST_UID:$(getent group "$LANDO_HOST_GID" | cut -d: -f1) /var/www
nohup chown -R $LANDO_HOST_UID:$(getent group "$LANDO_HOST_GID" | cut -d: -f1) /var/www >/dev/null 2>&1 &

# Prepare the services
runsvdir -P /etc/service &> /tmp/runsvdir.log

# Remove our mock socket if it still exists for whatever reason
if [ -S "$LANDO_PSH_AGENT_SOCKET" ]; then
  rm -f "$LANDO_PSH_AGENT_SOCKET"
fi

# Start the mock socket and wait until its ready to accept connections
python /helpers/psh-fake-rpc.py &> /tmp/fake-rpc.log
while [ ! -S  "$LANDO_PSH_AGENT_SOCKET" ]; do
  lando_debug "Waiting for $LANDO_PSH_AGENT_SOCKET to be ready..."
  sleep 1
done

# This is workaround to get ES working on linux/circleci
# NOTE: eventually we should have better handling around this
if [ -f "/etc/default/elasticsearch" ]; then
  chmod 777 /etc/default/elasticsearch
fi

# Do the right thing depending on whether this is a first run or not
if [ -f "$LANDO_PSH_INIT_FILE" ]; then
  exec /etc/platform/start
else
  touch "$LANDO_PSH_INIT_FILE"
  exec /etc/platform/boot
fi
