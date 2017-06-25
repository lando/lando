Sharing
=======

Lando seeks to mitigate the **HARDEST PROBLEM** in VM-based local development: quickly sharing files from your host machine into the VM while maintaining fast page loads. While you definitely can use [Docker host volume mounting](https://docs.docker.com/compose/compose-file/#volumes) to achieve much of this, you will find that it produces [**EXTREMELY SLOW PAGE LOADS**](https://forums.docker.com/t/file-access-in-mounted-volumes-extremely-slow-cpu-bound/8076) for apps like Drupal that have a large amount of files.

As soon as Docker offers a file sharing solution with tolerable page load speeds, we will introduce a few sharing modes so the user can choose which sharing concerns (eg speed vs reliability) are more important to them.

> #### Warning::Is my sync working?
>
> If you think your sync might be stuck or not working, check out the [known issues](./../issues/file-sync.md).

Please note that the initial file sync or running commands like `composer install` or `npm install` can take a few moments to fully sync. Small and single file changes should be instantaneous. To add syncing to your app, just modify its `.lando.yml`.

Example
-------

{% codesnippet "./../examples/trivial-sharing/.lando.yml" %}{% endcodesnippet %}

You will need to restart your app with `lando restart` to apply the changes. You can check out the full code for this example [over here.](https://github.com/kalabox/lando/tree/master/examples/trivial-sharing)

Configuration
-------------

By default, sharing is turned on but is configurable by editing the [Lando global configuration](./config.yml).

```yml
sharing: OFF
```
