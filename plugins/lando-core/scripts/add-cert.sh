#!/bin/sh

set -e

# Vars and defaults
: ${LANDO_DOMAIN:="lndo.site"}
: ${LANDO_CA_CERT:="/lando/certs/lndo.site.pem"}
: ${LANDO_CA_KEY:="/lando/certs/lndo.site.key"}
: ${LANDO_EXTRA_NAMES}:=""}
: ${LANDO_PROXY_NAMES}:=""}
: ${CA_DIR:="/usr/share/ca-certificates"}
: ${CA_CERT_FILENAME:="${LANDO_DOMAIN}.pem"}
: ${CA_CERT_CONTAINER:="$CA_DIR/$CA_CERT_FILENAME"}

# Common name
COMMON_NAME="${LANDO_SERVICE_NAME}.${LANDO_APP_PROJECT}.internal"

# Make sure our cert directories exists
mkdir -p /certs $CA_DIR

# Setup cert SANz
cat > /certs/cert.ext <<EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names
[alt_names]
DNS.1 = ${COMMON_NAME}
DNS.2 = ${LANDO_SERVICE_NAME}
DNS.3 = localhost
${LANDO_PROXY_NAMES}
${LANDO_EXTRA_NAMES}
EOF

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

# Cert add heating up
echo "Cert creation kicking off"
echo "LANDO_CA_CERT: $LANDO_CA_CERT"
echo "LANDO_CA_KEY: $LANDO_CA_KEY"
echo "CA_DIR: $CA_DIR"
echo "CA_CERT_FILENAME: $CA_CERT_FILENAME"
echo "CA_CERT_CONTAINER: $CA_CERT_CONTAINER"
cat /certs/cert.ext
echo "Generating certs..."
openssl genrsa -out /certs/cert.key 2048
openssl req -new -key /certs/cert.key -out /certs/cert.csr -subj "/C=US/ST=California/L=San Francisco/O=Lando/OU=Bespin/CN=${COMMON_NAME}"
openssl x509 \
  -req \
  -in /certs/cert.csr \
  -CA $LANDO_CA_CERT \
  -CAkey $LANDO_CA_KEY \
  -CAcreateserial \
  -out /certs/cert.crt \
  -days 825 \
  -sha256 \
  -extfile /certs/cert.ext

# Pemify
cat /certs/cert.crt /certs/cert.key > /certs/cert.pem
# Also copy to our persistent cert volume
cp -f /certs/cert.crt "/lando/certs/${LANDO_SERVICE_NAME}.${LANDO_APP_PROJECT}.crt"
cp -f /certs/cert.key "/lando/certs/${LANDO_SERVICE_NAME}.${LANDO_APP_PROJECT}.key"
# This is a weird hack to handle recent changes to bitnami's apache image without causing
# breaking changes
cp -f /certs/cert.crt /certs/server.crt
cp -f /certs/cert.key /certs/server.key

# Trust our root CA
if [ ! -f "$CA_CERT_CONTAINER" ]; then
  echo "$CA_CERT_CONTAINER not found... copying $LANDO_CA_CERT over"
  cp -f $LANDO_CA_CERT $CA_CERT_CONTAINER
  echo "$CA_CERT_FILENAME" >> /etc/ca-certificates.conf
fi
