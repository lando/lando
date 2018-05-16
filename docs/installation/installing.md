Installing
==========

macOS
-----

#### Install DMG via direct download
1.  Download the latest `.dmg` package from [GitHub](https://github.com/lando/lando/releases)
2.  Mount the DMG by double-clicking it
3.  Double-click on the `LandoInstaller.pkg`
4.  Go through the setup workflow
5.  Enter your username and password when prompted

#### Install using [HomeBrew](https://brew.sh/)

*Please note that the version installed via Homebrew is community-maintained and may not be the latest version as provided by the `.dmg` package from [GitHub](https://github.com/lando/lando/releases).*

1. Ensure homebrew is installed and up-to-date.
2. Add the lando cask: `brew cask install lando`

Windows
-------

1.  Make sure you are using **at least** Windows 10 Professional with the latest updates installed.
2.  Download the latest Windows `.exe` installer from [GitHub](https://github.com/lando/lando/releases)
3.  Double-click on `lando.exe`
4.  Go through the setup workflow
5.  Approve various UAC prompts during install

> #### Warning::YOU MUST HAVE HYPER-V ENABLED
>
> Make sure that [Hyper-V is enabled](https://msdn.microsoft.com/en-us/virtualization/hyperv_on_windows/quick_start/walkthrough_install) or lando will not work!

Linux
-----

1.  Install the [Docker Community Edition](https://docs.docker.com/engine/installation/) for your Linux version. Visit [https://get.docker.com](https://get.docker.com/) for the "quick & easy install" script.**(17.06.1-ce or higher)**
2.  Download the latest `.deb`, `.pacman` or `.rpm` package from [GitHub](https://github.com/lando/lando/releases)
3.  Double-click on the package to launch Software Center
4.  Click the "Install" button and enter your password when prompted

> #### Hint::Install from source for other Linux distros
>
> If your Linux distro does not support our `.deb`, `.pacman` or `.rpm` packages you can [install from source](#from-source)

### Caveats

Because each Linux distribution handles things differently, these considerations may or may not apply to you:

* If your distro uses a `docker` group, make sure your user is a member of it:

  ```
  sudo usermod -aG docker $USER
  ```

  You will need to log out for this change to take effect. Sometimes a reboot is necessary. See https://docs.docker.com/install/linux/linux-postinstall/ for more details.

* If your distro uses SystemD, make sure that both `docker.service` and `docker.socket` daemons are running.

* If you are using Manjaro or another Arch-based distro, you may need to enable the [AUR repository](https://aur.archlinux.org/packages/) for dependencies.

Bleeding Edge
-------------

If you want to roll like a ninja you can install from our development builds or run directly from source. Developments builds are rolled against the latest commit.

### Development Builds

We produce development releases for every commit merged into our `master` branch. **These releases are not officially supported** but we have made them available to intrepid users who want to try the bleeding edge or are interested in trying out a recent bug fix before an official release is rolled.

*   **Windows** - [http://installer.kalabox.io/lando-latest-dev.exe](http://installer.kalabox.io/lando-latest-dev.exe)
*   **Arch** - [http://installer.kalabox.io/lando-latest-dev.pacman](http://installer.kalabox.io/lando-latest-dev.pacman)
*   **Debian** - [http://installer.kalabox.io/lando-latest-dev.deb](http://installer.kalabox.io/lando-latest-dev.deb)
*   **Fedora** - [http://installer.kalabox.io/lando-latest-dev.rpm](http://installer.kalabox.io/lando-latest-dev.rpm)
*   **macOS** - [http://installer.kalabox.io/lando-latest-dev.dmg](http://installer.kalabox.io/lando-latest-dev.dmg)

**NOTE:** Releases can take some time to build after we merge in commits. For that reason you might want to check the time of the last commit and if it is within a few hours you might want to hold off a bit before trying the new latest release.

You can also easily verify that the release you downloaded matches the latest commit. All development releases look something like `v3.0.0-alpha.1-4-g63b0db0`. This means 4 commits after the `v3.0.0-alpha.1` tag and with commit hash `g63b0db0`. You should make sure this commit hash matches or comes before the latest commit.

### From Source

To install from source you need to first make sure you've [installed the latest stable version of docker](https://docs.docker.com/engine/installation/) for your operating system and that it is using the factory defaults. You will also need [node](https://nodejs.org/en/download/) and ideally [yarn](https://yarnpkg.com/lang/en/docs/install/).

On Linux you will also want to [download the latest stable docker compose binary](https://github.com/docker/compose/releases), make it executable and place it into `/usr/share/lando/bin`.

Then do the following:

```bash
# Clone the Lando source
git clone https://github.com/lando/lando.git

# Install its dependencies
cd lando && yarn

# Optionally set up a symlink
sudo mkdir -p /usr/local/bin
sudo ln -s /absolute/path/to/above/repo/bin/lando.js /usr/local/bin/lando.dev

# Run lando
lando.dev
```
