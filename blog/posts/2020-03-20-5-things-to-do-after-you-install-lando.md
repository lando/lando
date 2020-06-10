---
title: 3 Things to do after you install Lando
metaTitle: 3 Things to do after you install Lando | Lando
description: Now that you've got Lando rolling, here are 3 post installation steps to take things to the next level
summary: Now that you've got Lando rolling, here are 3 post installation steps to take things to the next level
date: 2020-03-20
original:

author: Atilla Manyon
pic: https://s.gravatar.com/avatar/b94fb6501cf666caf2b8f47d4e4e3b1c
link: https://github.com/smutlord
location: Undisclosed

tags:
- lando

feed:
  enable: true
  author:
    - name: Atilla Manyon
      email: alliance@lando.dev
      link: https://github.com/smutlord
  contributor:
    - name: Atilla Manyon
      email: alliance@lando.dev
      link: https://github.com/smutlord
---

## 1. Allowlist the Lando CA for no SSL warnings

Lando uses its own Certificate Authority to sign the certs for each service and to ensure that these certs are trusted on our internal Lando network. However, while Lando will automatically trust this CA internally it is up to you to trust it on your host machine. Doing so will alleviate browser warnings regarding the certs we issue.

**These commands all assume that you have not customized the Lando global config.**

### macOS

```bash
# Add the Lando CA
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ~/.lando/certs/lndo.site.pem

# Remove Lando CA
sudo security delete-certificate -c "Lando Local CA"
```

### Windows

```bash
# Add the Lando CA
certutil -addstore -f "ROOT" C:\Users\ME\.lando\certs\lndo.site.pem

# Remove Lando CA
certutil -delstore "ROOT" serial-number-hex
```

### Debian

```bash
# Add the Lando CA
sudo cp -r ~/.lando/certs/lndo.site.pem /usr/local/share/ca-certificates/lndo.site.pem
sudo cp -r ~/.lando/certs/lndo.site.crt /usr/local/share/ca-certificates/lndo.site.crt
sudo update-ca-certificates

# Remove Lando CA
sudo rm -f /usr/local/share/ca-certificates/lndo.site.pem
sudo rm -f /usr/local/share/ca-certificates/lndo.site.crt
sudo update-ca-certificates --fresh
```

For Firefox users may still see browser warnings after performing the steps above. Firefox maintains its own certificate store and does not, by default, use the operating system's certificate store. To allow Firefox to use the operating system's certificate store, the security.enterprise_roots.enabled setting must be set to true.

## 2. Optimize Docker Desktop's performance

If you are using Lando on macOS or Windows then you are using Docker Desktop to power Lando. By default Docker Desktop only allocates a fraction of your systems resources for containerized activity.

However you can bump these limits by navigating to `Settings -> Resources`.

::: thumbnail
![docker-desktop-dash](https://docs.docker.com/docker-for-mac/images/menu/prefs-advanced.png "Docker Desktop")
:::

I usually bump the CPU's to 4, the RAM to 6GB, the swap to 4GB and the disk to 100GB+. That said you will need to select settings that make sense for your system. A good rule of thumb is to allocate somewhere between 25%-50% of the _TOTAL_ amount of the given system resource.

## 3. Join the Slack support channel

Lando has a great and active community of developers helping each other out. Nowhere is this more apparent than on the Lando slack channel which you can join [here](https://launchpass.com/devwithlando).

