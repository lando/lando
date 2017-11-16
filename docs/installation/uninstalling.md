Uninstalling
============

macOS
-----

1. Mount the DMG you downloaded to install Lando. Visit [GitHub](https://github.com/lando/lando/releases) if you no longer have the DMG
2. Double click on the `uninstall.command` script
3. Agree to remove Lando and enter your user password when prompted
4. Optionally you can remove your "Docker for Mac" installation. This will destroy **ALL** your containers.

Windows
-------

1. Open "Programs and Features" or "Add/Remove Programs"
2. Find and select Lando in the list
3. Click on "Uninstall"
4. Optionally you can remove "Docker for Windows" via "Add/Remove Programs" as well. This will destroy **ALL** your containers.

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

Removing Lando Configuration
----------------------------

If you've uninstalled Lando but want to remove **ALL TRACES OF IT** you will also want to remove its configuration directory.

Unless you've edited Lando's [global config](./../config/config.md) Lando will store app configuration inside your home folder. You can use `lando config | grep userConfRoot` to locate the precise location on your machine. By default these locations will be:

| Operating System | Default Location |
| -- | -- |
| Win | `C:\Users\ME\.lando` |
| Linux | `~/.lando` |
| macOS | `~/.lando` |

To remove on Linux or macOS you can run `rm -rf ~/.lando`. You can use `explorer` to remove on Windows.
