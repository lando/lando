---
description: Learn how to handle DNS Rebinding protection when using Lando for local development.
---

# DNS Rebinding Protection

If you are using [Lando proxying](./../config/proxy.md), which is enabled by default, some routers and firewalls may prevent Lando from properly routing `*.lndo.site` addresses to your application through [DNS Rebinding](https://en.wikipedia.org/wiki/DNS_rebinding) protection. For example the `DD-WRT` router firmware enables this protection by default.

If you are seeing red URLs after you start your app and you are unable to look up the url DNS rebinding protection may be the cause. You can test this out using `nslookup`.

```bash
nslookup <sitename>.lndo.site
```

If this check fails we recommend you consult your router documentation or system administrator to allowlist `*.lndo.site` domains.

If you can't or don't want to remove this protection, you can alternatively:

1.  Use the steps in [Working Offline](./../config/proxy.html#working-offline-or-using-custom-domains) to bypass the external DNS lookup altogether
2.  [Disable proxying](./../config/proxy.html#configuration) and rely on the Lando produced `localhost` address

That said, the ideal scenario is to make sure your network is set up to not block `*.lndo.site` addresses.

For DD-WRT router firmware, look under the services tab in the admin interface for DNSMasq. In the `Additional DNSMasq Options` textarea, add `address=/lndo.site/127.0.0.1` and save the changes. When you start your app, your Appserver URLs should come up green.
