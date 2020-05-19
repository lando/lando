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

# Safe to do all the time
lando_info "Ensuring needed directories exist..."
mkdir -p /run/shared /run/rpc_pipefs/nfs /run/runit

# @TODO: Def need better guidance on the below but this is probably
# an acceptbale workaround for local for now
chmod -R 777 /tmp/log
chmod -R 777 /run

# Set the module
LANDO_MODULE="platformsh-boot"

# If we have already booted them lets exit
if [ -f "$LANDO_PSH_INIT_FILE" ]; then
  lando_info "This container has already gone through the BOOT process so stopping here!"
  exit 0
fi

# Otherwise, keep this train rolling!
python /helpers/fake-rpc.py &> /tmp/fake-rpc.log
runsvdir -P /etc/service &> /tmp/runsvdir.log
touch "$LANDO_PSH_INIT_FILE"
exec /etc/platform/boot
