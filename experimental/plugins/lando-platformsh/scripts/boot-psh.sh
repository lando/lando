#!/bin/sh

echo "PLATFORM BOOT IS HAPPENING!"

# Unmount
umount /etc/hosts
umount /etc/resolv.conf

# Safe to do all the time
mkdir -p /run/shared /run/rpc_pipefs/nfs /run/runit

# BOOT
python /helpers/fake-rpc.py &> /tmp/fake-rpc.log &
runsvdir -P /etc/service &> /tmp/runsvdir.log &
