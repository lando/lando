#!/bin/bash
export CATALINA_HOME=/usr/share/tomcat7
export CATALINA_BASE=/var/lib/tomcat7
LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$CATALINA_HOME/lib
export LD_LIBRARY_PATH

# Set up our solr certs
if [ ! -f "/certs/index.pem" ]; then

  # Create our certs directory if we need to
  mkdir -p /certs

  # Generate the certs
  openssl genrsa -out /certs/index.key 2048 && \
  openssl req -new -x509 -key /certs/index.key -out /certs/index.crt -days 365 -subj "/C=US/ST=California/L=San Francisco/O=Lando/OU=KB/CN=index" && \
  cat /certs/index.crt /certs/index.key > /certs/index.pem

  # Move them into a shared folder so we can whitelist them in the appserver
  mkdir -p /lando/keys/pantheon/${LANDO_APP_NAME}
  cp -rf /certs/* /lando/keys/pantheon/${LANDO_APP_NAME}/

fi

# Start listening, lurking, waiting
incrond

# Start tomcat
/usr/share/tomcat7/bin/catalina.sh run
