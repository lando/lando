Lando Apache PHP 5.3 appserver
==============================

A decent cross purpose apache based php 5.3 appserver.

```
# Basic apache php 5.3 appserver for Lando
#
# docker build -t kalabox/php:5.3-apache .

FROM eugeneware/php-5.3:master

# Copy our helpers
COPY docker-php-ext-enable /usr/local/bin/

# Install the PHP extensions we need
RUN apt-get update && apt-get install -y \
    bzip2 \
    libbz2-dev \
    libc-client2007e-dev \
    libjpeg-dev \
    libkrb5-dev \
    libldap2-dev \
    libmagickwand-dev \
    libmcrypt-dev \
    libpng12-dev \
    libpq-dev \
    libxml2-dev \
    mysql-client \
    imagemagick \
    xfonts-base \
    xfonts-75dpi \
  && pecl install apc \
  && pecl install imagick-3.3.0 \
  && pecl install oauth-1.2.3 \
  && pecl install redis-2.2.8 \
  && pecl install xdebug-2.2.7 \
  && docker-php-ext-configure gd --with-png-dir=/usr --with-jpeg-dir=/usr \
  && docker-php-ext-configure imap --with-imap-ssl --with-kerberos \
  && docker-php-ext-configure ldap --with-libdir=lib/x86_64-linux-gnu/ \
  && docker-php-ext-enable apc \
  && docker-php-ext-enable imagick \
  && docker-php-ext-enable oauth \
  && docker-php-ext-enable redis \
  && docker-php-ext-enable xdebug \
  && docker-php-ext-install \
    bcmath \
    bz2 \
    calendar \
    gd \
    imap \
    ldap \
    mcrypt \
    mbstring \
    mysql \
    mysqli \
    pdo \
    pdo_mysql \
    pdo_pgsql \
    soap \
    zip \
  && apt-get -y clean \
  && apt-get -y autoclean \
  && apt-get -y autoremove \
  && rm -rf /var/lib/apt/lists/* && rm -rf && rm -rf /var/lib/cache/* && rm -rf /var/lib/log/* && rm -rf /tmp/*
```
