#!/bin/sh
set -e

# Get the lando logger
. /helpers/log.sh

# Set the module
LANDO_MODULE="platformsh-prepare"

# Defaults
: ${LANDO_PSH_INIT_FILE:='/run/lando_init'}

# Unmount if we need to
lando_info "Ensuring needed files are unmounted..."
if mount | grep "/etc/hosts"; then
  umount /etc/hosts && lando_info "unmounted /etc/hosts"
fi
if mount | grep "/etc/resolv.conf"; then
  umount /etc/resolv.conf && lando_info "unmounted /etc/resolv.conf"
fi

# Safe to do every time
lando_info "Ensuring needed directories exist..."
mkdir -p /run/shared /run/rpc_pipefs/nfs /run/runit
chmod 777 /run

# We are using this as our mock $HOME directory for commands right now
chown $LANDO_HOST_UID:$(getent group "$LANDO_HOST_GID" | cut -d: -f1) /var/www
nohup chown -R $LANDO_HOST_UID:$(getent group "$LANDO_HOST_GID" | cut -d: -f1) /var/www >/dev/null 2>&1 &

# Stuff
runsvdir -P /etc/service &> /tmp/runsvdir.log

# Handle the socket setup
rm -f /run/shared/agent.sock
python /helpers/fake-rpc.py &> /tmp/fake-rpc.log

# Do the right thing depending on whether this is a first run or not
if [ -f "$LANDO_PSH_INIT_FILE" ]; then
  exec /etc/platform/start
else
  touch "$LANDO_PSH_INIT_FILE"
  exec /etc/platform/boot
fi
