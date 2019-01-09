#!/bin/bash

set -e

  #const createKey = key => {
  #  // Ensure that cache directory exists
  #  const keysDir = path.join(lando.config.userConfRoot, 'keys');
  #  mkdirp.sync(path.join(keysDir));
  #
  #  // Construct a helpful and instance-specific comment
  #  const comment = lando.config.instance + '.lando@' + os.hostname();
  #  const keyPath = '/lando/keys/' + key;
  #
  #  // Key cmd
  #  return 'ssh-keygen -t rsa -N "" -C "' + comment + '" -f "' + keyPath + '"';
  #};