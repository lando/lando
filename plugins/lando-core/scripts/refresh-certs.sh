#!/bin/sh

set -e

# Set defaults
: ${SILENT:=$1}

# Echo helper to recognize silence
if [ "$SILENT" = "--silent" ]; then
  LANDO_QUIET="yes"
fi

# Get the lando logger
. /helpers/log.sh

# Set the module
LANDO_MODULE="refreshcerts"

# Run add certs if we need to
if [ ! -f "/certs/cert.pem" ]; then
  /helpers/add-cert.sh
fi

# Check if update-ca-certificates is installed, if not install it and update our trusted certs
#
# The logic here is not 100% solid. We are assuming if you don't have update-ca-certificates available
# then you PROBABLY don't need to wait for certs to actually be updated for any immedate build step
# because chances are your container doesn't have a build step or if it does it doesn't need certs to be in a good place.
# We do this because its substantially faster than waiting for ALL services to have certs good to go pre-start
if ! [ -x "$(command -v update-ca-certificates)" ]; then
  lando_info "Installing update-ca-certificates..."
  if [ -x "$(command -v apt-get)" ]; then
    nohup sh -c "apt-get update -y && apt-get install ca-certificates -y && update-ca-certificates --verbose > /certs/certs.txt"
  else
    nohup sh -c "apk add --no-cache ca-certificates && update-ca-certificates --verbose > /certs/certs.txt"
  fi
else
  update-ca-certificates --verbose > /certs.txt
fi

lando_info "Certs refreshed..."
