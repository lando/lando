From Source
===========

To install from source you need to first make sure you've [installed the latest stable version of docker](https://docs.docker.com/engine/installation/) for your operating system and that it is using the factory defaults. You will also need...

* [the latest node 10](https://nodejs.org/en/download/)
* [the latest yarn](https://yarnpkg.com/lang/en/docs/install/)

On Linux you will also want to [download the latest stable docker compose binary](https://github.com/docker/compose/releases), make it executable and place it into `/usr/share/lando/bin`.

> #### Hint::Or take things to lightspeed
>
> If you are using macOS or a Debian flavored linux distro you can easily install Lando's dev requirements using [hyperdrive](https://github.com/lando/hyperdrive)


Then do the following:

```bash
# Clone the Lando source
git clone https://github.com/lando/lando.git

# Install its dependencies
cd lando && yarn

# Optionally set up a symlink
sudo mkdir -p /usr/local/bin
sudo ln -s /absolute/path/to/above/repo/bin/lando.js /usr/local/bin/lando.dev

# Run lando from source
lando.dev
```
