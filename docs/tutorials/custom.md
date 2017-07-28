Working with Custom Sites
=========================

Using Lando it is easy to augment recipes with additional services, tooling or routing or to build out completely custom stacks to run your application. Before customizing or creating your own Lando app we recommend you review the three core components that drive the `.lando.yml` so you have a sense of how things work behind the scenes.

*   [Services](./../config/services.md)
*   [Routing](./../config/proxy.md)
*   [Tooling](./../config/tooling.md)

Now that you've read all deep magic here are some common scenarios and examples.

Overriding Extending Recipes
----------------------------

It is easy to both augment the services, tooling and routes provided by recipes and to add additonal things. We recommend you run `lando info` on your app before you customize so you can check out the names of the services provided by your recipe. Once you change your `.lando.yml` file you'll likely want to `lando restart` or `lando rebuild` for the changes to apply.

Here are a few examples:

### A LEMP recipe with bonus DB, phpMyAdmin and appserver overrides

{% codesnippet "./../examples/pma/.lando.yml" %}{% endcodesnippet %}

You can check out the full code for this example [over here](https://github.com/kalabox/lando/tree/master/examples/pma).

### A LEMP recipe with a bunch of extra tools

{% codesnippet "./../examples/addtools/.lando.yml" %}{% endcodesnippet %}

You can check out the full code for this example [over here](https://github.com/kalabox/lando/tree/master/examples/addtools).

### A LEMP recipe that uses mailhog

{% codesnippet "./../examples/mailhog/.lando.yml" %}{% endcodesnippet %}

You can check out the full code for this example [over here](https://github.com/kalabox/lando/tree/master/examples/mailhog).

Building A Custom Stack
-----------------------

You also can build up a custom stack without a starting recipe at all.

### LAMP recipe without the recipe

{% codesnippet "./../examples/lamp/.lando.yml" %}{% endcodesnippet %}

You can check out the full code for this example [over here](https://github.com/kalabox/lando/tree/master/examples/lamp).

### Node webserver with elasticsearch

{% codesnippet "./../examples/elasticsearch/.lando.yml" %}{% endcodesnippet %}

You can check out the full code for this example [over here](https://github.com/kalabox/lando/tree/master/examples/elasticsearch).

Additional Reading
------------------

Check out these individual tutorials for adding `routes`, `services` and `tooling` to take your knowledge to the next level.

*   [Setting up Additional Services](./setup-additional-services.md)
*   [Setting up Additional Tooling](./setup-additional-tooling.md)
*   [Setting up Additional Routes](./setup-additional-routes.md)
