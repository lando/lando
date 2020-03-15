---
navbar: true
layout: LandoPage
title: Get Lando!
byline: Free yourself from the mind-forged manacles of lesser dev tools. Save time, headaches, frustration and do more real work.
metaTitle: Get Lando | Lando
description: Download Lando and take your local development and DevOps workflow to lightspeed.
image: https://raw.githubusercontent.com/lando/lando/master/docs/.vuepress/public/images/hero-pink.png

subscribe:
  title:
  customStyles:
    width: 40%
    margin-top: -100px
  groups:
    - NEWUSER
    - NEWSLETTER
---

<div class="step step-full">
  <div class="left">
    <div class="step-number"><p>1</p></div>
  </div>
  <div class="right">
    <h3>Download & Install Lando</h3>
    <div>
      <p>Head over to the releases section of our GitHub page and <a href="https://github.com/lando/lando/releases" target="_blank">download</a> the version that makes sense for your operating system.</p>
      <p>Double click the package in the download and consult the <a href="https://docs.lando.dev/basics/installation.html" target="_blank">documentation</a> if you have trouble.</p>
    </div>
  </div>
</div>

<div class="step step-full step-border hide-ender">
  <div class="left">
    <div class="step-number"><p>2</p></div>
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
<br />
<br />
<br />

<div class="step step-full step-border hide-ender">
  <div class="left">
    <div class="step-number"><p>3</p></div>
  </div>
  <div class="right">
    <h3>Get setup for success!</h3>
    <div>
      <p>We'll send you a welcome email with all you need to know to get the most out of Lando.</p>
      <p>This will also include things like code examples, helpful development and support resources, project updates and a monthly digest of helpful Lando blog posts.</p>
    </div>
  </div>
</div>
