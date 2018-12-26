/*
  // Add in the switch command
  tools['switch <env>'] = {
    service: 'appserver',
    description: 'Switch to a different multidev environment',
    needs: ['database'],
    cmd: '/helpers/switch.sh',
    options: {
      'no-db': {
        description: 'Do not switch the database',
        boolean: true,
        default: false,
      },
      'no-files': {
        description: 'Do not switch the files',
        boolean: true,
        default: false,
      },
    },
  };
*/
