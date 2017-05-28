Backdrop CMS Multisite Support
==============================

This directory is for configuring multisite installations of Backdrop CMS.

Backdrop CMS supports running multiple sites with different domain names from
the same codebase. For example you could point example-a.com and example-b.com
at the same server and same directory and Backdrop CMS could run both sites.
This is useful for sites that have extremely similar or even identical
configuration and features. If you have several sites running Backdrop CMS but
they have different modules installed, you should probably use entirely separate
installations of Backdrop CMS in different directories.

If you don't plan on using the multisite functionality of Backdrop CMS (most
don't), you can safely delete the entire `/sites` directory.

If you DO plan on using the multisite functionality, you will need to do the
following:

- Configure the `sites.php` file (see below)
- Create a new sub-directory of `/sites` with the name as specified in
  `sites.php` (e.g. `/sites/example-a`)
- Copy the default `settings.php` file (i.e. `/settings.php`) into the new
  sub-directory (i.e. `/sites/example-a/settings.php`).

Configuring the `sites.php` file
--------------------------------

To enable Backdrop CMS's multisite functionality, edit the `sites.php` file in
this directory. The `$sites` variable can be used to make Backdrop CMS use
different database settings, modules, layouts, and themes based on the URL of
the site.

For example if you wanted to have example-a.com and example-b.com running off
the same Backdrop CMS installation, you would specify the following values in
the `$sites` array:

```php
$sites['example-a.com'] = 'example-a';
$sites['example-b.com'] = 'example-b';
```

Then you could place site-specific settings in `sites/example-a/settings.php`,
modules in `sites/example-a/modules`, layouts in `sites/example-a/layouts`, and
themes in `sites/example-a/themes`. The same could be done for the `example-b`
sites. Both sites will share the modules, layouts, and themes that are provided
by Backdrop CMS core, as well as the modules, layouts, and themes located in the
root directory. Each site will always have a different database, configuration,
and files directory.

If developing on a multisite locally, you may also want to specify aliases for
those same directories so that Site A and Site B can be accessed separately on
your localhost or development environment:

```php
$sites['example-a.localhost'] = 'example-a';
$sites['example-b.localhost'] = 'example-b';

$sites['dev.example-a.com'] = 'example-a';
$sites['dev.example-b.com'] = 'example-b';
```

Besides the simple examples based only on domain name, you can also specify site
directories based on path and port, with the format
`$sites['<port><domain><directory>'] = 'directory';`. Some advanced examples:

**URL:** http://localhost:8080/example
```php
$sites['8080.localhost.example'] = 'example';
```

**URL:** http://www.example.com:8080/mysite/test/
```php
$sites['8080.www.example.com.mysite.test'] = 'example';
```
