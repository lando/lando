Lando Pantheon appserver
========================

A container that approximates the appserver used on Pantheon.

```
# Pantheon php 7.1 fpm appserver for Lando
#
# docker build -t devwithlando/pantheon-appserver:7.1 .

FROM devwithlando/php:7.1-fpm

# Version information
ENV WKHTMLTOPDF_VERSION 0.12.2
ENV PHANTOMJS_VERSION 2.1.1
ENV TERMINUS_VERSION 1.8.1
ENV MAVEN_VERSION 3.5.3

# Install the additional things that make the pantheon
RUN apt-get update && apt-get install -y \
    openjdk-7-jre-headless \
    openjdk-7-jdk \
  && rm -f /usr/local/etc/php/conf.d/*-memcached.ini \
  && mkdir -p /var/www/.drush \
  && mkdir -p /var/www/.backdrush \
  && mkdir -p /var/www/.composer \
  && mkdir -p /var/www/.drupal \
  && mkdir -p /srv/bin \
  && chown -R www-data:www-data /var/www /srv/bin \
  && curl -O "https://raw.githubusercontent.com/pantheon-systems/terminus-installer/master/builds/installer.phar" \
  && php installer.phar install --install-version=$TERMINUS_VERSION \
  && cd /tmp && curl -OL "https://github.com/wkhtmltopdf/wkhtmltopdf/releases/download/${WKHTMLTOPDF_VERSION}/wkhtmltox-${WKHTMLTOPDF_VERSION}_linux-jessie-amd64.deb" \
  && dpkg -i /tmp/wkhtmltox-${WKHTMLTOPDF_VERSION}_linux-jessie-amd64.deb \
  && mkdir -p /srv/bin && ln -s /usr/local/bin/wkhtmltopdf /srv/bin/wkhtmltopdf \
  && cd /srv/bin \
  && curl -fsSL "https://github.com/Medium/phantomjs/releases/download/v${PHANTOMJS_VERSION}/phantomjs-${PHANTOMJS_VERSION}-linux-x86_64.tar.bz2" | tar -xjv \
  && mv phantomjs-${PHANTOMJS_VERSION}-linux-x86_64/bin/phantomjs /srv/bin/phantomjs \
  && rm -rf phantomjs-${PHANTOMJS_VERSION}-linux-x86_64 && rm -f phantomjs-${PHANTOMJS_VERSION}-linux-x86_64.tar.bz2 \
  && chmod +x /srv/bin/phantomjs \
  && curl -fsSL "http://www-us.apache.org/dist/maven/maven-3/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz" | tar -xz -C /tmp \
  && cd /tmp && curl -OL "http://archive.apache.org/dist/tika/apache-tika-1.1-src.zip" \
  && unzip /tmp/apache-tika-1.1-src.zip \
  && rm /tmp/apache-tika-1.1-src.zip \
  && cd /tmp/apache-tika-1.1 && /tmp/apache-maven-${MAVEN_VERSION}/bin/mvn install \
  && cp -rf /tmp/apache-tika-1.1/tika-app/target/tika-app-1.1.jar /srv/bin/tika-app-1.1.jar \
  && apt-get -y remove openjdk-8-jdk \
  && apt-get -y clean \
  && apt-get -y autoclean \
  && apt-get -y autoremove \
  && rm -rf /var/lib/apt/lists/* && rm -rf && rm -rf /var/lib/cache/* && rm -rf /var/lib/log/* && rm -rf /tmp/*
```
