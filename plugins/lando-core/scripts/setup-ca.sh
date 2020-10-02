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
LANDO_MODULE="setupca"

# Default CAs
: ${LANDO_CA_CERT:='/certs/lndo.site.pem'}
: ${LANDO_CA_KEY:='/certs/lndo.site.key'}

# Let's log some helpful things
lando_info "Looks like you do not have a Lando CA yet! Let's set one up!"
lando_info "Trying to setup root CA with..."
lando_info "LANDO_CA_CERT: $LANDO_CA_CERT"
lando_info "LANDO_CA_KEY: $LANDO_CA_KEY"

# Set get the key ready
if [ ! -f "$LANDO_CA_KEY" ]; then
  lando_info "$LANDO_CA_CERT not found... generating one"
  openssl genrsa -out $LANDO_CA_KEY 2048
fi

# Set up a CA for lando things
if [ ! -f "$LANDO_CA_CERT" ]; then
  # Log
  lando_info "$LANDO_CA_CERT not found... generating one"
  # Check if openssl is installed, it not install it
  if ! [ -x "$(command -v openssl)" ]; then
    lando_info "Installing needed dependencies..."
    apt-get update -y && apt-get install openssl -y || apk add --no-cache openssl
  fi
  # Generate the cert
  openssl req \
    -x509 \
    -new \
    -nodes \
    -key $LANDO_CA_KEY \
    -sha256 \
    -days 8675 \
    -out $LANDO_CA_CERT \
    -subj "/C=US/ST=California/L=San Francisco/O=Lando/OU=Bespin/CN=Lando Local CA"
  # Set the cert and key on host to host-uid/gid ownership
  chown "$LANDO_HOST_UID:$LANDO_HOST_GID" "$LANDO_CA_KEY"
  chown "$LANDO_HOST_UID:$LANDO_HOST_GID" "$LANDO_CA_CERT"
  # log
  lando_info "CA generated at $LANDO_CA_CERT"
fi
