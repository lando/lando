Developing offline
==================

Out of the box, Lando uses an external server to route pretty domain names back to your localhost to provide convenient proxying. This method is minimally invasive and doesn't require Lando to alter your machine's DNS routing. This has the downside of requiring an internet connection to access your sites.

You may want the freedom of hacking away on your site while scaling Everest or just to simply route your projects to a different top level domain, like `*.dev`, `*.local`, `*.hanshotfirst` or `*.localhost`. Although `*.dev` is not recommended because it is a reserverd TLD by Google.

To enable offline custom TLD goodness, we'll use DNSMasq to route traffic to our local system and add a single config line to our global Lando config to direct lando to use that TLD for our sites.

### Mac Specific Instructions
1. Ensure you've installed [Homebrew](https://brew.sh/).
2. Install DNSMasq: `brew install dnsmasq`
3. Follow the instructions in the output of `brew info dnsmasq`
4. Add the following line to your `/usr/local/etc/dnsmasq.conf` file:
```
address=/localhost/127.0.0.1
```
Sub in your favorite TLD for 'localhost' here if you want to use something more flashy.
5. Restart DNSMasq: `brew services restart dnsmasq`
6. For OS X to resolve requests from *.localhost to localhost we need to add a resolver:
```
sudo mkdir -p /etc/resolver
sudo nano /etc/resolver/localhost
```
7. Add the following line to the localhost file resolver in /etc/resolver/.
```
nameserver 127.0.0.1
```
8. Reboot OS X to enable the new resolver.
9. Flush your DNS, just to be sure that your browsers use the new dns
directives.
```
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```
10. Open your `~/.lando/config.yml` file and add the following line:
```yaml
proxyDomain: localhost
```
Again, allow your creativity to flourish and use whatever TLD makes you smile.
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
                http://bestappever.localhost
                https://bestappever.localhost
```
13. Load it up in the browser and confirm everything is happy and working.

Enjoy your signature top level domain while you hack away in complete wifi-less splendor.
