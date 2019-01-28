Linux
=====

1.  Install the [Docker Community Edition](https://docs.docker.com/engine/installation/) for your Linux version. Visit [https://get.docker.com](https://get.docker.com/) for the "quick & easy install" script. **(at least version 17.06.1-ce)**
2.  Download the latest `.deb`, `.pacman` or `.rpm` package from [GitHub](https://github.com/lando/lando/releases)
3.  Double-click on the package to launch your distro's "Software Center" or install it with your distros package manager eg `apt`.
4.  Click the "Install" button if using GUI and enter your password when prompted

> #### Hint::Install from source for other Linux distros
>
> If your Linux distro does not support our `.deb`, `.pacman` or `.rpm` packages you can [install from source](./source.md)

Caveats
-------

### Arch

Lando is also available on the AUR as [lando-git](https://aur.archlinux.org/packages/lando-git/), meaning it's built directly from source.

### Additional Setup

Because each Linux distribution handles things differently, these considerations may or may not apply to you:

* If your distro uses a `docker` group, make sure your user is a member of it:

  ```
  sudo usermod -aG docker $USER
  ```

  You will need to log out for this change to take effect. Sometimes a reboot is necessary. See https://docs.docker.com/install/linux/linux-postinstall/ for more details.

* If your distro uses SystemD, make sure that both `docker.service` and `docker.socket` daemons are running.

* If you are using Manjaro or another Arch-based distro, you may need to enable the [AUR repository](https://aur.archlinux.org/packages/) for dependencies.
