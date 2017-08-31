# Pantheon php 5.5 fpm appserver for Lando
#
# docker build -t kalabox/pantheon-php:5.5-fpm .

FROM kalabox/php:5.5-fpm

# Version information
ENV BACKDRUSH_VERSION 0.0.5
ENV WKHTMLTOPDF_VERSION 0.12.2
ENV PHANTOMJS_VERSION 2.1.1
ENV TERMINUS_VERSION 1.5.0

# Install the additional things that make the pantheon
RUN apt-get update \

  # Get WP CLI
  && curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
  && chmod +x wp-cli.phar \
  && mv wp-cli.phar /usr/local/bin/wp \

  # Get Drush
  && wget http://files.drush.org/drush.phar \
  && php drush.phar core-status \
  && chmod +x drush.phar \
  && mv drush.phar /usr/local/bin/drush \

  # Get Terminus
  && mkdir -p /var/www/.composer \
  && cd /var/www/.composer \
  && curl -O https://raw.githubusercontent.com/pantheon-systems/terminus-installer/master/builds/installer.phar \
  && php installer.phar install --install-version=$TERMINUS_VERSION \

  # Get Drupal console
  && curl https://drupalconsole.com/installer -L -o drupal.phar \
  && chmod +x drupal.phar \
  && mv drupal.phar /usr/local/bin/drupal \

  # Get Backdrush extensions
  && mkdir -p /var/www/.drush \
  && mkdir -p /var/www/.backdrush \
  && curl -fsSL "https://github.com/backdrop-contrib/drush/archive/${BACKDRUSH_VERSION}.tar.gz" | tar -xz --strip-components=1 -C /var/www/.backdrush \

  # Get Pantheon External libraies
  # see: https://pantheon.io/docs/external-libraries/
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
