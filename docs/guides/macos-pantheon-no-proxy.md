---
date: 2019-11-05
---

# How to set up a Pantheon application without a proxy on macOS 10.12+

<GuideHeader />

This guide explains how to use a pantheon [lando](https://github.com/lando/lando) application without the proxy server on your local machine. Instead of using a proxy server, you will use `dnsmasq` and `pfctl` to port forward your lando application's webserver ports to 80 and 443.

> **Note:** you will have to perform some manual interactions for each lando application you create. See the instructions below.

1. First, install [homebrew](https://brew.sh)
2. Then, install and setup dnsmasq with homebrew:

    ```
    brew install dnsmasq
    echo 'address=/.lndo.site/127.0.0.1' > $(brew --prefix)/etc/dnsmasq.conf
    echo 'listen-address=127.0.0.1' >> $(brew --prefix)/etc/dnsmasq.conf
    echo 'port=35353' >> $(brew --prefix)/etc/dnsmasq.conf
    brew services start dnsmasq
    ```

3. While dnsmasq is running, configure macOS to use your local host for DNS queries ending in `.lndo.site`

    ```
    sudo mkdir -v /etc/resolver
    sudo bash -c 'echo "nameserver 127.0.0.1" > /etc/resolver/dev'
    sudo bash -c 'echo "port 35353" >> /etc/resolver/dev'
    ```

4. Disable lando's proxy in your local config file.

    ```
    touch ~/.lando/config.yml
    echo "proxy: OFF" >> ~/.lando/config.yml
    ```

5. [Set up your app with lando](https://docs.devwithlando.io/tutorials/basics.html). Make sure your application is stopped before proceeding.
6. Start your application using `lando start`.
7. In terminal, run the following command all at once:

    ```
    sudo bash -c 'export TAB=$'"'"'\t'"'"'
    cat > /Library/LaunchDaemons/co.jakebellacera.httpdfwd.plist <<EOF
    <?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
    <plist version="1.0">
    <dict>
    ${TAB}<key>Label</key>
    ${TAB}<string>co.lando.httpdfwd</string>
    ${TAB}<key>ProgramArguments</key>
    ${TAB}<array>
    ${TAB}${TAB}<string>sh</string>
    ${TAB}${TAB}<string>-c</string>
    ${TAB}${TAB}<string>echo "rdr pass proto tcp from any to any port {80,32787} -> 127.0.0.1 port 32787" | pfctl -a "com.apple/260.HttpFwdFirewall" -Ef - &amp;&amp; echo "rdr pass proto tcp from any to any port {443,32788} -> 127.0.0.1 port 32788" | pfctl -a "com.apple/261.HttpFwdFirewall" -Ef - &amp;&amp; sysctl -w net.inet.ip.forwarding=1</string>
    ${TAB}</array>
    ${TAB}<key>RunAtLoad</key>
    ${TAB}<true/>
    ${TAB}<key>UserName</key>
    ${TAB}<string>root</string>
    </dict>
    </plist>
    EOF'
    sudo launchctl load -Fw /Library/LaunchDaemons/co.lando.httpdfwd.plist
    ```

    > **NOTE:** this assumes your pantheon app's edge servers are assigned to the following ports: 32787 (http) and 32788 (https). In testing, these seemed to be the default ports that are assigned to pantheon applications. If you see different ports, or are not using a pantheon application configuration, then you may need to adjust the ports in the code snippet above.

8. In your /etc/hosts file, add an entry for your application's host name at localhost.

    ```
    127.0.0.1 example.lndo.site
    ```

    > **NOTE:** replace "example" in the hostname with the name of your application.

9. Finally, you should be able to access your application by the hostname you added to your /etc/hosts file in the step above without any ports. If you are having trouble, try turning off and on your wifi or reboot your machine so that your /etc/resolver settings are applied successfully.

<GuideFooter />
<Newsletter />
