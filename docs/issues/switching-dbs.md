Switching Database Configuration
================================

If you are currently using a database with Lando and you decide to change its type, version or credentials in your `.lando.yml` file *it's possible* that your database service will not restart correctly or with the expected values once you've made the change.

For a change in credentials it is required that you `lando destroy && lando start` since these are set at container creation and persist through a `lando rebuild`.

For a change in type or version this is caused by incompatibilities in the underlying file format that various databases and versions use to store their data. If you are unsure about the aforementioned file format compatibility we recommend you `lando destroy` and recreate the app instead of doing a `lando restart` or `lando rebuild`.

If you do not do this and there exists an incompatibility it is likely your database will not start up correctly. Newer versions of lando will report this as a warning that your database service is unhealthy. Luckily, even if you get this point a `lando destroy` and `lando start` should set you back onto the path of righteousness.

Listed below are a few tell tale signs that this is the situation you are in.

1. Running `lando mysql`
------------------------

If you run `lando mysql` or the analgous command for your database type you will see an error that looks similar to:

```bash
ERROR 2002 (HY000): Can't connect to local MySQL server through socket '/var/run/mysqld/mysqld.sock' (2 "No such file or directory")
```

2. Scoping Logs
---------------

You can also run `lando logs -s database` where `database` is the name of your database service. If you are unsure what the name of your service is you can run `lando info` to see.

You should see an error in the logs that looks something like this:

```bash
database_1   | 2017-11-15 16:01:10 140537640757184 [Note] InnoDB: Using SSE crc32 instructions
database_1   | 2017-11-15 16:01:10 140537640757184 [Note] InnoDB: Initializing buffer pool, size = 384.0M
database_1   | 2017-11-15 16:01:10 140537640757184 [Note] InnoDB: Completed initialization of buffer pool
database_1   | 2017-11-15 16:01:10 140537640757184 [Note] InnoDB: Highest supported file format is Barracuda.
database_1   | InnoDB: No valid checkpoint found.
database_1   | InnoDB: A downgrade from MariaDB 10.2.2 or later is not supported.
database_1   | InnoDB: If this error appears when you are creating an InnoDB database,
database_1   | InnoDB: the problem may be that during an earlier attempt you managed
database_1   | InnoDB: to create the InnoDB data files, but log file creation failed.
database_1   | InnoDB: If that is the case, please refer to
database_1   | InnoDB: http://dev.mysql.com/doc/refman/5.6/en/error-creating-innodb.html
database_1   | 2017-11-15 16:01:10 140537640757184 [ERROR] Plugin 'InnoDB' init function returned error.
database_1   | 2017-11-15 16:01:10 140537640757184 [ERROR] Plugin 'InnoDB' registration as a STORAGE ENGINE failed.
database_1   | 2017-11-15 16:01:10 140537640757184 [Note] Plugin 'FEEDBACK' is disabled.
database_1   | 2017-11-15 16:01:10 140537640757184 [ERROR] Could not open mysql.plugin table. Some plugins may be not loaded
database_1   | 2017-11-15 16:01:10 140537640757184 [ERROR] Unknown/unsupported storage engine: innodb
database_1   | 2017-11-15 16:01:10 140537640757184 [ERROR] Aborting
database_1   |
```
