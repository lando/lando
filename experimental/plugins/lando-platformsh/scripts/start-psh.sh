#!/bin/bash

echo "PLATFORM BOOT IS HAPPENING!"

id

# Unmount
umount /etc/hosts
umount /etc/resolv.conf

# Safe to do all the time
mkdir -p /run/shared /run/rpc_pipefs/nfs

# BOOT
# Weak check for exploratory purposes
python /app/fake-rpc.py &> /tmp/fake-rpc.log &
runsvdir -P /etc/service &> /tmp/runsvdir.log &
/etc/platform/boot
exec init

echo "DOES THIS HAPPNE?"

# START
# /etc/platform/start

# echo "DOES THIS HAPPNE?"

# OPEN
# /etc/platform/commands/open < /tmp/open.json
# chmod -Rv 777 /tmp/log
# chmod -Rv 777 /run
