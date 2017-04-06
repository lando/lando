# SmartMenus

Advanced jQuery website menu plugin. Mobile first, responsive and accessible list-based website menus that work on all devices.
Check out [the demo page](http://vadikom.github.io/smartmenus/src/demo/).

## Quick start

- [Download the latest release](http://www.smartmenus.org/download/).
- Install with [Bower](http://bower.io): `bower install smartmenus`.
- Install with [npm](https://www.npmjs.com): `npm install smartmenus`.
- Clone the repo: `git clone https://github.com/vadikom/smartmenus.git`.

Check out the [project documentation](http://www.smartmenus.org/docs/) for quick setup instructions, API reference, tutorials and more.

## Addons usage as modules
If you need to use any of the addons from the "addons" directory as an AMD or CommonJS module:

### AMD
Make sure your SmartMenus jQuery plugin module is named `jquery.smartmenus` since the addons require that name. For example, in RequireJS you may need to add this in your config if you would like to use the minified version:
```javascript
requirejs.config({
  "paths": {
    'jquery.smartmenus': 'jquery.smartmenus.min'
  }
  // ...
```

### CommonJS (npm)
The addons are available as separate npm packages so you could properly install/require them in your project in addition to `jquery` and `smartmenus`:

- Bootstrap Addon: `npm install smartmenus-bootstrap`

- Keyboard Addon: `npm install smartmenus-keyboard`

#### Example with npm + Browserify

package.json:
```javascript
{
  "name": "myapp-using-smartmenus",
  "version": "1.0.0",
  "license": "MIT",
  "dependencies": {
    "jquery": ">=2.1.3",
    "smartmenus": ">=1.0.0",
    "smartmenus-keyboard": ">=0.2.0"
  },
  "devDependencies": {
    "browserify": ">=9.0.3"
  }
}
```

entry.js:
```javascript
var jQuery = require('jquery');
require('smartmenus');
require('smartmenus-keyboard');

jQuery(function() {
  jQuery('#main-menu').smartmenus();
});
```

Run browserify to create bundle.js: `browserify entry.js > bundle.js`

## Homepage

<http://www.smartmenus.org/>

## Community and support

- Visit the [Community forums](http://www.smartmenus.org/forums/) for free support.
- Read and subscribe to [the project blog](http://www.smartmenus.org/blog/).
- Follow [@vadikom on Twitter](http://twitter.com/vadikom).

## Bugs and issues

For bugs and issues only please. For support requests please use the [Community forums](http://www.smartmenus.org/forums/).

<https://github.com/vadikom/smartmenus/issues>