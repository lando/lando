Lando object
============

The Lando object wraps the major functionality of Lando up into one loadable object. The `lando` CLI is one such implementation of this object. All Lando plugins also get injected with this object. Using the `lando` object you can easily:

  1. Access and hook into Lando core and app events
  2. Access logging functions
  4. Access Docker abstraction layers
  5. Access app wrappers like `start` and `stop`
  6. Access common node utilities like lodash
  7. Access caching utilities
  8. Access the Lando config

{% codesnippet "./../lib/lando.js" %}{% endcodesnippet %}
