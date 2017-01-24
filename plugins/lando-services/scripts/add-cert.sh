#!/bin/sh

set -e

# Make sure our cert directory exists
mkdir -p /certs

# Set up a certs for this service
if [ ! -f "/certs/${LANDO_SERVICE_TYPE}.pem" ]; then
  openssl genrsa -out /certs/${LANDO_SERVICE_TYPE}.key 2048 && \
  openssl req -new -x509 -key /certs/${LANDO_SERVICE_TYPE}.key -out /certs/${LANDO_SERVICE_TYPE}.crt -days 365 -subj "/C=US/ST=California/L=San Francisco/O=Lando/OU=KB/CN=${LANDO_SERVICE_TYPE}" && \
  cat /certs/${LANDO_SERVICE_TYPE}.crt /certs/${LANDO_SERVICE_TYPE}.key > /certs/${LANDO_SERVICE_TYPE}.pem
fi
