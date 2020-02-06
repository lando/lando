---
description: Learn how to use Lando for offline local development.
date: 2019-11-05
---

# Developing offline

<GuideHeader />

Out of the box Lando uses an actual on-the-internet wildcard domain at `*.lndo.site` to route your domain names back to your localhost to provide convenient proxying. This method is minimally invasive and doesn't require Lando to alter your machine's DNS routing. This has the downside of requiring an internet connection to access your sites.

However, you may want the freedom of hacking away on your site while scaling Everest or just to simply route your projects to a different wildcard domain, like `*.local.dev`, `*.seriously.hanshotfirst` or `*.my.test`. Note that we **DO NOT** recommend you use a _true_ top-level domain such as `*.test`. You can read more about why in our [security](./../config/security.md) documentation.

To enable offline custom domain goodness, we'll use DNSMasq to route traffic to our local system and add a single config line to our global Lando config to direct lando to use that domain for our sites.

That said and before we get started we **highly recommend** you consult both the [proxy](./../config/proxy.md) and [security](./../config/security.md) documentation to get a good handle on what is possible (and not possible) here.

## Mac Specific Instructions

1. Ensure you've installed [Homebrew](https://brew.sh/).
2. Install DNSMasq: `brew install dnsmasq`
3. Follow the instructions in the output of `brew info dnsmasq`
4. Add the following line to your `/usr/local/etc/dnsmasq.conf` file:
```
address=/local.host/127.0.0.1
```
Sub in your favorite domain for 'local.host' here if you want to use something more flashy.

5. Restart DNSMasq: `brew services restart dnsmasq`
6. For macOS to resolve requests from *.local.host to localhost we need to add a resolver:
```
sudo mkdir -p /etc/resolver
sudo nano /etc/resolver/local.host
```
7. Add the following line to the local.host file resolver in /etc/resolver/.
```
nameserver 127.0.0.1
```
8. Reboot macOS to enable the new resolver.
9. Flush your DNS, just to be sure that your browsers use the new dns
directives.
```
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```
10. Open your `~/.lando/config.yml` file and add the following line:
```yaml
domain: local.host
```
Again, allow your creativity to flourish and use whatever domain makes you smile.

11. Power Lando down with `lando poweroff`
12. Start up your favorite Lando app to test it out with `lando start` from within your app's root directory. You should see something like:

```bash
BOOMSHAKALAKA!!!

Your app has started up correctly.
Here are some vitals:

 NAME      bestappever
 LOCATION  /Users/McFly/timemachines/bestappever
 SERVICES  appserver, nginx, database, cache, node

 APPSERVER URLS https://localhost:32791
                http://localhost:32792
                http://bestappever.local.host
                https://bestappever.local.host
```
13. Load it up in the browser and confirm everything is happy and working.

Enjoy your signature domain while you hack away in complete wifi-less splendor.

<GuideFooter />
<Newsletter />
