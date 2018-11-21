#!/bin/sh

set -e

: ${LANDO_CA_CERT:='/certs/lndo.site.pem'}
: ${LANDO_CA_KEY:='/certs/lndo.site.key'}

# Let's log some helpful things
echo "Looks like you do not have a Lando CA for $LANDO_DOMAIN yet! Let's set one up!"
echo "Trying to setup root CA with..."
echo "LANDO_CA_CERT: $LANDO_CA_CERT"
echo "LANDO_CA_KEY: $LANDO_CA_KEY"

# Set get the key ready
if [ ! -f "$LANDO_CA_KEY" ]; then
  echo "$LANDO_CA_CERT not found... generating one"
  openssl genrsa -out $LANDO_CA_KEY 2048
fi

# Set up a CA for lando things
if [ ! -f "$LANDO_CA_CERT" ]; then

  # Log
  echo "$LANDO_CA_CERT not found... generating one"

  # Check if openssl is installed, it not install it
  if ! [ -x "$(command -v openssl)" ]; then
    echo "Installing needed dependencies..."
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
    -subj "/C=US/ST=California/L=San Francisco/O=Lando/OU=Bespin/CN=Lando Local CA for $LANDO_DOMAIN"

  # log
  echo "CA generated at $LANDO_CA_CERT"

fi
