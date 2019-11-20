---
navbar: true
metaTitle: Get Lando | Lando
description: Download Lando and take your local development and DevOps workflow to lightspeed.
image: https://raw.githubusercontent.com/lando/lando/master/docs/.vuepress/public/images/hero-pink.png
---

# Get Lando!

Lando is and always will be _**free**_ and _**open source**_.

<div class="step">
  <div class="left">
    <div class="step-number"><p>1</p></div>
  </div>
  <div class="right">
    <h3>Download Lando</h3>
    <div>
      <p>Head over to the releases section of our GitHub page and <a href="https://github.com/lando/lando/releases" target="_blank">download</a> the version that makes sense for your operating system.</p>
    </div>
  </div>
</div>

<div class="step">
  <div class="left">
    <div class="step-number"><p>2</p></div>
  </div>
  <div class="right">
    <h3>Install Lando</h3>
    <div>
      <p>Installing is as simple as double clicking on the package you just downloaded but definitely consult the <a href="https://docs.lando.dev/basics/installation.html" target="_blank">documentation</a> for complete instructions and troubleshooting info.</p>
    </div>
  </div>
</div>

<div class="step hide-ender">
  <div class="left">
    <div class="step-number"><p>3</p></div>
  </div>
  <div class="right">
    <h3>Spin up your first app</h3>
    <div>
      <p>Try spinning up a basic <em>Hello World!</em> app before spinning up <a href="https://docs.lando.dev/basics/first-app.html" target="_blank">more complex apps</a> or trying any of our <a href="https://github.com/lando/lando/tree/master/examples" target="_blank">myriad examples</a>.
      </p>
    </div>
  </div>
</div>

```bash
# Create a new directory for this example and enter it
mkdir hello && cd hello

# And add a nice homepage
echo "<h1>Lando says hellooo what have we here?</h1>" > index.html

# Initialize a basic LAMP stack using the cwd as the source
lando init --source cwd --recipe lamp --webroot . --name hello-lando

# Start it up
lando start
```
<div class="step"></div>

<div class="step">
  <div class="left">
    <div class="step-number"><p>4</p></div>
  </div>
  <div class="right">
    <h3>Join the movement to liberate developers everywhere</h3>
    <div>
      <p>Help us keep Lando by and for developers everywhere by supporting <a href="https://lando.dev/alliance/join/" target="_blank">our movement</a> to liberate developers from dev monotony so they can focus on their most important work.
      </p>
    </div>
    <div>
      <a class="button big" href="/alliance/join/">JOIN THE ALLIANCE!</a>
    </div>
  </div>
</div>


That said, it takes a considerable amount of time to maintain, support and grow Lando. If you like Lando and think it's valuable we'd _highly encourage_ you to [join _The Lando Alliance_](/alliance/join/) and return some of that value to help support our movement to liberate developers everywhere.

We're down to keep solving DevOps for everyone and with your support we can.

