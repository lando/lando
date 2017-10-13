Running Lando behind a Proxy
============================

Users, particularly Windows users, may need to provide some additional networking configuration to their apps if they are sitting behind a proxy. A tell tale sign that you require this sort of configuration is connection issues. Here is an example of what such an issue looks like...

```bash
Creating test_appserver_1 ... done
% Total % Received % Xferd Average Speed Time Time Time Current
Dload Upload Total Spent Left Speed
0 0 0 0 0 0 0 0 --:--:-- 0:00:20 --:--:-- 0
curl: (7) Failed to connect to raw.githubusercontent.com port 443: Connection refused
error: Error: 7
```

If you think you may be in this situation there is a Lando driven mechanism you can use to help alleviate the issue as well as various Docker level mechanisms you can read about [below](./proxy.md#additional-reading).

Lando Environment File
----------------------

Lando will read in any properly formatted `.env` file that you have in your app's root directory and inject those variables into every container/service you have running. This allows you to set faux-global proxy settings for your app. Below is an example of the things you would want to set in your `.env` file. You do not need to define both although that is preferred.

```bash
HTTP_PROXY=http://my_proxy:80
HTTPS_PROXY=https://my_proxy:443
```

It is also a good practice to `.gitinore` the `.env` file so you can set `proxy` settings that are relevant to you without forcing those settings on other users and environments.

[Click here](./../config.md#environment-file) to read more about the `.env` file.

Potential Docker driven solutions
---------------------------------

* https://docs.docker.com/engine/admin/systemd/
* https://blog.codeship.com/using-docker-behind-a-proxy/
* https://crondev.com/running-docker-behind-proxy/
