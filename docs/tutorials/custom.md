Working with Custom Sites
=========================

Using Lando it is easy to augment recipes with additional services, tooling or routing or to build out completely custom stacks to run your application. Before customizing or creating your own Lando app we recommend you review the three core components that drive the `.lando.yml` so you have a sense of how things work behind the scenes.

*   [Services](./../config/services.md)
*   [Routing](./../config/proxy.md)
*   [Tooling](./../config/tooling.md)

Now that you've read all deep magic here are some common scenarios and examples.

Overriding and Extending Recipes
--------------------------------

It is easy to both augment the services, tooling and routes provided by recipes and to add additonal things. We recommend you run `lando info` on your app before you customize so you can check out the names of the services provided by your recipe. Once you change your `.lando.yml` file you'll likely want to `lando restart` or `lando rebuild` for the changes to apply.

Here are a few examples:

### A LEMP recipe with bonus DB, phpMyAdmin and appserver overrides

{% codesnippet "./../examples/pma/.lando.yml" %}{% endcodesnippet %}

You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/pma).

### A LEMP recipe with a bunch of extra tools

{% codesnippet "./../examples/addtools/.lando.yml" %}{% endcodesnippet %}

You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/addtools).

### A LEMP recipe that uses mailhog

{% codesnippet "./../examples/mailhog/.lando.yml" %}{% endcodesnippet %}

You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/mailhog).

Building A Custom Stack
-----------------------

You also can build up a custom stack by creating a `.lando.yml` file from scratch and putting it in your applications code root. This means you don't have to run `lando init`.

### LAMP recipe without the recipe

{% codesnippet "./../examples/lamp/.lando.yml" %}{% endcodesnippet %}

You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/lamp).

### Node webserver with elasticsearch

{% codesnippet "./../examples/elasticsearch/.lando.yml" %}{% endcodesnippet %}

You can check out the full code for this example [over here](https://github.com/lando/lando/tree/master/examples/elasticsearch).

Read More
---------

### Workflow Docs

*   [Using Composer to Manage a Project](http://docs.devwithlando.io/tutorials/composer-tutorial.html)
*   [Lando and CI](http://docs.devwithlando.io/tutorials/lando-and-ci.html)
*   [Lando, Pantheon, CI, and Behat (BDD)](http://docs.devwithlando.io/tutorials/lando-pantheon-workflow.html)
*   [Killer D8 Workflow with Platform.sh](https://thinktandem.io/blog/2017/10/23/killer-d8-workflow-using-lando-and-platform-sh/)

### Advanced Usage

*   [Adding additional services](http://docs.devwithlando.io/tutorials/setup-additional-services.html)
*   [Adding additional tooling](http://docs.devwithlando.io/tutorials/setup-additional-tooling.html)
*   [Adding additional routes](http://docs.devwithlando.io/config/proxy.html)
*   [Adding additional events](http://docs.devwithlando.io/config/events.html)
*   [Setting up front end tooling](http://docs.devwithlando.io/tutorials/frontend.html)
*   [Accessing services (eg your database) from the host](http://docs.devwithlando.io/tutorials/frontend.html)
*   [Importing SQL databases](http://docs.devwithlando.io/tutorials/db-import.html)
*   [Exporting SQL databases](http://docs.devwithlando.io/tutorials/db-export.html)
