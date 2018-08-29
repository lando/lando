#!/bin/sh

set -e

# TODO: We need to actually inject LANDO_CA_CERT, this is currently an assumed value
: ${LANDO_CA_CERT:="lando.pem"}
: ${LANDO_CA_KEY:="lando.key"}
: ${LANDO_DOMAIN:="lndo.site"}
: ${CA_CERT_HOST:="/lando/certs/$LANDO_CA_CERT"}
: ${CA_CERT_KEY:="/lando/certs/$LANDO_CA_KEY"}
: ${CA_DIR:="/usr/share/ca-certificates"}
: ${CA_CERT_CONTAINER:="$CA_DIR/$LANDO_CA_CERT"}

# Cert add heating up
echo "Cert creation kicking off"
echo "LANDO_CA_CERT: $LANDO_CA_CERT"
echo "LANDO_CA_KEY: $LANDO_CA_KEY"
echo "CA_CERT_HOST: $CA_CERT_HOST"
echo "CA_DIR: $CA_DIR"
echo "CA_CERT_CONTAINER: $CA_CERT_CONTAINER"

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
DNS.4 = *.${LANDO_APP_NAME}.internal
DNS.5 = localhost
EOF

# Enable SSL if we need to
if [ -f "/etc/apache2/mods-available/ssl.load" ]; then
  cp -rf /etc/apache2/mods-available/ssl* /etc/apache2/mods-enabled || true
  cp -rf /etc/apache2/mods-available/socache_shmcb* /etc/apache2/mods-enabled || true
fi

# Check if openssl is installed, if not install it
if ! [ -x "$(command -v openssl)" ]; then
  echo "Installing openssl..."
  apt-get update -y && apt-get install openssl -y || apk add --no-cache openssl
fi

# Validate the certs against the root CA
if [ -f "/certs/cert.pem" ] && ! openssl verify -verbose -CAfile $CA_CERT_HOST /certs/cert.pem; then
  echo "Certs are not valid! Lets remove them."
  rm -f /certs/cert.key
  rm -f /certs/cert.csr
  rm -f /certs/cert.crt
  rm -f /certs/cert.pem
fi

# Set up a certs for this service issued by root ca
if [ ! -f "/certs/cert.pem" ]; then
  echo "Generating certs..."
  openssl genrsa -out /certs/cert.key 2048
  openssl req -new -key /certs/cert.key -out /certs/cert.csr -subj "/C=US/ST=California/L=San Francisco/O=Lando/OU=Bespin/CN=*.${LANDO_DOMAIN}"
  openssl x509 \
    -req \
    -in /certs/cert.csr \
    -CA $CA_CERT_HOST \
    -CAkey $CA_CERT_KEY \
    -CAcreateserial \
    -out /certs/cert.crt \
    -days 8675 \
    -sha256 \
    -extfile /certs/cert.ext
  cat /certs/cert.crt /certs/cert.key > /certs/cert.pem
fi

# Trust our root CA
if [ ! -f "$CA_CERT_CONTAINER" ]; then
  echo "$CA_CERT_CONTAINER not found... copying $CA_CERT_HOST over"
  cp -f $CA_CERT_HOST $CA_CERT_CONTAINER
  echo "$LANDO_CA_CERT" >> /etc/ca-certificates.conf
fi

# Check if update-ca-certificates is installed, if not install it and update our trusted certs
#
# The logic here is not 100% solid. We are assuming if you dont have update-ca-certificates available
# then you PROBABLY dont need to wait for certs to actually be updated for any immedate build step
# because chances are your container doesnt have a build step or if it does it doesnt need certs to be in a good place.
# We do this because its substantially faster than waiting for ALL services to have certs good to go pre-start
if ! [ -x "$(command -v update-ca-certificates)" ]; then
  echo "Installing update-ca-certificates..."
  if [ -x "$(command -v apt-get)" ]; then
    nohup sh -c "apt-get update -y && apt-get install ca-certificates -y && update-ca-certificates" &
  else
    nohup sh -c "apk add --no-cache ca-certificates && update-ca-certificates" &
  fi
else
  update-ca-certificates --verbose &
fi
