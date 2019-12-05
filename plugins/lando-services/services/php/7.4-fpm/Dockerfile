# Basic php-fpm 7.4 appserver for Lando
#
# docker build -t devwithlando/php:7.4-fpm .

FROM php:7.4-fpm-buster

# Install dependencies we need
RUN mkdir -p /usr/share/man/man1 /usr/share/man/man7 \
  && apt -y update && apt-get install -y \
    gnupg2 \
    wget

# Install postgresql
RUN echo 'deb http://apt.postgresql.org/pub/repos/apt/ buster-pgdg main' >> /etc/apt/sources.list.d/pgdg.list \
  && wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -

# Install default set of required packages
RUN apt-get update && apt-get install -y \
    bzip2 \
    default-mysql-client \
    exiftool \
    git-core \
    imagemagick \
    libbz2-dev \
    libc-client2007e-dev \
    libicu-dev \
    libjpeg-dev \
    libkrb5-dev \
    libldap2-dev \
    libmagickwand-dev \
    libmemcached-dev \
    libpng-dev \
    libpq-dev \
    libssl-dev \
    libxml2-dev \
    libzip-dev \
    libonig-dev \
    openssl \
    postgresql-client-10 \
    pv \
    ssh \
    unzip \
    wget \
    xfonts-75dpi \
    xfonts-base \
    zlib1g-dev

# Install PECL depedencies
RUN pecl install apcu
RUN pecl install imagick
RUN pecl install memcached
RUN pecl install oauth-2.0.4
RUN pecl install redis-5.1.1
RUN pecl install xdebug-2.8.1

# Compile and configure all pecl packages
RUN docker-php-ext-configure gd --with-freetype-dir=/usr --with-png-dir=/usr --with-jpeg-dir=/usr
RUN docker-php-ext-configure ldap --with-libdir=lib/x86_64-linux-gnu/
RUN docker-php-ext-enable apcu
RUN docker-php-ext-enable imagick
RUN docker-php-ext-enable memcached
RUN docker-php-ext-enable oauth
RUN docker-php-ext-enable redis
RUN docker-php-ext-install bcmath
RUN docker-php-ext-install bz2
RUN docker-php-ext-install calendar
RUN docker-php-ext-install exif
RUN docker-php-ext-install gd
RUN docker-php-ext-install gettext
RUN docker-php-ext-install intl
RUN docker-php-ext-install ldap
RUN docker-php-ext-install mbstring
RUN docker-php-ext-install mysqli
RUN docker-php-ext-install opcache
RUN docker-php-ext-install pcntl
RUN docker-php-ext-install pdo
RUN docker-php-ext-install pdo_mysql
RUN docker-php-ext-install pdo_pgsql
RUN docker-php-ext-install soap
RUN docker-php-ext-install zip


# Composer installation
RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" \
  && php -r "if (hash_file('SHA384', 'composer-setup.php') === 'a5c698ffe4b8e849a443b120cd5ba38043260d5c4023dbf93e1558871f1f07f58274fc6f4c93bcfd858c6bd0775cd8d1') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;" \
  && php composer-setup.php --install-dir=/usr/local/bin --filename=composer --version=1.9.1 \
  && php -r "unlink('composer-setup.php');"

RUN chsh -s /bin/bash www-data && mkdir -p /var/www/.composer && chown -R www-data:www-data /var/www \
  && su -c "composer global require hirak/prestissimo" -s /bin/sh www-data \
  && apt-get -y clean \
  && apt-get -y autoclean \
  && apt-get -y autoremove \
  && rm -rf /var/lib/apt/lists/* && rm -rf && rm -rf /var/lib/cache/* && rm -rf /var/lib/log/* && rm -rf /tmp/*

# Configure imap support. Purposely put at the bottom else imap configuration might fail.
RUN PHP_OPENSSL=yes docker-php-ext-configure imap --with-kerberos --with-imap-ssl
RUN docker-php-ext-install imap
