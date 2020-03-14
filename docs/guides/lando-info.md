---
description: Learn how to use Lando's default environment variables inside you application.
date: 2019-11-05
---

# Using $LANDO_INFO

<GuideHeader />

Lando will inject an environment variable called `$LANDO_INFO` into each service. This is a `JSON` string representation of the `lando info` command and you can use it to see valuable information about other services such as service hostnames and database connection information and credentials.

This is helpful if you want to set application configuration in a way that is portable and dynamic between many lando apps.

::: warning Use `internal_connection` information!
For services with both `external_connection` and `internal_connection` information. ALWAYS use the `internal_connection` information inside of your application.
:::

Here are some examples of code on how to parse `$LANDO_INFO`.

## Using PHP

```php
$info = json_decode(getenv('LANDO_INFO'), TRUE);
print_r($info);
```

## Using Javascript/NodeJS

```js
'use strict';

var info = JSON.parse(process.env.LANDO_INFO);

console.log(info);
```

## Using Other

More examples coming soon but in the meantime consult the documentation for your language on how to:

* Grab an environment variable
* Decode a JSON string to an object

<GuideFooter />
<Newsletter />
