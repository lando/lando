Using $LANDO_INFO
=================

Lando will inject an environment variable called `$LANDO_INFO` into each service. This is a `JSON` string representation of the `lando info` command and you can use it to see valuable information about other services such as service hostnames and database connection information and credentials.

This is helpful if you want to set applicaiton configuration in a way that portable and dynamic between many lando apps.

> #### Warning::Use `internal_connection` information
>
> For services with both `external_connection` and `internal_connection` information. ALWAYS use the `internal_connection` information inside of your application.

Here are some examples of code on how to parse `$LANDO_INFO`.

Using PHP
---------

```php
$info = json_decode(getenv('LANDO_INFO'), TRUE);
print_r($info);
```

Using Javascript/NodeJS
-----------------------

{% codesnippet "./../examples/landoinfo/info.js" %}{% endcodesnippet %}

Using Other
-----------

More examples coming soon but in the meantime consult the documentation for your language on how to:

* Grab an environment variable
* Decode a JSON string to an object
