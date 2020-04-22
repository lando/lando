---
description: Lando uses its own, or a configurable, certificate authority to SSL/TLS secure all its local traffic, removing the need of local cert bypass flags or annoying browser warnings.
---

# SSL/TLS

Lando uses its own Certificate Authority to sign the certs for each service and to ensure that these certs are trusted on our [internal Lando network](./networking.md). They should live inside every service at `/certs`.

```bash
/certs
|-- cert.crt
|-- cert.csr
|-- cert.ext
|-- cert.key
|-- cert.pem
```

## Trusting the CA

While Lando will automatically trust this CA internally it is up to you to trust it on your host machine. Doing so will alleviate browser warnings regarding certs we issue.

::: warning You may need to destroy the proxy container and rebuild your app!
If you've tried to trust the certificate but are still seeing browser warnings you may need to remove the proxy with `docker rm -f landoproxyhyperion5000gandalfedition_proxy_1` and then `lando rebuild` your app.
:::

The default Lando CA should be located at `~/.lando/certs/lndo.site.pem`. If you don't see the cert there, try starting up an app as this will generate the CA if its not already there. Note that if you change the Lando `domain` in the [global config](./global.md) you will have differently named certs and you will likely need to trust these new certs and rebuild your apps for them to propagate correctly.

Also note that in accordance with the [restrictions](https://en.wikipedia.org/wiki/Wildcard_certificate#Limitations) on wildcard certs changing the `domain` may result in unexpected behavior depending on how you set it. For example, setting `domain` to a top level domain such as `test` will not work while `local.test` will.

Also note that we produce a duplicate `crt` file that you can use for systems that have stricter rules around how the certs are named. This means that by default you will also end up with a file called `~/.lando/certs/lndo.site.crt` in addition to `~/.lando/certs/lndo.site.pem`.

That all said, once you've located the correct cert you can add or remove it with the relevant commands below.

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

::: warning Firefox maintains its own certificate store!
Firefox users may still see browser warnings after performing the steps above. Firefox maintains its own certificate store and does not, by default, use the operating system's certificate store. To allow Firefox to use the operating system's certificate store, the **security.enterprise_roots.enabled** setting must be set to **true**.

* In Firefox, type `about:config` in the address bar
* If prompted, accept any warnings
* Search for `security.enterprise_roots.enabled`
* Set the value to `true`
:::

<RelatedGuides tag="Security"/>
