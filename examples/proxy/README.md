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
curl -s -o /dev/null -I -w "%{http_code}" http://web3.lndo.site | grep 200
curl -s -o /dev/null -I -w "%{http_code}" http://lando-proxy.lndo.site | grep 200
curl -s -o /dev/null -I -w "%{http_code}" http://sub.lando-proxy.lndo.site | grep 200
curl -s -o /dev/null -I -w "%{http_code}" http://another-way-to-eighty.lndo.site | grep 200

# Should also work over https if ssl is true and we have certs
curl -s -o /dev/null -Ik -w "%{http_code}" https://web3.lndo.site | grep 200
lando info -s web3 | grep hasCerts | grep true

# Should route to a different port if specified
curl -s -o /dev/null -I -w "%{http_code}" http://another-way-to-eighty.lndo.site | grep 200
curl -s -o /dev/null -I -w "%{http_code}" http://web3.lndo.site | grep 200
curl -s -o /dev/null -I -w "%{http_code}" http://lets.combine.really.lndo.site/everything/for-real | grep 200
curl -s -o /dev/null -I -w "%{http_code}" http://lets.combine.things.lndo.site/everything/for-real | grep 200

# Should handle wildcard entries
curl -s -o /dev/null -I -w "%{http_code}" http://thiscouldbeanything-lando-proxy.lndo.site | grep 200
curl -s -o /dev/null -I -w "%{http_code}" http://wild.socouldthis.lando-proxy.lndo.site | grep 200

# Should handle object proxy format
curl -s -o /dev/null -I -w "%{http_code}" http://web5.lndo.site | grep 200
curl -s -o /dev/null -I -w "%{http_code}" http://object-format.lndo.site | grep 200
curl -s -o /dev/null -I -w "%{http_code}" http://object-format.lndo.site/test | grep 200

# Should handle sites in subdirectories
curl -s -o /dev/null -I -w "%{http_code}" http://lando-proxy.lndo.site/api | grep 200
curl -s -o /dev/null -I -w "%{http_code}" http://lets.see.what.happens.in.a.lndo.site/subdir | grep 200
curl -s -o /dev/null -I -w "%{http_code}" http://or.in.a.deeper.lndo.site/subdirectory/tree/ | grep 200
curl -s -o /dev/null -I -w "%{http_code}" http://lets.combine.really.lndo.site/everything/for-real | grep 200

# Should load in custom middleware if specificed
curl http://object-format.lndo.site | grep X-Lando-Test | grep on
curl -k https://object-format.lndo.site | grep X-Lando-Test | grep on
curl -k https://object-format.lndo.site | grep X-Lando-Test-Ssl | grep on

# Should only load secure middleware for https
curl http://object-format.lndo.site | grep X-Lando-Test-Ssl || echo $? | grep 1
curl -k https://object-format.lndo.site | grep X-Lando-Test-Ssl | grep on

# Should generate a default certs config file and put it in the right place
docker exec landoproxyhyperion5000gandalfedition_proxy_1 cat /proxy_config/default-certs.yaml | grep certFile | grep /certs/cert.crt
docker exec landoproxyhyperion5000gandalfedition_proxy_1 cat /proxy_config/default-certs.yaml | grep keyFile | grep /certs/cert.key

# Should generate proxy cert files and move them into the right location as needed
docker exec landoproxy_web3_1 cat /proxy_config/web3.landoproxy.yaml| grep certFile | grep "/lando/certs/web3.landoproxy.crt"
docker exec landoproxy_web3_1 cat /proxy_config/web3.landoproxy.yaml| grep keyFile | grep "/lando/certs/web3.landoproxy.key"
```

Destroy tests
-------------

```bash
# Should destroy successfully
lando destroy -y
lando poweroff
```
