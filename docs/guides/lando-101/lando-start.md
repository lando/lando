---
title: Lando Start
metaTitle: Lando Start | Lando
description: Start a Lando app and some vocabulary to help us talk about Lando.
summary: Lando start command and some vocabulary to help us understand the Lando ecosystem.
date: 2020-07-27T14:38:22.169Z
original: 
repo: 

author:
  name: Team Lando
  pic: https://gravatar.com/avatar/c335f31e62b453f747f39a84240b3bbd
  link: https://twitter.com/devwithlando

feed:
  enable: true
  author:
    - name: Team Lando
      email: alliance@lando.dev
      link: https://twitter.com/devwithlando
  contributor:
    - name: Team Lando
      email: alliance@lando.dev
      link: https://twitter.com/devwithlando
---

# Lando Start

<GuideHeader test="https://github.com/lando/lando/blob/master/examples/lando-101/README.md" name="Team Lando" pic="https://gravatar.com/avatar/c335f31e62b453f747f39a84240b3bbd" link="https://twitter.com/devwithlando" />
<YouTube url="" />

This lesson is primarily about vocabulary to help us understand the Lando ecosystem. A `recipe` in Lando is a pre-configured start state for an application. Lando comes [with more than 12 recipes](/config/recipes.html) out of the box. In the Lando 101 course we are using the [LAMP](/config/lamp.html#getting-started) recipe. This tells Lando that we'll need an application container with Apache and PHP and a MySQL container.

So, if we `lando start` our `Lando 101` app we'll see those corresponding containers. Here is some of the output from `lando start`:

```bash
Scanning to determine which services are ready... Please standby...

   ___                      __        __        __     __        ______
  / _ )___  ___  __ _  ___ / /  ___ _/ /_____ _/ /__ _/ /_____ _/ / / /
 / _  / _ \/ _ \/  ' \(_-</ _ \/ _ `/  '_/ _ `/ / _ `/  '_/ _ `/_/_/_/ 
/____/\___/\___/_/_/_/___/_//_/\_,_/_/\_\\_,_/_/\_,_/_/\_\\_,_(_|_|_)  
                                                                       

Your app has started up correctly.
Here are some vitals:

 NAME            lando-101                                                                     
 LOCATION        /home/gff/code/lando-ops/guides-example-code/introduction-to-lando/lando-init 
 SERVICES        appserver, database                                                           
 APPSERVER URLS  https://localhost:32952                                                       
                 http://localhost:32953                                                        
                 http://lando-101.lndo.site/                                                   
                 https://lando-101.lndo.site/                                                  
```

And if you run the docker command: `docker ps` you can see the containers for the Lando 101 app:

```bash
gff ~/code/lando-ops/guides-example-code/introduction-to-lando/lando-init 
() └─ ∴ docker ps
CONTAINER ID        IMAGE                                COMMAND                  CREATED             STATUS              PORTS                                                                     NAMES
c92d36534d66        devwithlando/php:7.3-apache-2        "/lando-entrypoint.s…"   25 seconds ago      Up 23 seconds       127.0.0.1:32953->80/tcp, 127.0.0.1:32952->443/tcp                         lando101_appserver_1
a5d7060a15be        bitnami/mysql:5.7.29-debian-10-r51   "/lando-entrypoint.s…"   25 seconds ago      Up 23 seconds       127.0.0.1:32951->3306/tcp                                                 lando101_database_1
7f64e8add1fd        traefik:2.2.0                        "/lando-entrypoint.s…"   30 hours ago        Up 25 seconds       127.0.0.1:80->80/tcp, 127.0.0.1:443->443/tcp, 127.0.0.1:32950->8080/tcp   landoproxyhyperion5000gandalfedition_proxy_1

```

So you can see that Lando has started up `lando101_appserver_1`, `lando101_database_1`, and `landoproxyhyperion5000gandalfedition_proxy_1` containers. Behind the scenes Lando is managing the containers, persistent storage, and the networking for the containers to communication with each other. We don't need to worry about that Lando handles it for us. If later we want to take a deep dive you can see how Lando leverages docker-compose to get that all done for us, but for now just know Lando takes care of the right configurations for the recipe we choose.

<GuideFooter test="" original="" repo=""/>
<Newsletter />
