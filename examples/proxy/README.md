Proxy Example
=============

This example exists primarily to test the following documentation:

* [Proxy](http://docs.devwithlando.io/config/proxy.html)

See the [Landofiles](http://docs.devwithlando.io/config/lando.html) in this directory for the exact magicks.

Start up tests
--------------

```bash
# Should start successfully
lando poweroff
lando start
```

Verification commands
---------------------

Run the following commands to verify things work as expected

```bash
# Should start up the proxy container
docker ps | grep landoproxyhyperion5000gandalfedition

# Should return 404 when no route is found
curl -s -o /dev/null -I -w "%{http_code}" idonotexist.lndo.site | grep 404

# Should return 200 for all proxied domains
curl -s -o /dev/null -I -w "%{http_code}" http://lando-proxy.lndo.site | grep 200
curl -s -o /dev/null -I -w "%{http_code}" http://sub.lando-proxy.lndo.site | grep 200
curl -s -o /dev/null -I -w "%{http_code}" http://another-way-to-eighty.lndo.site | grep 200

# Should also work over https
curl -s -o /dev/null -Ik -w "%{http_code}" https://lando-proxy.lndo.site | grep 200
curl -s -o /dev/null -Ik -w "%{http_code}" https://sub.lando-proxy.lndo.site | grep 200
curl -s -o /dev/null -Ik -w "%{http_code}" https://another-way-to-eighty.lndo.site | grep 200

# Should route to a different port if specified
curl -s -o /dev/null -I -w "%{http_code}" http://another-way-to-eighty.lndo.site | grep 200

# Should handle wildcard entries
curl -s -o /dev/null -I -w "%{http_code}" http://thiscouldbeanything-lando-proxy.lndo.site | grep 200
curl -s -o /dev/null -I -w "%{http_code}" http://wild.socouldthis.lando-proxy.lndo.site | grep 200
```

Destroy tests
-------------

```bash
# Should destroy successfully
lando destroy -y
lando poweroff
```
