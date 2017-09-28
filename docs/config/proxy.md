Proxy
=====

You can edit `.lando.yml` to get nice human readable names for your services such as `https://myapp.lndo.site`. Lando accomplishes this with an actual *ON THE INTERNET* wildcard DNS entry that points all `lndo.site` subdomains to `localhost/127.0.0.1`. This means that if you lose your internet connection, you will not be able to visit your app at these addresses. However, you can [take steps](#working-offline-or-using-custom-domains) to work around this restriction or use your own [custom domain](#configuration) and handle the DNS yourself with `dnsmasq` or other solution.

There is also a [known issue](./../issues/dns-rebind.md) called DNS rebinding protection which blocks this functionality.

> #### Info::Proxying is not required
>
> As long as your containers or services expose ports `80` and/or `443`, Lando will smartly allocate `localhost` addresses for them. Proxying is meant to augment how your app is accessed with additional domains.

Example
-------

{% codesnippet "./../examples/trivial-proxy/.lando.yml" %}{% endcodesnippet %}

> #### Warning::Custom domains need to be added to your `hosts` file.
>
> If your custom domain does not end in `lndo.site`, then you are going to need to add it to your `hosts` file so that it points to `127.0.0.1`.

You will need to restart your app with `lando restart` to apply the changes. You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/trivial-proxy). You can also use our [legacy proxy conig format](https://github.com/lando/lando/tree/master/examples/trivial-proxy-legacy).

Configuration
-------------

By default, proxying is turned on and will try to bind to ports `80` and `443`. If these ports are taken, Lando will attempt to bind to alternate ports. These things are all configurable by editing the [Lando global configuration](./config.yml).

```yml
proxy: ON
proxyDomain: lndo.site
proxyHttpPort: 80
proxyHttpsPort: 443
proxyDash: 58086
proxyHttpFallbacks:
  - 8000
  - 8080
  - 8888
  - 8008
proxyHttpsFallbacks:
  - 444
  - 4433
  - 4444
  - 4443
```

You will need to do a `lando poweroff` to apply these changes. **You also should not change the `proxyDomain` unless you know what you are doing!**

Working Offline or Using Custom Domains
---------------------------------------

If you are working offline and/or have added custom domains and want to get them to work, you will need to edit your `hosts` file. Generally, this file is located at `/etc/hosts` on Linux and macOS and `C:\Windows\System32\Drivers\etc\host` on Windows. You will need administrative privileges to edit this file.

Here is a [good read](http://www.howtogeek.com/howto/27350/beginner-geek-how-to-edit-your-hosts-file/) if you are not very familiar with the `hosts` file, how to edit it and how it works.

Here is an example:

```bash
# Get my `lndo.site` domain to work offline
127.0.0.1 myapp.lndo.site

# Get my custom domain to work
127.0.0.1 billy.dee.williams
```

Accessing Lando from Other Devices on Your Local Network
--------------------------------------------------------

You may want to use another device (e.g., a smartphone or tablet) to test your Lando app.  You can access your lando app easily from another device as follows.

First, get the IP address of the machine running lando.

**Windows**

Open a command prompt and enter the command `ipconfig /all` and look for the "IPv4 Address" for the network adapter you use to connect to the Internet.  Make sure NOT to use the IP address of the Docker network adapter.  It should be a number like `192.168.0.123`.

**macOS**

Open System Preferences, Network, and then choose the network adapter you are using to connect to the Internet (Ethernet or Wireless).  The local IP address will then be displayed.

Next, get the port of your lando app.  You can do this by running `lando info` from a command prompt and looking for the URL to your site, which should look something like this: `http://localhost:33333`.  In this case, `33333` is the port number.

You can now visit your lando app from other devices by going to `IP address: Port number`.  (Example: `http://192.168.0.123:33333`)

Checking Proxy Routes
---------------------

Check out `localhost:58087` for a GUI display of your current proxy routing. If this does not work run `lando config` and use the value of `proxyDash` for the port.
