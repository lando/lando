---
title: How do I wire up Browsersync and Gulp in my Lando app?
metaTitle: How to wire up Browsersync and Gulp in my Lando app | Lando
description: How to setup Lando with Browsersync & Gulp so that edits to scss files are reflected immediately in your browser.
summary: How to setup Lando with Browsersync & Gulp so that edits to scss files are reflected immediately in your browser.
date: 2020-04-07T14:05:33.088Z
original:
repo:

author:
  name: Jonathan Shaw
  pic: https://www.gravatar.com/avatar/ba46283b2033d3a0201f2042746f81e7
  link: https://github.com/jonathanjfshaw

feed:
  enable: true
  author:
    - name: Jonathan Shaw
      email: alliance@lando.dev
      link: https://github.com/jonathanjfshaw
  contributor:
    - name: Jonathan Shaw
      email: alliance@lando.dev
      link: https://github.com/jonathanjfshaw
---

# How do I wire up Browsersync and Gulp in my Lando app?

<GuideHeader test="" name="Jonathan Shaw" pic="https://www.gravatar.com/avatar/ba46283b2033d3a0201f2042746f81e7" link="https://github.com/jonathanjfshaw" />
<YouTube url="" />

[Browsersync](https://www.browsersync.io) is a nodejs package that synchronizes website changes to the browser.
While it can be used for many things, this guide shows how to use it to push changes made to css files to the browser.

This guide also assumes you're using Gulp to automate your theming tasks, and are editing SASS/SCSS files that need compiling
into css before they can be previewed in your browser.

## Configuring Lando for Browsersync

### Create the proxy

First you must create a proxy domain for browsersync to use. Changes you make to your scss files will only show up when
you are looking at this `https://bs.myproject.lndo.site`, not at the usual domain `https://myproject.lndo.site`.
Add your equivalent of this to your .lando.yml file:

```yaml
proxy:
  node:
    - bs.myproject.lndo.site:3000
```

### Stream changes whenever Lando is running
It's most convenient if Browsersync is running in the background whenever your Lando site is up.
One simple way to achieve this is to fire off a gulp task whenever Lando starts up.
If you had a gulp task called 'watch' then you'd put this in .lando.yml:

```yaml
services:
  node:
    type: node
    ssl: true
    command: cd /app/path/to/gulpfile && node_modules/.bin/gulp watch
```

## Configuring Gulp to push scss

### Compiling scss

Here's an example of a `gulpfile.js` that defines a task that compiles scss into css.
Note the addition of `browserSync.stream()` at the end of the pipeline.
This will send the compiled css to the browser, if browsersync is running.

```js
// Live CSS reload & browser Syncing.
var browserSync = require('browser-sync').create();

// Gulp plugin for showing scss file in browser inspect tools rather than the compiled css file.
var sourcemaps = require('gulp-sourcemaps');

// Gulp plugin for sass.
var sass = require('gulp-sass');

// Allows you to use glob syntax in imports (i.e. @import "dir/*.sass"). Use as a custom importer for node-sass.
var importer = require('node-sass-globbing');

// Default configuration.
var config = {
  scss: './scss/*.scss', // The top level scss files that include all other scss.
  watch: './scss/**', // All scss files that should trigger a recompile.
  css: './css', // The path to the generated css files.
  node_modules: './node_modules', // The path to the node modules directory.
};

// A gulp task that compiles scss into css. Execute with 'gulp scss-compile'
gulp.task('scss-compile', function () {
 return gulp.src(config.scss)
  .pipe(plumber())
   // Start making a source map, so that the browser can show a developer which scss file is responsible for a css rule.
  .pipe(sourcemaps.init({loadMaps: true})) //Not sure if loadMaps is a good idea.
   // Compile the scss to css.
  .pipe(sass({
    importer: importer,
    // Include some useful scss from external node packages.
    includePaths: [
      config.node_modules + '/breakpoint-sass/stylesheets/',
      config.node_modules + '/compass-mixins/lib/'
    ],
    // Tweak output styling to make things easier for developers.
    outputStyle: 'expanded',
    sourceComments: true,
    indentWidth: 2
  }).on('error', sass.logError))
  .pipe(sourcemaps.write('maps'))
   // Write out the generated css.
  .pipe(gulp.dest(config.css))
   // Push the css to the browser.
  .pipe(browserSync.stream());
});
```

### Recompiling whenever the scss changes

```js
// Watch the scss files and push changes automatically.
gulp.task('watch', function () {
  // Setup a browsersync server.
  browserSync.init({
    proxy: 'http://appserver_nginx', // Could be 'http://appserver' if you're running apache.
    socket: {
      domain: 'https://bs.myproject.lndo.site', // The node proxy domain you defined in .lando.yaml. Must be https?
      port: 80 // NOT the 3000 you might expect.
    },
    open: false,
    logLevel: "debug",
    logConnections: true,
  });
  // Trigger the scss-compile task whenever any file in the defined location changes.
  gulp.watch(config.watch, gulp.series('scss-compile'));
});
```

## Trying it out

* Run `lando rebuild -y` so your new proxy domain is exposed.
* Verify that the output includes under `NODE URLS` your new proxy `https://bs.myproject.lndo.site`, and it is green.
* Run `lando logs -s node -f` to continuously stream the logs of the node service. You should see something like:

```bash
Using gulpfile /app/path/to/my/theme/gulpfile.js
Starting 'watch'...
...
[Browsersync] Proxying: http://appserver_nginx
[Browsersync] Access URLs:
  Local: http://localhost:3000
  External: http://172.20.0.6:3000
```

* Visit your browsersync url `https://bs.myproject.lndo.site` in your browser. It should load normally.
* In the source of this page search for "browser-sync". You should see the browser-sync-client script has been injected into the page.
* Look again at the streaming node logs; something like this should have appeared

```bash
[Browsersync] Browser Connected: Chrome, version: 80.0.3987.149
```

* In your IDE edit a style rule in an scss file, save if necessary, and wait a few seconds.
* Look again at the logs; something like this should have appeared:

```bash
Starting 'scss-compile'...
[Browsersync] 2 files changed (style.css.map, style.css)
Finished 'scss-compile' after 1.88 s
```

* Look at your open browser window again (without refreshing). You should see the impact of your scss edit.
* Feel very excited!

## Known issues

* When submitting a form on `https://bs.myproject.lndo.site` you will be redirected to `https://appserver_nginx` (which is not a working url).
If you know a solution for this problem, please update this guide.
* So to use the forms on a site use the non-browsersync URL, i.e. `https://myproject.lndo.site`.


<GuideFooter test="" original="" repo=""/>
<Newsletter />
