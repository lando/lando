#!/bin/bash

# This script exists mostly to deal with
# https://github.com/lando/lando/issues/1718
# without having to change how we do all the thigns

# Make sure we remove lingering processes
if [ -f "/opt/bitnami/mysql/tmp/mysql.sock" ]; then
  rm -rf "/opt/bitnami/mysql/tmp/mysql.sock"
fi
if [ -f "/opt/bitnami/mysql/tmp/mysql.sock.lock" ]; then
  rm -rf "/opt/bitnami/mysql/tmp/mysql.sock.lock"
fi
