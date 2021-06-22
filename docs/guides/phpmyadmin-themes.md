---
title: Using a custom PhpMyAdmin 4.x theme in Lando
description: Learn how to load a custom PhpMyAdmin 4.x theme into Lando
summary: Learn how to load a custom PhpMyAdmin 4.x theme into Lando
date: 2020-03-30T19:23:00.720Z
original:
repo: https://github.com/lando/cli/tree/main/examples/pma

author:
  name: Jace Bennest
  pic: https://avatars0.githubusercontent.com/u/6412919?s=460&u=b96d856896743523cec75bad1d9aec42a7f8a25e&v=4
  link: https://twitter.com/thejacer87

feed:
  enable: true
  author:
    - name: Jace Bennest
      email: alliance@lando.dev
      link: https://twitter.com/thejacer87
  contributor:
    - name: Jace Bennest
      email: alliance@lando.dev
      link: https://twitter.com/thejacer87
---

# Add Themes to phpMyAdmin 4.x

<GuideHeader name="Jace Bennest" pic="https://avatars0.githubusercontent.com/u/6412919?s=460&u=b96d856896743523cec75bad1d9aec42a7f8a25e&v=4" link="https://twitter.com/thejacer87" test="https://github.com/lando/cli/tree/main/examples/pma" />
<YouTube url="" />

[phpMyAdmin](https://www.phpmyadmin.net/) is a free software tool written in PHP, intended to handle the administration of MySQL over the Web. See the [lando docs](https://docs.devwithlando.io/tutorials/phpmyadmin.html) regarding phpMyAdmin for help enabling the service.

:::warning Only for PhpMyAdmin 4.x
Note that this guide is only applicable to the 4.x branch of PhpMyAdmin. You'll want to consult the docs for how to do this in 5.x
:::

This is a basic setup to help you enable extra themes.

## Getting Started

Add the build script to your Lando recipe where you should have the phpMyAdmin service already.

```yaml
services:
  pma:
    type: phpmyadmin:4.7
    build_as_root:
      - chmod +x /app/.lando/pma-theme.sh
      - /app/.lando/pma-theme.sh
```

## Create script to download and install the third-party theme

Create the custom `pma-theme.sh` file.

```bash
touch .lando/pma-theme.sh
vim .lando/pma-theme.sh
```

The location of this file is arbitrary. We placed it inside `.lando/` folder simply because we find it convenient.

```bash
#!/bin/sh
if [ ! -z $LANDO_MOUNT ]; then
  wget https://files.phpmyadmin.net/themes/pmaterial/1.1/pmaterial-1.1.zip
  unzip pmaterial-1.1.zip -d /www/themes/
  rm pmaterial-1.1.zip
fi
```

Checkout the available themes [here](https://www.phpmyadmin.net/themes/). Make sure you choose a theme compatible with your version of phpMyAdmin. Modify the script according to the theme you want.

## Set new theme as the default

Review the [phpMyAdmin docs](https://docs.devwithlando.io/tutorials/phpmyadmin.html#using-custom-phpmyadmin-config-file) to see how to hook up your config file.

Add this line to your config:

```php
<?php
  ...

  // Set whichever theme you have available here.
  $cfg['ThemeDefault'] = 'pmaterial';

  ...
```

## Rebuild your environment

```bash
lando rebuild -y
```

Done!

Check the output from lando or run `lando info` to get the url for the phpMyAdmin service.

<GuideFooter test="https://github.com/lando/cli/tree/main/examples/pma" original="" repo="https://github.com/lando/cli/tree/main/examples/pma"/>
<Newsletter />
