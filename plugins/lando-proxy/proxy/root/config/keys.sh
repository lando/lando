#!/bin/sh

# Set up our certs
if [ ! -f "/certs/hipache.pem" ]; then
  openssl genrsa -out /certs/hipache.key 2048 && \
  openssl req -new -x509 -key /certs/hipache.key -out /certs/hipache.crt -days 365 -subj "/C=US/ST=California/L=Oakland/O=Kalabox/OU=KB/CN=*.${DOMAIN}" && \
  cat /certs/hipache.crt /certs/hipache.key > /certs/hipache.pem
fi
