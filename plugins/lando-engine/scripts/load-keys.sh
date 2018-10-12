#!/bin/bash

set -e

# Set up our things
SSH_CONF="/etc/ssh"
SSH_DIRS=( "/user/.ssh" "/lando/keys" )
SSH_CANDIDATES=()
SSH_KEYS=()
SSH_IDENTITIES=()

# Set defaults
: ${LANDO_WEBROOT_USER:='www-data'}
: ${LANDO_WEBROOT_GROUP:='www-data'}
: ${LANDO_LOAD_PP_KEYS:='false'}

# We need to do some different magic on Windows because file sharing on windows
# does not let you chmod files that are mounted
if [ "$LANDO_HOST_OS" = "win32" ]; then
  echo "Creating a special not-mounted key directory for Windows"
  mkdir -p /lando_keys
  for SSH_DIR in "${SSH_DIRS[@]}"; do
    echo "Copying keys from $SSH_DIR..."
    mkdir -p $SSH_DIR
    chown -R $LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP $SSH_DIR
    cp -rf $SSH_DIR/* /lando_keys
  done
  SSH_DIRS=( "/lando_keys" )
fi

# Make sure we have the system wide confdir
mkdir -p $SSH_CONF

# Scan the following directories for keys
for SSH_DIR in "${SSH_DIRS[@]}"; do
  echo "Scanning $SSH_DIR for keys..."
  mkdir -p $SSH_DIR
  chown -R $LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP $SSH_DIR
  SSH_CANDIDATES+=($(find "$SSH_DIR" -maxdepth 1 -not -name '*.pub' -not -name 'known_hosts' -type f | xargs))
done

# Filter out non private keys and keys that are passphrased unless LANDO_LOAD_PP_KEYS is set to true
for SSH_CANDIDATE in "${SSH_CANDIDATES[@]}"; do
  echo "Checking whether $SSH_CANDIDATE is a private key..."
  if grep -L "PRIVATE KEY" $SSH_CANDIDATE &> /dev/null; then
    if ! grep -L ENCRYPTED $SSH_CANDIDATE &> /dev/null || [ "$LANDO_LOAD_PP_KEYS" == "true" ]; then
      if command -v ssh-keygen >/dev/null 2>&1; then
        echo "Checking whether $SSH_CANDIDATE is formatted correctly..."
        if ssh-keygen -l -f $SSH_CANDIDATE &> /dev/null; then
          SSH_KEYS+=($SSH_CANDIDATE)
          SSH_IDENTITIES+=("  IdentityFile $SSH_CANDIDATE")
        fi
      else
        SSH_KEYS+=($SSH_CANDIDATE)
        SSH_IDENTITIES+=("  IdentityFile $SSH_CANDIDATE")
      fi
    fi
  fi
done

# Make sure the keys have the correct permissions
for SSH_KEY in "${SSH_KEYS[@]}"; do
  echo "Ensuring permissions for $SSH_KEY..."
  chmod 700 $SSH_KEY
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
  LogLevel=ERROR
${SSH_IDENTITIES[*]}
EOF
IFS="${OLDIFS}"

# Make it loose so other things can do stuff
chmod 777 "$SSH_CONF/ssh_config"
