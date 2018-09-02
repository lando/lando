#!/bin/sh

set -e

: ${LANDO_CA_CERT:='lando.pem'}
: ${LANDO_CA_KEY:='lando.key'}
CA_CERT="/certs/$LANDO_CA_CERT"
CA_KEY="/certs/$LANDO_CA_KEY"

# Let's log some helpful things
echo "Looks like you do not have a Lando CA yet! Let's set one up!"
echo "Trying to setup root CA with..."
echo "LANDO_CA_CERT: $LANDO_CA_CERT"
echo "LANDO_CA_KEY: $LANDO_CA_KEY"
echo "CA_CERT: $CA_CERT"
echo "CA_KEY: $CA_KEY"

# Set get the key ready
if [ ! -f "$CA_KEY" ]; then
  echo "$CA_CERT not found... generating one"
  openssl genrsa -out $CA_KEY 2048
fi

# Set up a CA for lando things
if [ ! -f "$CA_CERT" ]; then

  # Log
  echo "$CA_CERT not found... generating one"

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
    -key $CA_KEY \
    -sha256 \
    -days 8675 \
    -out $CA_CERT \
    -subj "/C=US/ST=California/L=San Francisco/O=Lando/OU=Bespin/CN=Lando Local CA"

  # log
  echo "CA generated at $CA_CERT"

fi
