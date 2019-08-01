Add Themes to phpMyAdmin
========================

[phpMyAdmin](https://www.phpmyadmin.net/) is a free software tool written in PHP, intended to handle the administration of MySQL over the Web.
See the [lando docs](https://docs.devwithlando.io/tutorials/phpmyadmin.html) regarding phpMyAdmin for help enabling the service.

This is a basic setup to help you enable extra themes.

<!-- toc -->

Getting Started
---------------

Add the build script to your Lando recipe where you should have the phpMyAdmin service already.

```yaml
services:
  pma:
    type: phpmyadmin:4.7
    build_as_root: /app/.lando/pma-theme.sh
```

Create script to download and install the third-party theme
-----------------------------------------------------------

Create the custom `pma-theme.sh` file.

```bash
touch .lando/pma-theme.sh
vim .lando/pma-theme.sh
```

The location of this file is arbitrary.

We placed it inside `.lando/` folder simply because we find it convenient.

```bash
#!/bin/sh

# Fetch pmaterial theme, then extract and install.
wget https://files.phpmyadmin.net/themes/pmaterial/1.1/pmaterial-1.1.zip
unzip pmaterial-1.1.zip
mv pmaterial /www/themes/
rm pmaterial-1.1.zip
```

Checkout the available themes [here](https://www.phpmyadmin.net/themes/). Make sure you choose a theme compatible with your version of phpMyAdmin. Modify the script according to the theme you want.

Add execute bit to the script.

```bash
chmod +x .lando/pma-theme.sh
```

Set new theme as the default
----------------------------

Review the [phpMyAdmin docs](https://docs.devwithlando.io/tutorials/phpmyadmin.html#using-custom-phpmyadmin-config-file) to see how to hook up your config file.

Add this line to your config:

```php
<?php
  ...

  // Set whichever theme you have available here.
  $cfg['ThemeDefault'] = 'pmaterial';

  ...
```

Rebuild your environment
------------------------

```bash
lando rebuild -y
```

Done!

Check the output from lando or run `lando info` to get the url for the phpMyAdmin service.

Additional Reading
------------------

{% include "./../snippets/guides.md" %}
