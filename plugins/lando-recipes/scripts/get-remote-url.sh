#!/bin/bash

set -e

# Get the URL arg and opz
URL=$1
# Get options
if [ "$2" = '""' ]; then
  OPTIONS=
else
  OPTIONS="$2"
fi

# Determine whether this is an archive or a giturl and set other helpers
TYPE=$(git ls-remote "$URL" --quiet 2>/dev/null && echo "git repo" || echo "tar archive")
SRC_DIR=/tmp/source

# Do some basic reporting
echo "Detected that $URL is a $TYPE"

# Start with a clear slate
rm -rf "$SRC_DIR"
mkdir -p "$SRC_DIR"

# Either git
if [ "$TYPE" = "git repo" ]; then
  if [ -d "/app/.git" ]; then
    echo "Whoooops! Looks like you've already got a git repo here!"
    echo "Either delete this repo or try to lando init in a folder without .git in it"
    exit 666
  fi
  git -C "$SRC_DIR" clone $OPTIONS "$URL" ./
  echo "Copying git clone over to /app..."
  cp -rfT "$SRC_DIR" /app
fi

# Or archive
if [ "$TYPE" = "tar archive" ]; then
  echo "Downloading $URL..."
  cd "$SRC_DIR" && curl -fsSL -O "$URL"

  DOWNLOADED_FILE=( "$SRC_DIR"/* )
  [[ -e $DOWNLOADED_FILE ]] && echo "Downloaded to $DOWNLOADED_FILE" || { echo "Matched no files" >&2; exit 1; }

  FILENAME="${DOWNLOADED_FILE##*/}"
  EXTENSION="${FILENAME##*.}"
  OPTIONS="-C /app $OPTIONS"
  if [ "$EXTENSION" = "gz" ]; then
    tar -xvzf "$DOWNLOADED_FILE" $OPTIONS
  elif [ "$EXTENSION" = "bz2" ]; then
    tar -xvjf "$DOWNLOADED_FILE" $OPTIONS
  elif [ "$EXTENSION" = "xz" ]; then
    tar -xvJf "$DOWNLOADED_FILE" $OPTIONS
  elif [ "$EXTENSION" = "zip" ]; then
    unzip -o "$DOWNLOADED_FILE" -d /app
  fi

  echo "Extracted $DOWNLOADED_FILE to /app"
fi
