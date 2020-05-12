---
description: Learn how to access your Lando sites from other devices on your network like mobile phones or tablets.
author:
  name: Team Lando
  twitter: devwithlando
date: 2019-11-05
---

# Accessing Lando from Other Devices on Your Local Network

<GuideHeader />
<YouTube url="" />

You may want to use another device (e.g., a smartphone or tablet) to test your Lando app.  You can access your lando app easily from another device as follows.

## lando share (Testing over the Internet)

The fastest way to do this is to use the [lando share](./../basics/share.html) command.  This will provide you with a URL that you can use to access your app via the Internet.  You can close the connection at any time by pressing a key in the terminal on your local machine.

## Changing the Bind

If you would rather test only on your local network and not over the Internet, you first need to change the `bindAddress` to expose your services on the LAN. Note that there are security implications to this and it is not recommended. Please consult the [Security Docs](./../config/security.md).

Once you've done that you can ...

### 1. First, get the IP address of the machine running lando.

#### Windows

Open a command prompt and enter the command `ipconfig /all` and look for the "IPv4 Address" for the network adapter you use to connect to the Internet.  Make sure NOT to use the IP address of the Docker network adapter.  It should be a number like `192.168.0.123`.

#### macOS

Open System Preferences, Network, and then choose the network adapter you are using to connect to the Internet (Ethernet or Wireless).  The local IP address will then be displayed.

#### Linux

Open a command prompt and enter the command `hostname -I | cut -d' ' -f1`.

### 2. Next, get the port of your lando app.

You can do this by running `lando info` from a command prompt and looking for the URL to your site, which should look something like this: `http://localhost:33333`.  In this case, `33333` is the port number.

You can now visit your lando app from other devices by going to `IP address: Port number`.  (Example: `http://192.168.0.123:33333`)

<GuideFooter />
<Newsletter />
