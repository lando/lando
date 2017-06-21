Kalabox Pantheon solr
===================

A container that approximates the solr service used on Pantheon.

```

# docker build -t kalabox/solr:mytag .

FROM debian:jessie

RUN \
  apt-get -y update && apt-get -y install \
  unzip curl incron tomcat7 libtcnative-1 tomcat7-admin && \
  cd /tmp && curl -Lk "https://archive.apache.org/dist/lucene/solr/3.6.2/apache-solr-3.6.2.tgz" | tar -zvx && \
  mv /tmp/apache-solr-3.6.2/example/solr /usr/share/solr && \
  unzip /tmp/apache-solr-3.6.2/example/webapps/solr.war -d /usr/share/solr/web && \
  mkdir -p /usr/share/solr/lib && \
  mkdir -p /usr/share/solr/data && \
  mkdir -p /var/lib/tomcat7/temp && \
  apt-get -y clean && \
  apt-get -y autoclean && \
  apt-get -y autoremove && \
  rm -rf /var/lib/apt/* && rm -rf && rm -rf /var/lib/cache/* && rm -rf /var/lib/log/* && rm -rf /tmp/*

COPY ./start.sh /start.sh
COPY ./index /usr/share/solr/web/index

# Allow us to edit some config on the outsite
RUN \
  chmod 755 /start.sh && \
  rm /etc/tomcat7/server.xml && \
  ln -s /src/config/tomcat/server.xml /etc/tomcat7/server.xml && \
  rm /etc/tomcat7/web.xml && \
  ln -s /src/config/tomcat/web.xml /etc/tomcat7/web.xml && \
  rm /usr/share/solr/solr.xml && \
  ln -s /src/config/solr/solr.xml /usr/share/solr/solr.xml && \
  rm /usr/share/solr/conf/schema.xml && \
  ln -s /usr/share/solr/web/index /usr/share/solr/conf/schema.xml && \
  rm /usr/share/solr/conf/solrconfig.xml && \
  ln -s /src/config/solr/solrconfig.xml /usr/share/solr/conf/solrconfig.xml && \
  ln -s /src/config/tomcat/index.xml /etc/tomcat7/Catalina/localhost/sites#self#environments#kalabox.xml && \
  echo "root" >> /etc/incron.allow && \
  echo "/usr/share/solr/web/index IN_MODIFY curl -k https://localhost:449/sites/self/environments/kalabox/admin/cores?action=RELOAD&core=index" > /var/spool/incron/root

EXPOSE 449
CMD ["/bin/bash", "/start.sh"]

```
