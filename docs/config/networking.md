Networking
==========

Lando services should be able to communicate with other services within their own app but also services from other apps. You can access a service within your app using the service name eg `nginx` or `database` or a service in another app using the `<service>.<app>.internal` convention eg `redis.myapp.internal`. See `lando info` for the hostnames you can use for each services.

You also can use your `*.lndo.site` addresses to communicate between different services.

> #### Warning::Cross app service communication requires all apps be on
>
> If you want a service in App A to talk to a service in App B then you need to make sure you've started up both apps!
