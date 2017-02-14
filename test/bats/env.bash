#!/usr/bin/env bats

#
# Sudo helpers
#
# You will want to set this so it matches your environment
#
#   export LANDO_SUDO_PASSWORD=MYPASSWORD
#
: ${LANDO_SUDO_PASSWORD=lando}

# Local stuff
if [ ! $TRAVIS ]; then
  : ${TRAVIS_BUILD_DIR:=$(pwd)}
  : ${TRAVIS_COMMIT:=LOCAL}
fi

# LANDO binary
: ${LANDO:=$(which lando.dev || which lando || echo "/usr/local/bin/lando")}
: ${LANDO_APP_DIR:=$HOME/lando_testing/apps}

#
# Gather information about the system and state

# Let's first try to get our system
# Some OS do not implement /etc/os-release yet so lets have some
# backups in place.
if [ -f /etc/os-release ]; then
  source /etc/os-release
  : ${FLAVOR:=$ID_LIKE}
  : ${FLAVOR:=$ID}
elif [ -f /etc/arch-release ]; then
  FLAVOR="arch"
elif [ -f /etc/gentoo-release ]; then
  FLAVOR="gentoo"
elif [ -f /etc/fedora-release ]; then
  FLAVOR="fedora"
elif [ -f /etc/redhat-release ]; then
  FLAVOR="redhat"
elif [ -f /etc/debian_version ]; then
  FLAVOR="debian"
elif [[ $(uname) == 'Darwin' ]]; then
  FLAVOR="darwin"
else
  FLAVOR="whoknows"
fi

# Do stuff on each distro
case $FLAVOR in
  debian)

    # Get some build envvars
    source scripts/env.sh deb

    # Unix type
    : ${UNIX_TYPE:=linux}
    : ${LANDO_IP:=10.13.37.100}

    # Dep handling
    : ${LINUX_DEP_INSTALL:=apt-get -y --force-yes install}
    : ${LINUX_DEP_REMOVE:=apt-get -y --purge remove}

    # Pkg handling
    : ${LINUX_PKG_INSTALL:=dpkg -i}
    : ${LINUX_PKG_REMOVE:=dpkg -r}

    # Pkg name
    : ${LANDO_PKG:=lando.deb}

    # Docker bin
    : ${DOCKER:="/usr/share/lando/bin/docker"}
    export DOCKER_HOST=tcp://10.13.37.100:2375

    ;;
  fedora)

    # Get some build envvars
    source scripts/env.sh rpm

    # Unix type
    : ${UNIX_TYPE:=linux}
    : ${LANDO_IP:=10.13.37.100}

    # Dep handling
    : ${LINUX_DEP_INSTALL:=dnf -y install}
    : ${LINUX_DEP_REMOVE:=dnf -y remove}

    # Pkg handling
    : ${LINUX_PKG_INSTALL:=rpm -ivh}
    : ${LINUX_PKG_REMOVE:=rpm -ev}

    # Pkg name
    : ${LANDO_PKG:=lando.rpm}

    # Docker bin
    : ${DOCKER:="/usr/share/lando/bin/docker"}
    export DOCKER_HOST=tcp://10.13.37.100:2375

    ;;
  darwin)

    # Unix type
    : ${UNIX_TYPE:=darwin}
    : ${LANDO_IP:=127.0.0.1}

    # Path to the uninstall script
    : ${LANDO_UNINSTALL:=$(pwd)/installer/osx/uninstall.sh}

    # Pkg name
    : ${LANDO_PKG:=lando.dmg}

    # Docker bin
    : ${DOCKER:="/Applications/Docker.app/Contents/Resources/bin/docker"}

    ;;
  *)
    echo "Platform not supported!"
    ;;
esac
