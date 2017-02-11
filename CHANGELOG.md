v2.1.4
======

* Added `KALABOX_HOSTOS` environmental variable to every container.
* Fixed bug where deleting an app whilst creating another would result in `ENOENT` on the deleted app. [#1742](https://github.com/kalabox/kalabox/issues/1742)
* Added GUI to `Pantheon` based Linux Desktops. [#1737](https://github.com/kalabox/kalabox/issues/1737)
* Fixed bug where plugins with `undefined` config sections were stalling the GUI loading screen.

v2.1.3
======

* Added `lodash` to `kbox.node._` for use in easy plugin craftworks.
* Added `chalk` to `kbox.node.chalk` for use in easy plugin craftworks.
* Added `fs-extra` to `kbox.node.fs` for use in easy plugin craftworks.
* Added `inquirer` to `kbox.node.inquirer` for use in easy plugin craftworks.
* Added `restler` to `kbox.node.restler` for use in easy plugin craftworks.
* Fixed `postoptcmd` to put options in the right place when used via `cli.yml`

v2.1.2
======

* Fixed regression where `cli` was not accepting hyphens for site names. [#1711](https://github.com/kalabox/kalabox/issues/1711)
* Updated to latest stable Docker for Mac and Docker for Windows `v1.12.3`. [#1711](https://github.com/kalabox/kalabox/issues/1711)
* Fixed bug where non-Kalabox containers were getting wiped out during Kalabox cleanup. [#1708](https://github.com/kalabox/kalabox/issues/1708)

v2.1.1
======

* Switched site is up logic to not reject self-signed certs if site it forcing `HTTPS`. [#1657](https://github.com/kalabox/kalabox/issues/1657)
* Switched site is up logic to always end up with site being ready. [#1688](https://github.com/kalabox/kalabox/issues/1688)
* Improved Kalabox start and shutdown logic. [#1669](https://github.com/kalabox/kalabox/issues/1669)
* Added `kbox poweroff` command. [#1669](https://github.com/kalabox/kalabox/issues/1669)
* Removed local `dns` server in favor of remote option. Should improve resolution on Windows. [#1676](https://github.com/kalabox/kalabox/issues/1676)
* Changed default GUI app location from `~/.kalabox/apps` to `~/Kalabox`.
* Added removal of `~/.kalabox` on uninstall.
* Provided some retry wrappers to key `docker` engine operations.
* Widened `services` plugin to allow non `*.kbox.site` domains. [#1611](https://github.com/kalabox/kalabox/issues/1611)

v2.1.0
======

* Removed `docker-machine` and `VirtualBox` in favor of `Docker for Mac/Windows` and `xhyve/Hyper-V`.
* Vastly improved file sharing and resource usage.
* Added `confirmbigdel=false` to `unison` file sharing. This allows the user to remove their entire shared folder without issue.
* Fixed `KALABOX_ENGINE_REMOTE_IP` value on macOS. Resolves issues with xdebug.
* Updated `kalabox-cmd` plugin to take arrays for `{pre|post}cmdopts}`.
* Improved auto install of Docker for Mac

v2.1.0-rc.2
===========

* Fixed `KALABOX_ENGINE_REMOTE_IP` value on macOS. Resolves issues with xdebug.
* Updated `kalabox-cmd` plugin to take arrays for `{pre|post}cmdopts}`.

v2.1.0-rc.1
===========

* Removed `docker-machine` and `VirtualBox` in favor of `Docker for Mac/Windows` and `xhyve/Hyper-V`.
* Vastly improved file sharing and resource usage.
* Added `confirmbigdel=false` to `unison` file sharing. This allows the user to remove their entire shared folder without issue.

v2.0.1
======

* Fixed unassigned token `%KBOX_VERSION%` showing up in OSX installer customization. [#1614](https://github.com/kalabox/kalabox/issues/1614)
* Updated documentation. [#1641](https://github.com/kalabox/kalabox/issues/1641) [#1629](https://github.com/kalabox/kalabox/issues/1629) [#1635](https://github.com/kalabox/kalabox/issues/1635) [#1610](https://github.com/kalabox/kalabox/issues/1610)
* Added a generic `kbox .` command so you can run things like `ls`, `rm`, `sudo` on containers. [#1615](https://github.com/kalabox/kalabox/issues/1615)

v2.0.0
======

* Relaxed criteria for a site to "Be ready". [#1593](https://github.com/kalabox/kalabox/issues/1593)

v0.13.0-rc.3
============

* Improved GUI error reporting. Errors now get sent to the notification center.
* Fixed critical regression that caused PUSH/PULL to not grab DB/FILES on GUI. [#1587](https://github.com/kalabox/kalabox/issues/1587)
* Added correct starting `env` to push/pull in GUI and `test`/`live` to pull for Pantheon apps. [#1537](https://github.com/kalabox/kalabox/issues/1587)

v0.13.0-rc.2
============

* Resolved longstanding Windows DNS issue. [#1478](https://github.com/kalabox/kalabox/issues/1478)
* Introduced a waiting dialogue while fetching environments for the site pull modal to prevent a "hang" after selecting "Pull" from the site actions dropdown in the GUI. [#1570](https://github.com/kalabox/kalabox/issues/1570)
* Prevented an authentication error from appearing when retrieval of complete site list takes longer than 15 seconds. [#1569](https://github.com/kalabox/kalabox/issues/1569)
* Ensured `kalabox` service was disabled on `*nix` pkg removal. [#1565](https://github.com/kalabox/kalabox/issues/1565)
* Ensured `kalabox` `docker` assets get removed on `*nix` pkg pruge. [#1565](https://github.com/kalabox/kalabox/issues/1565)
* Fixed hung installer on Windows by removing `yes.exe` from engine activation script. [#1564](https://github.com/kalabox/kalabox/issues/1564)
* Added better error reporting and handling to the Windows installer. [#1564](https://github.com/kalabox/kalabox/issues/1564)
* Upgraded to Virtualbox 5.1.6
* Fix messaging on pull/push in Kalabox. [#1574](https://github.com/kalabox/kalabox/issues/1574)

v0.13.0-rc.1
============

* Switched `kbox status` on `linux` to use PID file existence instead of `service` wrapper. [#1539](https://github.com/kalabox/kalabox/issues/1539)
* Provided a check to ensure the `docker` daemon is up on Windows and OSX. [#1387](https://github.com/kalabox/kalabox/issues/1387)
* Simplified `osx` uninstall script and made it clickable. [#1361](https://github.com/kalabox/kalabox/issues/1361)
* Updated to latest stable releaes of `engine`, `compose`, `machine` and `virtualbox`. [#1361](https://github.com/kalabox/kalabox/issues/1361)
* Added a weak check to warn the user if an app is possibly in a bad state. [#1542](https://github.com/kalabox/kalabox/issues/1542)
* Improved `kbox start` so it waits until site returns `200 OK` before indicating site is up. [#1543](https://github.com/kalabox/kalabox/issues/1543)
* Add loading icons and placeholders to show GUI activities to the user. [#1489](https://github.com/kalabox/kalabox/issues/1489)

v0.13.0-beta.4
==============

* Loosened default `unison` ignore patterns. [#1501](https://github.com/kalabox/kalabox/issues/1501)
* Bumped `stdin` max listeners to suppress `EventEmitter` warning. [#1502](https://github.com/kalabox/kalabox/issues/1502)
* Better user feedback when running `kbox start` and `kbox stop`. [#955](https://github.com/kalabox/kalabox/issues/955)
* Added a `force` option to `kbox start` and `kbox stop`. [#955](https://github.com/kalabox/kalabox/issues/955)
* Expanded `services` plugin to handle multiple subdomains and custom URLs. [#1182](https://github.com/kalabox/kalabox/issues/1182) [#1485](https://github.com/kalabox/kalabox/issues/1485)
* Fixed upgrade pathway on `debian`. [#1506](https://github.com/kalabox/kalabox/issues/1506)
* Fixed `kbox` engine commands like `up`, `down` and `status` to work correctly on Linux. [#1375](https://github.com/kalabox/kalabox/issues/1375)
* Removed empty menu in `win32` and `linux`. [#1521](https://github.com/kalabox/kalabox/issues/1521)
* Added an option to refresh the list of Pantheon sites to the GUI. [#1510](https://github.com/kalabox/kalabox/issues/1510)
* Set default Pantheon create `env` to `dev` in GUI. [#1365](https://github.com/kalabox/kalabox/issues/1365)
* Fixed and improved site `url` listing in GUI Site Connection Info Modal. [#1492](https://github.com/kalabox/kalabox/issues/1492)

v0.13.0-beta.3
==============

* Clarified which uninstaller should be used. [#1490](https://github.com/kalabox/kalabox/issues/1490)
* Fixed permission error on OSX that caused "The application “Kalabox” can’t be opened" [#1477](https://github.com/kalabox/kalabox/issues/1477)
* Fixed `unison` on Windows. This resolves the `*.tmp` directory problem. [#1484](https://github.com/kalabox/kalabox/issues/1484)
* Removed `dns host resolver` setting to improve DNS response time on Windows [#1487](https://github.com/kalabox/kalabox/issues/1487)

v0.13.0-beta.2
==============

* Rebooted our documentation [#1322](https://github.com/kalabox/kalabox/issues/1322)
* Improved `kbox env` description [#1373](https://github.com/kalabox/kalabox/issues/1373)
* Fixed Kalabox complaining about the `appRegistry.json.lock` file [#1426](https://github.com/kalabox/kalabox/issues/1426)
* Ensured `dns` and `proxy` are running before a `kbox start` and `kbox stop` [#1294](https://github.com/kalabox/kalabox/issues/1294)
* Added ability to optimize `unison` file sharing by ignoring or targeting specific paths. [#1440](https://github.com/kalabox/kalabox/issues/1440)
* Improved logging by reducing noise, adding color and separated `debug` and `verbose` better.
* Fixed bug on Linux where adding services to `kalabox_proxy` was failing. [#1351](https://github.com/kalabox/kalabox/issues/1351)
* Fixed bug on Linux where `kbox services` would sometimes not return all the services. [#1429](https://github.com/kalabox/kalabox/issues/1429)
* Fixed bug where Windows latest dev release was not avaialable to the public by default.
* Upgraded Windows and OSX to [VirtualBox 5.0.26](https://www.virtualbox.org/wiki/Download_Old_Builds_5_0)
* Improved `app.isRunning` to filter out any `autostart` services.
* Improved handling of app state to remove the "token" docker containers. Should improve app start speed and general GUI experience. [#1451](https://github.com/kalabox/kalabox/issues/1451)
* Fixed bug where `mode` was not set as a dependency in our tests.
* Fixed bug on OSX where `.docker` had the wrong permissions, causing install failure
* Fixed bug where GUI initialize screen would persist indefinitely on Windows [#1435](https://github.com/kalabox/kalabox/issues/1435)

v0.13.0-alpha.1
===============

* Moved `kalabox-app-pantheon` and `kalabox-app-php` from `srcRoot` to `sysConfRoot`. [#1407](https://github.com/kalabox/kalabox/issues/1407)
* Simplified OSX packge so most assets are within `Kalabox.app` bundle. [#1406](https://github.com/kalabox/kalabox/issues/1406)
* Removed `syncthing` in favor of `unison`. [#1374](https://github.com/kalabox/kalabox/issues/1374)
* Fixed GUI memory leak. [#1368](https://github.com/kalabox/kalabox/issues/1368)
* Removed legacy DNS options. [#1330](https://github.com/kalabox/kalabox/issues/1330)
* Fixed issue where Kalabox apps would not work while offline [#1227](https://github.com/kalabox/kalabox/issues/1227)
* Fixed CLI falsely reporting "Where is everything!?!?!" on Windows [#1348](https://github.com/kalabox/kalabox/issues/1348)
* Removed usage of {userdocs} for {localappdata} in Windows installer [#1186](https://github.com/kalabox/kalabox/issues/1186)
* Simplified Windows installer [#1245](https://github.com/kalabox/kalabox/issues/1245)
* Fixed issue where Kalabox apps would not work while offline. [#1227](https://github.com/kalabox/kalabox/issues/1227)
* Fixed TRAVIS_TAG=latest-dev triggering GitHub deployment. [#1412](https://github.com/kalabox/kalabox/issues/1412)
* Simplified debian and fedora installers. [#1408](https://github.com/kalabox/kalabox/issues/1408)
* Merged `kalabox-ui` and `kalabox-cli` into this repo. [#1357](https://github.com/kalabox/kalabox/issues/1357)
