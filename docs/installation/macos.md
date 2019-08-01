macOS
=====

> #### Hint::Do not fear the package size!
>
> Note that our macOS installer _includes_ Docker Desktop and this accounts for it's large file size in comparison to our Linux packages. When going through the installer you can choose to _not_ install Docker Desktop, although we recommend you use the version of Docker Desktop that we ship for compatibility and support reasons!

Install DMG via direct download
-------------------------------

1.  Download the latest `.dmg` package from [GitHub](https://github.com/lando/lando/releases)
2.  Mount the DMG by double-clicking it
3.  Double-click on the `LandoInstaller.pkg`
4.  Go through the setup workflow
5.  Enter your username and password when prompted

Prefer video tutorials?
{% youtube %}
	https://youtu.be/W8qIutOAe-0
{% endyoutube %}

Install via [HomeBrew](https://brew.sh/)
----------------------------------------

*Please note that the version installed via Homebrew is community-maintained and may not be the latest version as provided by the `.dmg` package from [GitHub](https://github.com/lando/lando/releases).*

1. Ensure homebrew is installed and up-to-date.
2. Add the lando cask: `brew cask install lando`
