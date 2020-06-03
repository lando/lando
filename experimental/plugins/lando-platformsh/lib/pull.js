'use strict';

// The non dynamic base of the task
const task = service => ({
  service,
  description: 'Pull relationships and/or mounts from platform.sh',
  cmd: '/helpers/psh-pull.sh',
  level: 'app',
  stdio: ['inherit', 'pipe', 'pipe'],
  options: {
    relationship: {
      description: 'A relationship to import',
      passthrough: true,
      alias: ['r'],
      array: true,
    },
    mount: {
      description: 'A mount to download',
      passthrough: true,
      alias: ['m'],
      array: true,
    },
  },
});

/*
 * Helper to build a pull command
 */
exports.getPlatformPull = service => task(service);
