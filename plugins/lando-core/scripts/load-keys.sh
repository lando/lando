#!/bin/bash

# Set defaults
: ${SILENT:=$1}

# Echo helper to recognize silence
if [ "$SILENT" = "--silent" ]; then
  LANDO_QUIET="yes"
fi

# Get the lando logger
. /helpers/log.sh

# Set the module
LANDO_MODULE="loadkeys"

# Bail if we are not root
if [ $(id -u) != 0 ]; then
  lando_warn "Only the root user can load ssh keys! This is probably ok though..."
  exit 0
fi

# Set defaults
: ${LANDO_WEBROOT_USER:='www-data'}
: ${LANDO_WEBROOT_GROUP:='www-data'}
: ${LANDO_HOST_USER:=$LANDO_WEBROOT_USER}
: ${LANDO_LOAD_KEYS:='true'}
GROUP=$(getent group "$LANDO_HOST_GID" | cut -d: -f1)

# Set up our things
SSH_CONF="/etc/ssh"
SSH_DIRS=( "/lando/keys" "/var/www/.ssh" )
SSH_CANDIDATES=()
SSH_KEYS=()
SSH_IDENTITIES=()

# Make sure we have the system wide confdir
mkdir -p $SSH_CONF

# Also scan the users ssh key dir if specified
# this is the default
if [ "$LANDO_LOAD_KEYS" = "true" ]; then
  SSH_DIRS=( "${SSH_DIRS[@]}" "/user/.ssh" )
fi

# Ensure directories exists
for SSH_DIR in "${SSH_DIRS[@]}"; do
  mkdir -p "$SSH_DIR"
done

# We need to do some different magic on Windows because file sharing on windows
# does not let you chmod files that are mounted
if [ "$LANDO_HOST_OS" = "win32" ]; then
  lando_warn "Creating a special not-mounted key directory for Windows"
  mkdir -p /lando_keys
  for SSH_DIR in "${SSH_DIRS[@]}"; do
    readarray -t SSH_KEYS < <(find "$SSH_DIR" -maxdepth 1 -not -name 'known_hosts' -type f)
    for SSH_KEY in "${SSH_KEYS[@]}"; do
      lando_debug "Copying $SSH_KEY from $SSH_DIR to /lando_keys"
      cp -rfp "$SSH_KEY" /lando_keys
    done
  done
  chown -R $LANDO_WEBROOT_USER:$GROUP /lando_keys
  SSH_DIRS=( "/lando_keys" )
  SSH_KEYS=()
fi

# Scan the following directories for keys and filter out non-private keys
for SSH_DIR in "${SSH_DIRS[@]}"; do
  lando_info "Scanning $SSH_DIR for keys..."
  readarray -t RAW_LIST < <(find "$SSH_DIR" -maxdepth 1 -not -name '*.pub' -not -name 'known_hosts' -user $LANDO_WEBROOT_USER -type f)
  for RAW_KEY in "${RAW_LIST[@]}"; do
    SSH_CANDIDATES+=("$RAW_KEY")
  done
done

# Add in user specified keys if they are provided
if [ "$LANDO_LOAD_KEYS" != "true" ] && [ "$LANDO_LOAD_KEYS" != "false" ]; then
  RAW_LIST=($LANDO_LOAD_KEYS)
  for RAW_KEY in "${RAW_LIST[@]}"; do
    SSH_CANDIDATES+=("/user/.ssh/$RAW_KEY")
  done
fi

lando_info "Found keys ${SSH_CANDIDATES[*]}"

# Go through and validate our candidates
for SSH_CANDIDATE in "${SSH_CANDIDATES[@]}"; do
  lando_debug "Ensuring permissions and ownership of $SSH_CANDIDATE..."
  chown -R $LANDO_WEBROOT_USER:$GROUP "$SSH_CANDIDATE"
  chmod 600 "$SSH_CANDIDATE"
  lando_debug "Checking whether $SSH_CANDIDATE is a private key..."
  if grep -L "PRIVATE KEY" "$SSH_CANDIDATE" &> /dev/null; then
    if command -v ssh-keygen >/dev/null 2>&1; then
      lando_debug "Checking whether $SSH_CANDIDATE is formatted correctly..."
      if ssh-keygen -l -f "$SSH_CANDIDATE" &> /dev/null; then
        SSH_KEYS+=("$SSH_CANDIDATE")
        SSH_IDENTITIES+=("  IdentityFile \"$SSH_CANDIDATE\"")
      elif ssh-keygen -y -e -f "$SSH_CANDIDATE" &> /dev/null; then
        SSH_KEYS+=("$SSH_CANDIDATE")
        SSH_IDENTITIES+=("  IdentityFile \"$SSH_CANDIDATE\"")
      fi
    else
      SSH_KEYS+=($SSH_CANDIDATE)
      SSH_IDENTITIES+=("  IdentityFile \"$SSH_CANDIDATE\"")
    fi
  fi
done

# Log
lando_info "Using the following keys: ${SSH_KEYS[*]}"

# Construct the ssh_config
OLDIFS="${IFS}"
IFS=$'\n'
cat > $SSH_CONF/ssh_config <<EOF
Host *
  User "${LANDO_HOST_USER}"
  StrictHostKeyChecking no
  UserKnownHostsFile=/dev/null
  LogLevel=FATAL
${SSH_IDENTITIES[*]}
EOF
IFS="${OLDIFS}"

# Make it loose so other things can do stuff
chmod 777 "$SSH_CONF/ssh_config"
