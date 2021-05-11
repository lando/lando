---
description: Get the skinny on how to easily install Lando, a local development and DevOps tool, on macOS, Windows and Linux.
---

# Installation

## System Requirements

Lando is designed to work on a wide range of computers. Here are some basic guidelines to ensure your Lando experience is as smooth as possible.

### Operating System

*   macOS 10.13 or later
*   Windows 10 Pro+ or equivalent (eg Windows 10 Enterprise) [**with Hyper-V running**](https://msdn.microsoft.com/en-us/virtualization/hyperv_on_windows/quick_start/walkthrough_install)
*   Linux with kernel version 4.x or higher

### Docker Engine Requirements

Please also verify you meet the requirements needed to run our Docker engine backend. Note that the macOS and Windows Lando installer will install Docker for you if needed.

*   Linux Docker engine [requirements](https://docs.docker.com/engine/installation/linux)
*   Docker for Mac [requirements](https://docs.docker.com/docker-for-mac/#/what-to-know-before-you-install)
*   Docker for Windows [requirements](https://docs.docker.com/docker-for-windows/#/what-to-know-before-you-install)

## Hardware Requirements

::: warning Not for the faint of heart!
Note that Lando is basically a PaaS running on your computer and as such we don't recommend you use it [UNLESS YOU'VE GOT POWER!!!](https://www.youtube.com/watch?v=NowdrL6fvb4).
:::

### Minimum requirements

You _can_ run Lando using the below but your experience may be less than ideal.

*   2-core **x86-compat** processor
*   4GB+ RAM
*   25GB+ of available disk space

### Preferred

We've found the below or better to deliver the best experience.

*   8-core processor
*   16GB+ RAM
*   100GB+ of available disk space

::: tip Apple Silicon M1 Chip Support
Docker is [working on support](http://docker.com/blog/apple-silicon-m1-chips-and-docker) for Mac computers running Apple Silicon M1 chips. We've been monitoring their progress and plan to introduce an M1-compatible Lando binary as soon as possible. [Sponsor Lando](https://github.com/sponsors/lando) to make that world a reality!
:::

## Preflight Checks

1.  Verify that your system meets the [minimum system and hardware requirements](#system-requirements) to run Lando.
2.  Verify that you are connected to the internet.
3.  Verify that you have administrative access to your machine.

### Optional checks

1.  If you already have Docker installed it needs to be set to factory defaults.
2.  If you are also running VirtualBox on Windows check out [this](./../help/win-also-vb.md).

## MacOS

<YouTube url="https://www.youtube.com/embed/W8qIutOAe-0" />

::: tip Do not fear the package size!
Note that our macOS installer _includes_ Docker Desktop and this accounts for it's large file size in comparison to our Linux packages.

When going through the installer you can choose to _not_ install Docker Desktop, although we recommend you use the version of Docker Desktop that we ship for compatibility and support reasons!
:::

### Install DMG via direct download (recommended)

1.  Download the latest `.dmg` package from [GitHub](https://github.com/lando/lando/releases)
2.  Mount the DMG by double-clicking it
3.  Double-click on the `LandoInstaller.pkg`
4.  Go through the setup workflow
5.  Enter your username and password when prompted

### Install via [HomeBrew](https://brew.sh/) (third party)

::: warning We do not maintain this!
Please note that the versions of Lando and Docker installed via Homebrew are community-maintained and may not be the latest version as provided by the `.dmg` package from [GitHub](https://github.com/lando/lando/releases). **This also means that `brew` may install an unsupported version of Docker for you.**

See: <https://github.com/Homebrew/homebrew-cask/blob/master/Casks/lando.rb>
:::

1. Ensure homebrew is installed and up-to-date.
2. Add the lando cask: `brew install --cask lando`

## Linux

### Install package via direct download (recommended)

1. Install the [Docker Community Edition](https://docs.docker.com/engine/installation/) for your Linux version. Visit [https://get.docker.com](https://get.docker.com/) for the "quick & easy install" script. **(at least version 19.03.1-ce)**
2. Download the latest `.deb`, `.pacman` or `.rpm` package from [GitHub](https://github.com/lando/lando/releases)
3. Double click on the package and install via your distributions "Software Center" or equivalent.
4. Make sure you look at the caveats below and follow them appropriately

::: tip Install from source for other Linux distros
If your Linux distro does not support our `.deb`, `.pacman` or `.rpm` packages you can [install from source](#from-source)
:::

### Install via CLI

Make sure you have `wget` installed.

### Debian

```bash
wget https://files.devwithlando.io/lando-stable.deb
sudo dpkg -i lando-stable.deb
```

### Fedora

```bash
wget https://files.devwithlando.io/lando-stable.rpm
sudo dnf install lando-stable.rpm
```

### Arch

```bash
wget https://files.devwithlando.io/lando-stable.pacman
sudo pacman -U lando-stable.pacman
```

Make sure you look at the caveats below and follow them appropriately as well.

### Caveats

#### `docker-ce`

We set `docker-ce` as a hard dependency for our packages. This means if you have docker installed a different way it is likely installing the package will fail. You *may* be able to get around this if your package utility allows dependency ignorance

```bash
dpkg -i --ignore-depends=docker-ce lando-stable.deb
```

After installing lando this way, you may need to edit the `/var/lib/dpkg/status` file and remove `docker-ce` from the lando package dependency list in order for future `apt` related commands to work. Great care should be taken while editting this file!!!.

We are currently considering whether to support alternate means of installing Docker such as with [moby-engine](https://github.com/lando/lando/issues/1294)

#### Arch

Lando is also available on the AUR as [lando-git](https://aur.archlinux.org/packages/lando-git/), meaning it's built directly from source.

#### Additional Setup

Because each Linux distribution handles things differently, these considerations may or may not apply to you:

* If your distro uses a `docker` group, make sure your user is a member of it:

  ```
  sudo usermod -aG docker $USER
  ```

  You will need to log out for this change to take effect. Sometimes a reboot is necessary. See [this](https://docs.docker.com/install/linux/linux-postinstall/) for more details.

* If your distro uses SystemD, make sure that both `docker.service` and `docker.socket` daemons are running.

* If you are using Manjaro or another Arch-based distro, you may need to enable the [AUR repository](https://aur.archlinux.org/packages/) for dependencies.

## Windows

::: warning YOU MUST HAVE HYPER-V ENABLED
Make sure that [Hyper-V is enabled](https://msdn.microsoft.com/en-us/virtualization/hyperv_on_windows/quick_start/walkthrough_install) or Lando will not work!
:::

::: tip Do not fear the package size!
Note that our Windows installer _includes_ Docker Desktop and this accounts for it's large file size in comparison to our Linux packages.

When going through the installer you can choose to _not_ install Docker Desktop, although we recommend you use the version of Docker Desktop that we ship for compatibility and support reasons!
:::

1.  Make sure you are using **at least** Windows 10 Professional with the latest updates installed.
2.  Download the latest Windows `.exe` installer from [GitHub](https://github.com/lando/lando/releases)
3.  Double-click on `lando.exe`
4.  Go through the setup workflow
5.  Approve various UAC prompts during install

## From source

To install from source you need to first make sure you've manually installed the below dependencies:

* [the latest stable version of docker](https://docs.docker.com/engine/installation/) for your operating system, set to its **factory defaults**.
* [the latest node 14](https://nodejs.org/en/download/)
* [the latest yarn](https://yarnpkg.com/lang/en/docs/install/)
* **(linux only)** [the latest stable docker compose binary](https://github.com/docker/compose/releases) downloaded and placed at `/usr/share/lando/bin` and make executable.

::: tip Or take things to lightspeed
If you are using macOS or a Debian flavored linux distro you can easily install Lando's dev requirements using [hyperdrive](https://github.com/lando/hyperdrive)
:::

Once you've completed the above then do the following:

```bash
# Clone the Lando source
git clone https://github.com/lando/lando.git

# Install its dependencies
cd lando && yarn

# ON WINDOWS:
# Add /path/to/source/bin to PATH
# See: https://www.computerhope.com/issues/ch000549.htm
# Remember to relaunch your shell so the PATH changes take effect
lando.js
# Or invoke directly
node /path/to/source/bin/lando.js

# ON POSIX:
# Set up a symlink
# NOTE: we use lando.dev as a convention but you can name it whatever
# This allows you to run stable lando and source lando side by side
sudo mkdir -p /usr/local/bin
sudo ln -s /absolute/path/to/above/repo/bin/lando.js /usr/local/bin/lando.dev

# Run lando from source
lando.dev
```

