Using Lando with VSCode
========================

[Visual Studio Code](https://github.com/Microsoft/vscode/) is a great open source editor for programming. Debugging PHP applications with it can be easy too.

This is a basic setup to help you in this task.

<!-- toc -->

Getting Started
---------------

Enable Xdebug by adding some lines to your Lando recipe.

```yaml
name: mywebsite
recipe: drupal8
config:
  webroot: docroot
  xdebug: true
  conf:
    # Tell Lando to use additional PHP settings.
    # The location of this file is arbitrary.
    # We placed it inside .vscode/ folder simply because we find it convenient.
    php: .vscode/php.ini
```

Create the custom `php.ini` file to add XDebug settings to PHP.

```bash
touch .vscode/php.ini
code .vscode/php.ini
```

Add your custom XDebug settings.

```ini
[PHP]

; Xdebug
xdebug.max_nesting_level = 256
xdebug.show_exception_trace = 0
xdebug.collect_params = 0
; Extra custom Xdebug setting for debug to work in VSCode.
xdebug.remote_enable = 1
xdebug.remote_autostart = 1
xdebug.remote_host = ${LANDO_HOST_IP}
; xdebug.remote_connect_back = 1
xdebug.remote_log = /tmp/xdebug.log
```

Rebuild your environment.

```bash
lando rebuild -y
```

Finally, add a custom `launch.json` file in VSCode in order to map paths so that XDebug works correctly.

```bash
touch .vscode/launch.json
code .vscode/launch.json
```

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Listen for XDebug",
      "type": "php",
      "request": "launch",
      "port": 9000,
      "log": true,
      "pathMappings": {
        "/app/": "${workspaceFolder}/",
      }
    }
  ]
}
```

Done!

You can now click start debugging (type F5 or click on the icon in the left sidebar).

Debugging PhpUnit
-----------------

Debugging PhpUnit tests in VSCode requires a little more setup, but Lando helps to make it easier.

First, you need to have VSCode listen for debugging on 2 separate ports, because PhpUnit runs in one process and the tests themselves in another, and VSCode's Xdebug extension currently struggles with this. You accomplish this by have a launch.json that looks like this:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Listen for XDebug",
      "type": "php",
      "request": "launch",
      "port": 9000,
      "log": true,
      "pathMappings": {
        "/app/": "${workspaceFolder}/",
      }
    },
    {
      "name": "PhpUnit dummy",
      "type": "php",
      "request": "launch",
      "port": 9001,
    }
  ],
  "compounds": [
    {
        "name": "PhpUnit",
        "configurations": ["Normal", "PhpUnit dummy"]
    }
       ]
}
```

Next add some custom tooling to your .lando.yml file, that provides a command to run PhpUnit in a way points the main PhpUnit process to the PhpUnit dummy debugger we just added. (The syntax here assumes a project-specific installation of PhpUnit, not a global one).

```yml
tooling:
  phpunitdebug:
    service: appserver
    cmd: php -d xdebug.remote_port=900 vendor/bin/phpunit
```

Now to run debug a PhpUnit test, do the following:

1. Select the compound "PhpUnit" as your debugger in VSCode's UI, and start it.
2. Make sure you untick "Everything" in the breakpoints section of the UI, or it will break every time PhpUnit throws an exception, even if it's properly caught by PhpUnit.
3. Add a breakpoint in your code that is being tested.
4. On your command line run PhpUnit with something like `lando phpunitdebug --filter=testMyTestMethodName` (this example is of running a single test method, actually you can add any phpunit options you like at the end).

Known issues
-----------------

**Xdebug session doesn't start**

If Xdebug session doesn't start, dig into the log file inside the application.

Enter your lando app `lando ssh` and open the debug file (`/tmp/xdebug.log`). Path to the debug file is configured in your custom `php.ini`.

Now open your app in a browser and see what's being logged.

```bash
lando ssh
tail -f /tmp/xdebug.log
# Open your browser and refresh the app
```

**Xdebug says "timeout trying to connect to XX.XX.XX:9000**

Double-check your host machine allow connection on its port 9000.

This is how you can open a specific port on a Debian/Ubuntu:

`sudo iptables -A INPUT -p tcp -d 0/0 -s 0/0 --dport 9000 -j ACCEPT`


Read More
---------

*   [Original Gist with settings for XDebug in VSCode](https://gist.github.com/MatthieuScarset/0c3860def9ff1f0b84e32f618c740655)
*   [PHP programming in VSCode](https://code.visualstudio.com/docs/languages/php)

Additional Reading
------------------

{% include "./../snippets/guides.md" %}
