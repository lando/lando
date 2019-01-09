#!/bin/sh

set -e

# Get the URL arg
URL=$1

# Determine whether this is an archive or a giturl
TYPE=$(git ls-remote "$URL" --quiet 2>/dev/null && echo "git repo" || echo "tar archive")

# Do some basic reporting
echo "Detected that $URL is a $TYPE"

# Either git clone or extract
if [ "$TYPE" = "git repo" ]; then
  echo "clonging"
else
  echo "Downloading $URL"
  curl -fsSL -o /tmp/archive.tar.gz "$URL"

fi

  #const cloneRepo = repo => {
  #  // Get a unique clone folder
  #  const tmpFolder = '/tmp/' + _.uniqueId('app-');
  #
  #  // Commands
  #  const mkTmpFolder = 'mkdir -p ' + tmpFolder;
  #  const cloneRepo = 'git -C ' + tmpFolder + ' clone ' + repo + ' ./';
  #  const cpHome = 'cp -rfT ' + tmpFolder + ' /app';
  #
  #  // Clone cmd
  #  return [mkTmpFolder, cloneRepo, cpHome].join(' && ');
  #};

