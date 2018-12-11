Lando PHP-FPM 5.6 appserver
===========================

A decent cross purpose fpm based php 5.6 appserver.

```
# Basic php-fpm 5.6 appserver for Lando
#
# docker build -t devwithlando/php:5.6-fpm .

FROM php:5.6-fpm-jessie

# Install dependencies we need
RUN apt-get update && apt-get install -y \
    bzip2 \
    exiftool \
    git-core \
    imagemagick \
    libbz2-dev \
    libc-client2007e-dev \
    libjpeg-dev \
    libkrb5-dev \
    libldap2-dev \
    libmagickwand-dev \
    libmcrypt-dev \
    libmemcached-dev \
    libpng12-dev \
    libpq-dev \
    libxml2-dev \
    libicu-dev \
    mysql-client \
    postgresql-client \
    pv \
    ssh \
    unzip \
    wget \
    xfonts-base \
    xfonts-75dpi \
    zlib1g-dev \
  && pecl install apcu-4.0.11 \
  && pecl install imagick \
  && pecl install memcached-2.2.0 \
  && pecl install oauth-1.2.3 \
  && pecl install redis-2.2.8 \
  && pecl install xdebug-2.5.5 \
  && docker-php-ext-configure gd --with-freetype-dir=/usr --with-png-dir=/usr --with-jpeg-dir=/usr \
  && docker-php-ext-configure imap --with-imap-ssl --with-kerberos \
  && docker-php-ext-configure ldap --with-libdir=lib/x86_64-linux-gnu/ \
  && docker-php-ext-enable apcu \
  && docker-php-ext-enable imagick \
  && docker-php-ext-enable memcached \
  && docker-php-ext-enable oauth \
  && docker-php-ext-enable redis \
  && docker-php-ext-install \
    bcmath \
    bz2 \
    calendar \
    exif \
    gd \
    imap \
    ldap \
    mcrypt \
    mbstring \
    mysql \
    mysqli \
    opcache \
    pdo \
    pdo_mysql \
    pdo_pgsql \
    soap \
    zip \
    intl \
    gettext \
  && php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" \
  && php -r "if (hash_file('SHA384', 'composer-setup.php') === '93b54496392c062774670ac18b134c3b3a95e5a5e5c8f1a9f115f203b75bf9a129d5daa8ba6a13e2cc8a1da0806388a8') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;" \
  && php composer-setup.php --install-dir=/usr/local/bin --filename=composer --version=1.8.0 \
  && php -r "unlink('composer-setup.php');" \
  && chsh -s /bin/bash www-data && mkdir -p /var/www/.composer && chown -R www-data:www-data /var/www \
  && su -c "composer global require hirak/prestissimo" -s /bin/sh www-data \
  && apt-get -y clean \
  && apt-get -y autoclean \
  && apt-get -y autoremove \
  && rm -rf /var/lib/apt/lists/* && rm -rf && rm -rf /var/lib/cache/* && rm -rf /var/lib/log/* && rm -rf /tmp/*
```
