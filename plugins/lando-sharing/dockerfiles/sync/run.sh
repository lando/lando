#!/bin/bash

# Set some defaults
: ${UNISON_CODEROOT:='/code'}
: ${UNISON_WEBROOT:='/var/www/html'}
: ${UNISON_DIR:='/unison'}

: ${UNISON_OPTIONS:=''}

: ${UNISON_GROUP:='www-data'}
: ${UNISON_GID:='33'}
: ${UNISON_USER:='www-data'}
: ${UNISON_UID:='33'}


# Create unison directory if needed
if [ ! -d "$UNISON_DIR" ]; then
    echo "Creating $UNISON_DIR directory for sync..."
    mkdir -p $UNISON_DIR >> /dev/null 2>&1
fi

# Add users and ignore if they already exist
addgroup --gid $UNISON_GID $UNISON_GROUP || true
adduser --home $UNISON_DIR --uid $UNISON_UID --gid $UNISON_GID $UNISON_USER || true

# Make sure the user home directory is /unison
usermod -d $UNISON_DIR $UNISON_USER

# Change owner
chown -R $UNISON_USER:$UNISON_GROUP $UNISON_DIR
chown -R $UNISON_USER:$UNISON_GROUP $UNISON_WEBROOT

# Gracefully stop the process on 'docker stop'
trap 'kill -TERM $PID' TERM INT

# Run as the correct user
su -s "/bin/bash" -c "unison -root ${UNISON_CODEROOT} -root ${UNISON_WEBROOT} ${UNISON_OPTIONS}" $UNISON_USER &

# Wait until the process is stopped
PID=$!
wait $PID
trap - TERM INT
wait $PID
EXIT_STATUS=$?
