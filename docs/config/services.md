Services
========

Lando provides a way to easily specify the services and tooling your app needs via `.lando.yml`. You can use services to replace the loading of Docker compose files, although you can use both.

> #### Info::Docker compose files are loaded first
>
> If you want to load Docker compose files **and** use services, you should note that compose files are loaded first. This means that depending on how you name things, your services could override things set in your compose files.

Supported Services
------------------

The following services are currently supported. Please check out each one to learn how to use them.

*   ####[apache](./../services/apache.md)
*   ####[compose](./../services/compose.md)
*   ####[dotnet](./../services/dotnet.md)
*   ####[elasticsearch](./../services/elasticsearch.md)
*   ####[go](./../services/go.md)
*   ####[mailhog](./../services/mailhog.md)
*   ####[mariadb](./../services/mariadb.md)
*   ####[memcached](./../services/memcached.md)
*   ####[mongo](./../services/mongo.md)
*   ####[mssql](./../services/mssql.md)
*   ####[mysql](./../services/mysql.md)
*   ####[nginx](./../services/nginx.md)
*   ####[node](./../services/node.md)
*   ####[php](./../services/php.md)
*   ####[phpmyadmin](./../services/phpmyadmin.md)
*   ####[postgres](./../services/postgres.md)
*   ####[python](./../services/python.md)
*   ####[redis](./../services/redis.md)
*   ####[ruby](./../services/ruby.md)
*   ####[solr](./../services/solr.md)
*   ####[tomcat](./../services/tomcat.md)
*   ####[varnish](./../services/varnish.md)
