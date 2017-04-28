#!/bin/sh

set -e

# Make sure our cert directory exists
mkdir -p /certs

# Enable SSL if we need to
if [ -f "/etc/apache2/mods-available/ssl.load" ]; then
  cp -rf /etc/apache2/mods-available/ssl* /etc/apache2/mods-enabled || true
  cp -rf /etc/apache2/mods-available/socache_shmcb* /etc/apache2/mods-enabled || true
fi

# Set up a certs for this service
if [ ! -f "/certs/cert.pem" ]; then

  # Check if openssl is installed, it not install it
  if ! [ -x "$(command -v openssl)" ]; then
    apt-get update -y && apt-get install openssl -y
  fi

  # Generate the cert
  openssl genrsa -out /certs/cert.key 2048 && \
  openssl req -new -x509 -key /certs/cert.key -out /certs/cert.crt -days 365 -subj "/C=US/ST=California/L=San Francisco/O=Lando/OU=KB/CN=${LANDO_SERVICE_TYPE}" && \
  cat /certs/cert.crt /certs/cert.key > /certs/cert.pem

fi
