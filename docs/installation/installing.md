Installation
============

macOS
-----

### Installation Steps

1. Download the `.dmg` package from [kalabox.io/download](http://kalabox.io/download)
2. Mount the DMG by double-clicking it
3. Double-click on the `KalaboxInstaller.pkg`
4. Go through the setup workflow
5. Enter your username and password when prompted
6. Launch the Kalabox CLI or GUI and start deving all the devs

Windows
-------

### Installation Steps

1. Download the Windows `.exe` package from [kalabox.io/download](http://kalabox.io/download)
2. Double-click on `kalabox.exe`
3. Go through the setup workflow
4. Approve various UAC prompts during install
5. After installation is finished make sure you [set up Shared Drives](https://docs.docker.com/docker-for-windows/#/shared-drives)
6. Launch the Kalabox CLI or GUI and start deving all the devs

!!! warning "YOU MUST SET UP SHARED DRIVES AND HAVE HYPER-V ENABLED"
    After installation is finished make sure you [set up Shared Drives](https://docs.docker.com/docker-for-windows/#/shared-drives) and if you have further problems, check to see if [Hyper-V is enabled](https://msdn.microsoft.com/en-us/virtualization/hyperv_on_windows/quick_start/walkthrough_install).

Debian/Ubuntu
-------------

### Installation

1. Download the `.deb` package from [kalabox.io/download](http://kalabox.io/download)
2. Double-click on the `.deb` package to launch Software Center
3. Click the "Install" button and enter your password when prompted

If you do not have the GUI-based Software Center you can install the `.deb` pkg on the command line.

```bash
sudo apt-get update -y
sudo apt-get install bridge-utils iptables cgroup-bin
sudo dpkg -i kalabox.deb
```

Fedora/RedHat
-------------

### Installation

1. Download the `.rpm` package from [kalabox.io/download](http://kalabox.io/download)
2. Double-click on the `.rpm` package to launch Software Center
3. Click the "Install" button and enter your password when prompted

If you do not have the GUI-based Software Center you can install the `.rpm` pkg on the command line.

```bash
sudo dnf update -y
sudo dnf install bridge-utils iptables cgroup-bin
sudo rpm -i kalabox.deb
```
