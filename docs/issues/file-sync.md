#### DNS Rebinding Protection

Some Routers and Firewalls may prevent Kalabox from properly routing `yoursite.kbox.site` to your local environment through [DNS Rebinding](https://en.wikipedia.org/wiki/DNS_rebinding) protection. DD-WRT router firmware enables this protection by default.

If your site preview fails automatically, and you are unable to look up the url (`nslookup <sitename>.kbox.site)`), DNS rebinding protection may be the cause. If you can't or don't want to remove this protection, you can use the steps in [Working Offline](#working-offline) to bypass.

docker logs unison
