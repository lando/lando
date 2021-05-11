---
description: Lando uses its own, or a configurable, certificate authority to SSL/TLS secure all its local traffic, removing the need of local cert bypass flags or annoying browser warnings.
---

# Security

Lando tries to find the fine line between good security and good user experience. **SPOILER ALERT:** It ain't easy.

The things we do by default and how you can modify them to your needs are shown below:

[[toc]]

## Exposure

As of `3.0.0-rrc.5`, Lando will bind all exposed services to `127.0.0.1` for security reasons. This means your services are *only* available to your machine. You can alter this behavior in one of two ways.

### 1. Changing the bind address

You can modify the Lando [global config](./global.md) to change the default bind address:

```yaml
# Bind my exposes services to all intefaces
bindAddress: "0.0.0.0"
```

```yaml
# Bind my exposes services to a single IP
bindAddress: "10.0.1.1"
```

You will then need to `lando rebuild` your service for the changes to take effect.

### 2. Overridding a particular service

If you [override](./services.md#overrides) a particular service and specify the external IP then Lando will honor that choice and not force override with the `bindAddress`.

```yaml
# This will find a random port on 0.0.0.0
# and route it to port 80 on your appsrver service
services:
  appserver:
    overrides:
      ports:
        - "0.0.0.0::80"
```

Note that there are security implications to both of the above and it is not recommended you do this.

## Certificates

Lando uses its own Certificate Authority to sign the certs for each service and to ensure that these certs are trusted on our [internal Lando network](./networking.md). They should live inside every service at `/certs`.

```bash
/certs
|-- cert.crt
|-- cert.csr
|-- cert.ext
|-- cert.key
|-- cert.pem
```

However, for reasons detailed in [this blog post](https://httptoolkit.tech/blog/debugging-https-without-global-root-ca-certs), we do not trust this CA on your system automatically. Instead, we require you to opt-in manually as a security precaution.

**This means that by default you will receive browser warnings** when accessing `https` proxy routes.

## Trusting the CA

While Lando will automatically trust this CA internally, it is up to you to trust it on your host machine. Doing so will alleviate browser warnings regarding certs we issue.

::: warning You may need to destroy the proxy container and rebuild your app!
If you've tried to trust the certificate but are still seeing browser warnings you may need to remove the proxy with `docker rm -f landoproxyhyperion5000gandalfedition_proxy_1` and then `lando rebuild` your app.
:::

The default Lando CA should be located at `~/.lando/certs/lndo.site.pem`. If you don't see the cert there, try starting up an app as this will generate the CA if its not already there. Note that if you change the Lando `domain` in the [global config](./global.md), you will have differently named certs and you will likely need to trust these new certs and rebuild your apps for them to propagate correctly.

Also note that in accordance with the [restrictions](https://en.wikipedia.org/wiki/Wildcard_certificate#Limitations) on wildcard certs, changing the `domain` may result in unexpected behavior depending on how you set it. For example, setting `domain` to a top level domain such as `test` will not work while `local.test` will.

Also note that we produce a duplicate `crt` file that you can use for systems that have stricter rules around how the certs are named. This means that by default, you will also end up with a file called `~/.lando/certs/lndo.site.crt` in addition to `~/.lando/certs/lndo.site.pem`.

That all said, once you've located the correct cert, you can add or remove it with the relevant commands below.

### macOS (see Firefox instructions below)

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

### Ubuntu or MacOS with Firefox

Import the `~/.lando/certs/lndo.site.pem` CA certificate in Firefox by going to `about:preferences#privacy` > `View Certificates` > `Authorities` > `Import`, enabling **Trust this CA to identify websites.**.

### Ubuntu with Chrome

On the Authorities tab at chrome://settings/certificates, import `~/.lando/certs/lndo.site.pem or /usr/local/share/ca-certificates/lndo.site.crt`

### Arch

```bash
# Add the Lando CA
sudo trust anchor ~/.lando/certs/lndo.site.pem
sudo trust anchor ~/.lando/certs/lndo.site.crt

# Remove Lando CA
sudo trust anchor --remove ~/.lando/certs/lndo.site.pem
sudo trust anchor --remove ~/.lando/certs/lndo.site.crt
```

::: warning Firefox maintains its own certificate store!
Firefox users may still see browser warnings after performing the steps above. Firefox maintains its own certificate store and does not, by default, use the operating system's certificate store. To allow Firefox to use the operating system's certificate store, the **security.enterprise_roots.enabled** setting must be set to **true**.

* In Firefox, type `about:config` in the address bar
* If prompted, accept any warnings
* Search for `security.enterprise_roots.enabled`
* Set the value to `true`
:::

## SSH Keys

We also will inject SSH keys into each service but this is [highly configurable](./ssh.md).

<RelatedGuides tag="Security"/>
