Uninstalling
============

macOS
-----

1. Mount the DMG you downloaded to install Lando. Visit [GitHub](https://github.com/kalabox/lando/releases) if you no longer have the DMG
2. Double click on the `uninstall.command` script
3. Agree to remove Lando and enter your user password when prompted
4. Optionally you can remove your "Docker for Mac" installation. This will destroy **ALL** your containers.

Windows
-------

1. Open "Programs and Features" or "Add/Remove Programs"
2. Find and select Lando in the list
3. Click on "Uninstall"
4. Optionally you can remove "Docker for Mac" via "Add/Remove Programs" as well. This will destroy **ALL** your containers.

Linux
-----

1. Open up the "Software Center"
2. Search for and select "lando"
3. Click on "Uninstall"
4. Enter your password if prompted

If you do not have the GUI-based Software Center you can also uninstall Lando on the command line using the package management tool of your choice.

```bash
# With apt
sudo apt-get remove lando

# With dpkg
sudo dpkg -P lando

# With dnf
sudo dnf remove lando
```
