Tooling
=======

Lando provides a way to easily define nice `lando MYCOMMAND` commands so that users can take advantage of development tools that are installed inside of containers. Setting up some common routes for things like `composer` or `npm` allows the user to get a "native" experience but perhaps more importantly allows project specific development dependencies to be isolated and run in containers instead of on the users host machine. Never worry about which version of `php` or `grunt` you need for each project.

> #### Warning::Make sure to install your dependencies
>
> You will want to make sure you install the tools you need inside of the services your app is running. If you are not clear on how to do this check out either [build steps](./../config/services.md#build-extras) or our [`ssh`](./../cli/ssh.md) command.

### Example

{% codesnippet "./../examples/trivial-tooling/.lando.yml" %}{% endcodesnippet %}

Directory Mapping
-----------------

Lando will try to map your host directory to the analogous directory inside the service. This should **MAKE IT SEEM** as though you are running the command locally.

