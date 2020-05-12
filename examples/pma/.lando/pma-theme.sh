#!/bin/sh
if [ ! -z $LANDO_MOUNT ]; then
  wget https://files.phpmyadmin.net/themes/pmaterial/1.1/pmaterial-1.1.zip
  unzip pmaterial-1.1.zip -d /www/themes/
  rm pmaterial-1.1.zip
fi
