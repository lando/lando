#!/bin/bash

set -e

# Set up our things
SSH_CONF="/etc/ssh"
SSH_DIRS=( "/user/.ssh" "/user/.lando/keys" )
SSH_CANDIDATES=()
SSH_KEYS=()
SSH_IDENTITIES=()

# Set defaults
: ${LANDO_WEBROOT_USER:='www-data'}
: ${LANDO_WEBROOT_GROUP:='www-data'}
: ${LANDO_WEBROOT_UID:='33'}
: ${LANDO_WEBROOT_GID:='33'}

# Make sure we have the system wide confdir
mkdir -p $SSH_CONF

# Scan the following directories for keys
for SSH_DIR in "${SSH_DIRS[@]}"; do
  echo "Scanning $SSH_DIR for keys..."
  mkdir -p $SSH_DIR
  chown -R $LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP $SSH_DIR
  SSH_CANDIDATES+=($(find "$SSH_DIR" -maxdepth 1 -not -name '*.pub' -not -name 'known_hosts' -type f | xargs))
done

# Filter out password protected keys
for SSH_CANDIDATE in "${SSH_CANDIDATES[@]}"; do
  echo "Checking whether $SSH_CANDIDATE is a suitable key..."
  if ! grep -L ENCRYPTED $SSH_CANDIDATE &> /dev/null; then
    SSH_KEYS+=($SSH_CANDIDATE)
    SSH_IDENTITIES+=("  IdentityFile $SSH_CANDIDATE")
  fi
done

# Log
echo "Using the following keys: ${SSH_KEYS[@]}"

# Construct the ssh_config
OLDIFS="${IFS}"
IFS=$'\n'
cat > $SSH_CONF/ssh_config <<EOF
Host *
  StrictHostKeyChecking no
  UserKnownHostsFile=/dev/null
${SSH_IDENTITIES[*]}
EOF
IFS="${OLDIFS}"
