Using Lando with VS Code
========================

[Visual Studio Code](https://github.com/Microsoft/vscode/) is a great open source editor for programming. 
It is however not so easy to debug PHP applications - especially when they're run inside Docker containers, like Lando.

This is a basic setup to help you in this task.

<!-- toc -->

Getting Started
---------------

Enable XDebug by adding some lines to your Lando recipe.

```yaml
# Enable XDebug in your .lando.yml
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

;;;;;;;;;;;;;;;
;IMPORTANT;
;PLACE THIS FILE UNDER .vscode folder;
;SO IT DOESNT GET COMMITTED;
;;;;;;;;;;;;;;;

; Xdebug
xdebug.max_nesting_level = 256
xdebug.show_exception_trace = 0
xdebug.collect_params = 0
# Extra custom Xdebug setting for debug to work in VSCode.
xdebug.remote_enable = 1 
xdebug.remote_autostart = 1 
```

Rebuild your environment.

```bash
lando rebuild
```

Finally, you need a custom `launch.json` file in VS Code in order to map paths so that XDebug works correctly.

```bash
touch .vscode/launch.json
code .vscode/launch.json
```

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "XDebug",
      "type": "php",
      "request": "launch",
      "port": 9000,
      "log": true,
      // We used to do this in previous versions of VS Code:
      // "localSourceRoot": "${workspaceRoot}/",
      // "serverSourceRoot": "/app/",
      //
      // But this has been deprecated and we now use this:
      "pathMappings": {
        "/app/": "${workspaceRoot}/",
      }
    }
  ]
}
```

Done! 

You can now click start debugging (type F5 or click on the icon in the left sidebar).


Read More
---------

*   [Original Gist with settings for XDebug in VS Code](https://gist.github.com/MatthieuScarset/0c3860def9ff1f0b84e32f618c740655)
*   [PHP programming in VS code](https://code.visualstudio.com/docs/languages/php)

