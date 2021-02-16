# Pantheon php 7.4 fpm appserver for Lando
#
# docker build -t devwithlando/pantheon-appserver:7.4-2 .

FROM devwithlando/php:7.4-fpm-2

# Version information
ENV WKHTMLTOPDF_VERSION 0.12.5
ENV PHANTOMJS_VERSION 2.1.1
ENV PHANTOMJS_OLD_VERSION 1.7.0
ENV LANDO_TERMINUS_VERSION 2.5.0
ENV MAVEN_VERSION 3.5.4
ENV TIKA_VERSION 1.18

# Install the additional things that make the pantheon
RUN mkdir -p /usr/share/man/man1 \
  && apt-get update && apt-get install -y \
    openjdk-11-jre-headless \
    openjdk-11-jdk \
  && rm -f /usr/local/etc/php/conf.d/*-memcached.ini \
  && mkdir -p /var/www/.drush \
  && mkdir -p /var/www/.backdrush \
  && mkdir -p /var/www/.composer \
  && mkdir -p /var/www/.drupal \
  && mkdir -p /srv/bin \
  && chown -R www-data:www-data /var/www /srv/bin \
  && wget "https://github.com/pantheon-systems/terminus/releases/download/${LANDO_TERMINUS_VERSION}/terminus.phar" -O /usr/local/bin/terminus \
  && chmod +x /usr/local/bin/terminus \
  && cd /tmp && wget "https://github.com/wkhtmltopdf/wkhtmltopdf/releases/download/${WKHTMLTOPDF_VERSION}/wkhtmltox_${WKHTMLTOPDF_VERSION}-1.buster_amd64.deb" \
  && dpkg -i "wkhtmltox_${WKHTMLTOPDF_VERSION}-1.buster_amd64.deb" \
  && apt-get install -yf \
  && rm -rf "wkhtmltox_${WKHTMLTOPDF_VERSION}-1.buster_amd64.deb" \
  && ln -sf /usr/local/bin/wkhtmltopdf /srv/bin/wkhtmltopdf \
  && cd /srv/bin \
  && curl -fsSL "https://github.com/Medium/phantomjs/releases/download/v${PHANTOMJS_VERSION}/phantomjs-${PHANTOMJS_VERSION}-linux-x86_64.tar.bz2" | tar -xjv \
  && mv phantomjs-${PHANTOMJS_VERSION}-linux-x86_64/bin/phantomjs /srv/bin/phantomjs-${PHANTOMJS_VERSION} \
  && rm -rf phantomjs-${PHANTOMJS_VERSION}-linux-x86_64 && rm -f phantomjs-${PHANTOMJS_VERSION}-linux-x86_64.tar.bz2 \
  && chmod +x /srv/bin/phantomjs-${PHANTOMJS_VERSION} \
  && curl -fsSL "https://storage.googleapis.com/google-code-archive-downloads/v2/code.google.com/phantomjs/phantomjs-${PHANTOMJS_OLD_VERSION}-linux-x86_64.tar.bz2" | tar -xjv \
  && mv phantomjs-${PHANTOMJS_OLD_VERSION}-linux-x86_64/bin/phantomjs /srv/bin/phantomjs \
  && rm -rf phantomjs-${PHANTOMJS_OLD_VERSION}-linux-x86_64 && rm -f phantomjs-${PHANTOMJS_OLD_VERSION}-linux-x86_64.tar.bz2 \
  && chmod +x /srv/bin/phantomjs \
  && wget "http://archive.apache.org/dist/tika/tika-app-${TIKA_VERSION}.jar" -O /srv/bin/tika-app-${TIKA_VERSION}.jar \
  && chmod +x /srv/bin/tika-app-${TIKA_VERSION}.jar \
  && apt-get -y remove openjdk-11-jdk \
  && apt-get -y clean \
  && apt-get -y autoclean \
  && apt-get -y autoremove \
  && rm -rf /var/lib/apt/lists/* && rm -rf && rm -rf /var/lib/cache/* && rm -rf /var/lib/log/* && rm -rf /tmp/*
