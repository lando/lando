#!/bin/bash

# Make sure we have a binding.pem at this point
if [ ! -f "/var/www/certs/binding.pem" ]; then
  ln -sfn /certs/cert.pem /var/www/certs/binding.pem
fi

# We need this because windows runs FPM as root to handle file permission issues
mkdir -p /root/certs
ln -sfn /var/www/certs/binding.pem /root/certs/binding.pem
