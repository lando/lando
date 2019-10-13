---
description: Learn about using VirtulBox concurrently when using Lando for local development, especially on Windows.
---

# Windows is also running VirtualBox

In some cases you cannot use VirtualBox, a common development virtualization tool, with Hyper-V. The **tl;dr** there is:

> VirtualBox and Hyper-V cannot co-exist on the same machine. Only one hypervisor can run at a time, and since Hyper-V runs all the time, while VirtualBox only runs when it is launched, VirtualBox is the loser in this scenario.

Luckily, there is a documented workaround you can check out over at
[https://derekgusoff.wordpress.com/2012/09/05/run-hyper-v-and-virtualbox-on-the-same-machine/](https://derekgusoff.wordpress.com/2012/09/05/run-hyper-v-and-virtualbox-on-the-same-machine/)
