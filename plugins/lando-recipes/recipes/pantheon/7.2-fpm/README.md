Lando Pantheon appserver
========================

A container that approximates the appserver used on Pantheon.

```
# Pantheon php 7.2 fpm appserver for Lando
#
# docker build -t devwithlando/pantheon-appserver:7.2-fpm .

FROM devwithlando/php:7.2-fpm

# Version information
ENV BACKDRUSH_VERSION 0.0.6
ENV WKHTMLTOPDF_VERSION 0.12.3
ENV PHANTOMJS_VERSION 2.1.1
ENV TERMINUS_VERSION 1.7.1
ENV MAVEN_VERSION 3.5.2

# Install the additional things that make the pantheon
RUN mkdir -p /usr/share/man/man1 \
  && apt-get update && apt-get install -y \
    openjdk-8-jre-headless \
    openjdk-8-jdk \
  && rm -f /usr/local/etc/php/conf.d/*-memcached.ini \
  && curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
  && chmod +x wp-cli.phar \
  && mv wp-cli.phar /usr/local/bin/wp \
  && wget http://files.drush.org/drush.phar \
  && php drush.phar core-status \
  && chmod +x drush.phar \
  && mv drush.phar /usr/local/bin/drush \
  && mkdir -p /var/www/.composer \
  && cd /var/www/.composer \
  && curl -O https://raw.githubusercontent.com/pantheon-systems/terminus-installer/master/builds/installer.phar \
  && php installer.phar install --install-version=$TERMINUS_VERSION \
  && curl https://drupalconsole.com/installer -L -o drupal.phar \
  && chmod +x drupal.phar \
  && mv drupal.phar /usr/local/bin/drupal \
  && mkdir -p /var/www/.drush \
  && mkdir -p /var/www/.backdrush \
  && mkdir -p /srv/bin \
  && curl -fsSL "https://github.com/backdrop-contrib/drush/archive/${BACKDRUSH_VERSION}.tar.gz" | tar -xz --strip-components=1 -C /var/www/.backdrush \
  && cd /tmp && curl -OL "https://github.com/wkhtmltopdf/wkhtmltopdf/releases/download/${WKHTMLTOPDF_VERSION}/wkhtmltox-${WKHTMLTOPDF_VERSION}_linux-generic-amd64.tar.xz" \
  && tar xJfv "wkhtmltox-${WKHTMLTOPDF_VERSION}_linux-generic-amd64.tar.xz" && cp -rf /tmp/wkhtmltox/bin/* /srv/bin \
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
