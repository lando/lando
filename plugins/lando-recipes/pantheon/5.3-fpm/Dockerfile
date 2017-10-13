# Pantheon php 5.3 fpm appserver for Lando
#
# docker build -t devwithlando/pantheon-appserver:5.3-fpm .

FROM devwithlando/php:5.3-fpm

# Version information
ENV WKHTMLTOPDF_VERSION 0.12.2
ENV PHANTOMJS_VERSION 2.1.1

# Install the additional things that make the pantheon
RUN apt-get update \
  && rm -f /usr/local/etc/php/conf.d/*-memcached.ini \
  && curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
  && chmod +x wp-cli.phar \
  && mv wp-cli.phar /usr/local/bin/wp \
  && mkdir -p /var/www/.composer \
  && cd /var/www/.composer \
  && composer require drush/drush:7.* \
  && cd /tmp && curl -OL "https://github.com/wkhtmltopdf/wkhtmltopdf/releases/download/${WKHTMLTOPDF_VERSION}/wkhtmltox-${WKHTMLTOPDF_VERSION}_linux-jessie-amd64.deb" \
  && dpkg -i /tmp/wkhtmltox-${WKHTMLTOPDF_VERSION}_linux-jessie-amd64.deb \
  && mkdir -p /srv/bin && ln -s /usr/local/bin/wkhtmltopdf /srv/bin/wkhtmltopdf \
  && cd /srv/bin \
  && curl -fsSL "https://github.com/Medium/phantomjs/releases/download/v${PHANTOMJS_VERSION}/phantomjs-${PHANTOMJS_VERSION}-linux-x86_64.tar.bz2" | tar -xjv \
  && mv phantomjs-${PHANTOMJS_VERSION}-linux-x86_64/bin/phantomjs /srv/bin/phantomjs \
  && rm -rf phantomjs-${PHANTOMJS_VERSION}-linux-x86_64 && rm -f phantomjs-${PHANTOMJS_VERSION}-linux-x86_64.tar.bz2 \
  && chmod +x /srv/bin/phantomjs \
  && apt-get -y clean \
  && apt-get -y autoclean \
  && apt-get -y autoremove \
  && rm -rf /var/lib/apt/lists/* && rm -rf && rm -rf /var/lib/cache/* && rm -rf /var/lib/log/* && rm -rf /tmp/*
