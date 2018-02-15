/**
 * Command to self update
 *
 * @name selfupdate
 */

'use strict';

module.exports = function(lando) {

  var cmd;
  var ext;
  var dl;
  var rm;
  var tmp;

  // Define our task
  return {
    command: 'selfupdate',
    describe: 'Update the lando version',
    run: function(options) {
      // TODO: Validate version.
      var version = options._[1];
      if (process.arch !== 'x64') {
        console.log(process.platform + ' ' + process.arch + ' architecture is not supported.');
      } else {
        switch (process.platform) {
          // Mac OS X.
          case 'darwin':
            cmd = 'open';
            ext = 'dmg';
            dl = 'wget';
            rm = 'rm -rf';
            tmp = '/tmp/';
            break;

          // GNU/Linux flavors.
          case 'linux':
            // Supported Linux distros.
            // TODO: Add more compatible flavors.
            var debianBased = [
              'Debian',
              'LinuxMint',
              'Ubuntu'
            ];
            var redhatBased = [
              'CentOS',
              'Fedora',
              'RedHat'
            ];
            // Get the distro name. Like a boss. Like Linus.
            var distro = require('linus');
            distro.name(function(err, name) {
              if (name) {
                if (debianBased.indexOf(name) === 1) {
                  cmd = 'sudo dpkg -i';
                  ext = 'deb';
                }
                if (redhatBased.indexOf(name) === 1) {
                  cmd = 'sudo rpm -ivh';
                  ext = 'rpm';
                }
                if (ext === undefined) {
                  cmd = '';
                  console.log(name + ' distro is not supported.');
                }
              } else {
                cmd = '';
                console.log(err.message || 'Unknown distro is not supported.');
              }
            });
            // This is one scenario where a synchronous function would be helpful.
            // In order to get the variable assignments from distro.name, we need to wait.
            while (cmd === undefined) {
              require('deasync').runLoopOnce();
            }
            dl = 'wget';
            rm = 'rm -rf';
            tmp = '/tmp/';
            break;

          // Windows.
          case 'win32':
            cmd = 'start /b';
            ext = 'exe';
            // This command is supposedly deprecated in future versions of Windows.
            // However, this is currently the only out-of-the-box wget-like utility.
            dl = 'bitsadmin /transfer myJob /download /priority normal';
            rm = 'del /S /F';
            tmp = '\\Temp\\';
            break;

          // The others that have fallen the way of the Dark Side.
          default:
            cmd = '';
            console.log(process.platform + ' operating system is not supported.');
        }
        if (cmd !== '') {
          var fs = require('fs');
          var appRoot = lando.config.env.LANDO_APP_ROOT;
          var current = lando.config.version;
          var latest = lando.cache.get('updates').version;
          if (version === undefined || lando.updates.updateAvailable(current, latest)) {
            version = 'v' + latest;
          }
          // Installed from source?
          // Yoda: Strong, am I with the Source...but not that strong. Twilight is upon me, and soon night must fall. That is the way of things...the way of the Source.
          if (fs.existsSync(appRoot + '/.git')) {
            var cmds = [
              'cd ' + appRoot,
              'git fetch --all',
              'git checkout ' + version,
              rm + ' yarn.lock',
              rm + ' node_modules',
              'yarn install'
            ];
          // Installed from binary.
          } else {
            var landoPackage = 'lando-' + version + '.' + ext;
            var chdirCommand = 'cd ' + tmp;
            var downloadCommand = dl + ' https://github.com/lando/lando/releases/download/' + version + '/' + landoPackage;
            var installCommand = cmd + ' ' + landoPackage;
            var removeCommand = rm + ' ' + landoPackage;
            if (process.platform === 'win32') {
              downloadCommand = downloadCommand + ' ' + landoPackage;
            }
            var cmds = [
              chdirCommand,
              downloadCommand,
              installCommand,
              removeCommand
            ];
          }
          // Execute operating system specific commands.
          // TODO: Prettify the output.
          var exec = require('child_process').exec;
          var command = cmds.join(' && ');
          var out = exec(command, function(err, stdout, stderr) {
            if (err) {
              console.log(err);
            }
            console.log(stdout);
          });
          out.on('exit', function(code) {
            console.log('Exit code: ' + code);
          });
        }
      }
    }
  };

};
