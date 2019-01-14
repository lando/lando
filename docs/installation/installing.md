Installing
==========



Linux
-----


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
