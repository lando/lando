Uninstallation
==============

Preuninstall Checks
-------------------

1. Make sure you have closed the Kalabox GUI and terminated any running Kalabox process

macOS
-----

1. Mount the DMG you downloaded to install Kalabox. Visit [the Kalabox release page](https://github.com/kalabox/kalabox/releases) if you no longer have the DMG
2. Double click on the `uninstall.command` script
3. Agree to remove Kalabox2 and enter your user password when prompted
4. Optionally you can remove your "Docker for Mac" installation. This will destroy **ALL** your containers.

Windows
-------

1. Open "Programs and Features" or "Add/Remove Programs"
2. Find and select Kalabox in the list
3. Click on "Uninstall"
4. Optionally you can remove "Docker for Mac" via "Add/Remove Programs" as well. This will destroy **ALL** your containers.

Linux
-----

1. Open up the "Software Center"
2. Search for and select "kalabox"
3. Click on "Uninstall"
4. Enter your password if prompted

If you do not have the GUI-based Software Center you can also uninstall Kalabox on the command line.

```bash
# With apt
sudo apt-get remove kalabox

# With dpkg
sudo dpkg -P kalabox

# With dnf
sudo dnf remove kalabox
```
