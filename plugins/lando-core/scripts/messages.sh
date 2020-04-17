#!/bin/sh

# Stuff that needs to get loaded first and available everywhere
# @TODO: put in its own folder at some point? or just put into hyperdrive proper?

# Echos default green message
status_info() {
  MESSAGE=${1:-done!}
  echo -e "\033[38;5;5m$MESSAGE\033[39m"
}

# Echos default green message
status_good() {
  MESSAGE=${1:-done!}
  echo -e "\033[32m$MESSAGE\033[39m"
  echo ""
}

# Echos default yellow message
status_warn() {
  MESSAGE=${1:-done!}
  echo -e "\033[33m$MESSAGE\033[39m"
}

# Echos default red message
status_bad() {
  MESSAGE=${1:-done!}
  echo -e "\033[91m$MESSAGE\033[39m"
}

# Basic error handler
error() {
  MESSAGE=${1:-Something bad happened!}
  CODE=${2:-1}
  status_bad "$MESSAGE"
  exit $CODE
}
