Networking
==========

Lando services should be able to communicate with other services within their own app but also services from other apps. You can access a service within your app using the service name eg `nginx` or `database` or a service in another app using the `<service>.<app>.internal` convention eg `redis.myapp.internal`. See `lando info` for the hostnames you can use for each services.

You also can use your `*.lndo.site` addresses to communicate between different services.

> #### Warning::Cross app service communication requires all apps be on
>
> If you want a service in App A to talk to a service in App B then you need to make sure you've started up both apps!

TLS
---

Lando uses its own Certificate Authority to sign the certs for each service and to ensure that these certs are "trusted". You can also trust this CA on your host machine to alleviate browser warnings.

> #### Warning::You may need to destroy the proxy container and rebuild your app
>
> If you've tried to trust the certificate but are still seeing browser warnings you may need to remove the proxy with
> `docker rm -f landoproxyhyperion5000gandalfedition_proxy_1` and then `lando rebuild` your app.

The Lando CA should be located at `~/.lando/certs/lando.pem`. If you don't see the cert there, try starting up an app. This will generate the CA if its not already there. Once it is you can add or remove it with the relevant commands below.

### macOS

```bash
# Add the Lando CA
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ~/.lando/certs/lando.pem

# Remove Lando CA
sudo security delete-certificate -c "Lando Local CA"
```

### Windows

```bash
# Add the Lando CA
certutil -addstore -f "ROOT" C:\Users\ME\.lando\certs\lando.pem

# Remove Lando CA
certutil -delstore "ROOT" serial-number-hex
```

### Debian

```bash
# Add the Lando CA
sudo cp -r ~/.lando/certs/lando.pem /usr/local/share/ca-certificates/lando.pem
sudo update-ca-certificates

# Remove Lando CA
sudo rm -f /usr/local/share/ca-certificates/lando.pem
sudo update-ca-certificates --fresh
```
