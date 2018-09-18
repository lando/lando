SSL/TLS
=======

Lando uses its own Certificate Authority to sign the certs for each service and to ensure that these certs are trusted on our internal Lando network. They should live inside every service at `/certs`.

```bash
/certs
|-- cert.crt
|-- cert.csr
|-- cert.ext
|-- cert.key
|-- cert.pem
```

Trusting the CA
---------------

You can also trust this CA on your host machine to alleviate browser warnings.

> #### Warning::You may need to destroy the proxy container and rebuild your app
>
> If you've tried to trust the certificate but are still seeing browser warnings you may need to remove the proxy with
> `docker rm -f landoproxyhyperion5000gandalfedition_proxy_1` and then `lando rebuild` your app.

The default Lando CA should be located at `~/.lando/certs/lndo.site.pem`. If you don't see the cert there, try starting up an app. This will generate the CA if its not already there. Also note that if you change the Lando `proxyDomain` you will have differently named certs and you will likely need to trust these new certs and rebuild your apps for them to propagate.

Once it is you can add or remove it with the relevant commands below.

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
sudo update-ca-certificates

# Remove Lando CA
sudo rm -f /usr/local/share/ca-certificates/lndo.site.pem
sudo update-ca-certificates --fresh
```
