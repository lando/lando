Running Lando behind a Firewall
===============================

If you are pulling container images and seeing errors like "Error while pulling image: Get `https://index.docker.io/v1/repositories/devwithlando/proxy/images:` x509: certificate signed by unknown authority" in your macOS/Linux installer log then you might be behind a network proxy or firewall that is preventing you from pulling the needed Lando dependencies.

Check out [https://github.com/kalabox/kalabox/issues/1635](https://github.com/kalabox/kalabox/issues/1635) for more details on that issue.
