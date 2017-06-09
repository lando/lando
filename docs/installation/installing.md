Installing
==========

macOS
-----

1. Download the latest `.dmg` package from [GitHub](https://github.com/kalabox/lando/releases)
2. Mount the DMG by double-clicking it
3. Double-click on the `LandoInstaller.pkg`
4. Go through the setup workflow
5. Enter your username and password when prompted
6. [Spin up your first Lando app](./../tutorials/first-app.md)

Windows
-------

1. Download the latest Windows `.exe` installer from [GitHub](https://github.com/kalabox/lando/releases)
2. Double-click on `lando.exe`
3. Go through the setup workflow
4. Approve various UAC prompts during install
5. After installation is finished make sure you [set up Shared Drives](https://docs.docker.com/docker-for-windows/#shared-drives)
6. [Spin up your first Lando app](./../tutorials/first-app.md)

> #### Warning::YOU MUST SET UP SHARED DRIVES AND HAVE HYPER-V ENABLED
>
> After installation is finished make sure you [set up Shared Drives](https://docs.docker.com/docker-for-windows/#/shared-drives) and if you have further problems, check to see if [Hyper-V is enabled](https://msdn.microsoft.com/en-us/virtualization/hyperv_on_windows/quick_start/walkthrough_install).

Linux
-----

1. Install the [Docker Community Edition](https://docs.docker.com/engine/installation/) for your Linux version. (17.03.1-ce or higher)
2. Download the latest `.deb` or `.rpm` package from [GitHub](https://github.com/kalabox/lando/releases)
3. Double-click on the package to launch Software Center
4. Click the "Install" button and enter your password when prompted
5. [Spin up your first Lando app](./../tutorials/first-app.md)

> #### Hint::Install from source for other Linux distros
>
> If your Linux distro does not support our `.deb` or `.rpm` packages you can [install from source](#from-source)


Bleeding Edge
-------------

If you want to roll like a ninja you can install from our development builds or run directly from source. Developments builds are rolled against the latest commit.

### Development Builds

We produce development releases for every commit merged into our `master` branch. **These releases are not officially supported** but we have made them available to intrepid users who want to try the bleeding edge or are interested in trying out a recent bug fix before
an official release is rolled.

  * **Windows** - [http://installer.kalabox.io/lando-latest-dev.exe](http://installer.kalabox.io/lando-latest-dev.exe)
  * **Debian** - [http://installer.kalabox.io/lando-latest-dev.deb](http://installer.kalabox.io/lando-latest-dev.deb)
  * **Fedora** - [http://installer.kalabox.io/lando-latest-dev.rpm](http://installer.kalabox.io/lando-latest-dev.rpm)
  * **macOS** - [http://installer.kalabox.io/lando-latest-dev.dmg](http://installer.kalabox.io/lando-latest-dev.dmg)

**NOTE:** Releases can take some time to build after we merge in commits. For that reason you might want to check the time of the last commit and if it is within a few hours you might want to hold off a bit before trying the new latest release.

You can also easily verify that the release you downloaded matches the latest commit. All development releases look something like `v3.0.0-alpha.1-4-g63b0db0`. This means 4 commits after the `v3.0.0-alpha.1` tag and with commit hash `g63b0db0`. You should make sure this commit hash matches or comes before the latest commit.

### From Source

To install from source you need to first make sure you've [installed the latest stable version of docker](https://docs.docker.com/engine/installation/) for your operating system and that it is using the factory defaults.

On Linux you will also want to [download the latest stable docker compose binary](https://github.com/docker/compose/releases), make it executable and place it into `/usr/share/lando/bin`.

Then do the following

```bash
# Clone the Lando source
git clone https://github.com/kalabox/lando.git

# Install its dependencies
cd lando && npm install

# Optionally set up a symlink
sudo mkdir -p /usr/local/bin
sudo ln -s /absolute/path/to/above/repo/bin/lando.js /usr/local/bin/lando.dev

# Run lando
lando.dev
```
