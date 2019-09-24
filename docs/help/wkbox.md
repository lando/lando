---
description: Learn about using Lando with Kalabox.
---

## Using Lando with Kalabox

While Lando is in many ways the successor project to Kalabox it is actually a completely different project that can run side by side with a users existing Kalabox... with a few caveats.

*  If you've turned Kalabox on first, you should be able to reliably start up any Lando app.
*  If you've turned Lando on first (and it is bound to port 80) you will likely not be able to turn on Kalabox.
*  If you've started Docker in prep for using Lando but haven't started Kalabox, there may still be Kalabox containers running. Run 'docker ps' to see running containers then run 'docker kill' and the id of the Kalabox container to get your ports back for Lando.

To get around this restriction you should always `lando poweroff` before attempting to activate Kalabox.
