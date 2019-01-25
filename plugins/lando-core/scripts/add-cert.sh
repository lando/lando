#!/bin/sh

set -e

: ${LANDO_DOMAIN:="lndo.site"}
: ${LANDO_CA_CERT:="/lando/certs/lndo.site.pem"}
: ${LANDO_CA_KEY:="/lando/certs/lndo.site.key"}
: ${CA_DIR:="/usr/share/ca-certificates"}
# need a basename
: ${CA_CERT_FILENAME:="${LANDO_DOMAIN}.pem"}
: ${CA_CERT_CONTAINER:="$CA_DIR/$CA_CERT_FILENAME"}

# Make sure our cert directories exists
mkdir -p /certs $CA_DIR

# Setup cert SANz
cat > /certs/cert.ext <<EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names
[alt_names]
DNS.1 = *.${LANDO_DOMAIN}
DNS.2 = ${LANDO_SERVICE_TYPE}
DNS.3 = ${LANDO_SERVICE_NAME}
DNS.4 = *.${LANDO_APP_PROJECT}.internal
DNS.5 = localhost
DNS.6 = *.*.${LANDO_DOMAIN}
DNS.7 = *.*.*.${LANDO_DOMAIN}
EOF

# Enable SSL if we need to
# @todo: we should bake this into the apache service
if [ -f "/etc/apache2/mods-available/ssl.load" ]; then
  echo "Enabling apache ssl modz"
  cp -rf /etc/apache2/mods-available/ssl* /etc/apache2/mods-enabled || true
  cp -rf /etc/apache2/mods-available/socache_shmcb* /etc/apache2/mods-enabled || true
fi

# Check if openssl is installed, if not install it
if ! [ -x "$(command -v openssl)" ]; then
  echo "Installing openssl..."
  apt-get update -y && apt-get install openssl -y || apk add --no-cache openssl
fi

# Validate the certs against the root CA
if [ -f "/certs/cert.pem" ] && ! openssl verify -CAfile $LANDO_CA_CERT /certs/cert.pem >/dev/null; then
  echo "Certs are not valid! Lets remove them."
  rm -f /certs/cert.key
  rm -f /certs/cert.csr
  rm -f /certs/cert.crt
  rm -f /certs/cert.pem
fi

# Set up a certs for this service issued by root ca
if [ ! -f "/certs/cert.pem" ]; then
  # Cert add heating up
  echo "Cert creation kicking off"
  echo "LANDO_CA_CERT: $LANDO_CA_CERT"
  echo "LANDO_CA_KEY: $LANDO_CA_KEY"
  echo "CA_DIR: $CA_DIR"
  echo "CA_CERT_FILENAME: $CA_CERT_FILENAME"
  echo "CA_CERT_CONTAINER: $CA_CERT_CONTAINER"
  echo "Generating certs..."
  openssl genrsa -out /certs/cert.key 2048
  openssl req -new -key /certs/cert.key -out /certs/cert.csr -subj "/C=US/ST=California/L=San Francisco/O=Lando/OU=Bespin/CN=*.${LANDO_DOMAIN}"
  openssl x509 \
    -req \
    -in /certs/cert.csr \
    -CA $LANDO_CA_CERT \
    -CAkey $LANDO_CA_KEY \
    -CAcreateserial \
    -out /certs/cert.crt \
    -days 8675 \
    -sha256 \
    -extfile /certs/cert.ext
  cat /certs/cert.crt /certs/cert.key > /certs/cert.pem
fi

# Trust our root CA
if [ ! -f "$CA_CERT_CONTAINER" ]; then
  echo "$CA_CERT_CONTAINER not found... copying $LANDO_CA_CERT over"
  cp -f $LANDO_CA_CERT $CA_CERT_CONTAINER
  echo "$CA_CERT_FILENAME" >> /etc/ca-certificates.conf
fi
