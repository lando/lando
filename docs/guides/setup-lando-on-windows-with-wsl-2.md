---
title: Setup Lando on Windows with WSL2
metaTitle: Setup Lando on Windows with WSL2 | Lando
description: Configure Lando to run on your Windows WSL2 system for better performance when developing on Windows.
summary: Configure Lando to run on your Windows WSL2 system for better performance when developing on Windows.
date: 2021-01-19T14:21:27.061Z
original: 
repo: 

author:
  name: Dustin LeBlanc
  pic: https://www.gravatar.com/avatar/e61caccbbfd817bc8b52c0395ba888a6
  link: https://twitter.com/DustinLeblanc

feed:
  enable: true
  author:
    - name: Dustin LeBlanc
      email: dustin@dustinleblanc.com
      link: https://twitter.com/DustinLeblanc
  contributor:
    - name: Dustin LeBlanc
      email: alliance@lando.dev
      link: https://twitter.com/DustinLeblanc
---

# Setup Lando on Windows with WSL2

<GuideHeader test="" name="Dustin LeBlanc" pic="https://www.gravatar.com/avatar/e61caccbbfd817bc8b52c0395ba888a6" link="https://twitter.com/DustinLeblanc" />
<YouTube url="" />

Developing on Windows used to cause web developers agony and pain, but with the introduction of WSL, this is no longer quite so. WSL2 provides a near-native Linux experience for developing web applications on Windows computers.

Longtime Mac or Windows Lando users will be familiar with the performance difficulties associated with file system access when using Docker in a non-linux host environment. Traditionally, running Docker on Mac or Windows requires a virtual machine environment. Sharing files across the boundary between your native OS and the Linux OS running within this virtual environment creates significant performance issues.

WSL2 manages to bypass the majority of this performance penalty by never mounting your source code on a non-Linux filesystem. Here is the best (highest performance) way to setup Docker (and Lando) on a Windows 10 machine in 2021:

## Prerequisites

**1. Uninstall Pre-existing Docker + WSL2 Backend**
You will want to make sure that, if you have an existing Docker or WSL setup, you are **not** using the Docker + WSL2 backend. If you have this setup, [you're going to have a bad time](https://www.youtube.com/watch?v=ynxPshq8ERo). It is very sad, very frustrating, so if you are here, do yourself a favor and uninstall the Docker Desktop WSL2 backend.

**2. Make Sure Your Machine Supports Virtualization**
You also need to ensure your machine supports virtualization (Vt-d, etc.). If you're not sure, you can [check this in Task Manager](https://www.shaileshjha.com/how-to-find-out-if-intel-vt-x-or-amd-v-virtualization-technology-is-supported-in-windows-10-windows-8-windows-vista-or-windows-7-machine). You don't need to have Windows 10 Pro like the traditional Lando on Windows setup, as WSL doesn't require it.

## Get WSL2 rolling

The first thing we need to do is enable WSL2. To do so...

1. Open the start menu and search for "Turn Windows features on or off".
2. In the resulting window, check 'Windows Subsystem for Linux' and 'Virtual Machine Platform' and then click 'ok'. This starts the system installed for WSL and will ask us to restart after it downloads the stuff it needs. This really only gives you the WSL1 setup. To get WSL2...
3. Download a kernel update to get WSL2 going. see the [Microsoft docs on installing the kernel update](https://docs.microsoft.com/en-us/windows/wsl/install-win10#step-4---download-the-linux-kernel-update-package).
4. After you install the kernel update, launch a powershell and run `wsl --set-default-version 2` to default to WSL 2.
5. Head to the Microsoft store and install a Linux distro. I am going to choose [Ubuntu 18.04 LTS](https://www.microsoft.com/en-us/p/ubuntu-1804-lts/9n9tngvndl3q), since it is the most common distro for Lando users and our handy [Hyperdrive](https://github.com/lando/hyperdrive) supports it.

## Jump into Hyperspace

After installing the latest LTS Ubuntu, using Hyperdrive makes the rest extremely easy. We simply launch a bash shell in the WSL instance, follow the user setup process, and then follow the Hyperdrive instructions in your terminal.

## Rules to keep your setup easy and happy

1. **Never** run a Lando app from within the default directory that WSL drops you into (`/mnt/c/Users/whateveruser`). This is the Windows filesystem mounted into your WSL instance, and it suffers from the filesystem performance issues that this setup avoids, therefore making going through the trouble of setting this up pointless.
2. You have to start Docker every time you start up the WSL2 instance. Running `lando start` should automatically start Docker, but if you need to initialize Docker for non-Lando purposes, try running `sudo service docker start`. This is because the WSL2 distros have no init system, so Docker doesn't auto start.
3. VS Code is the absolute easiest editor to use with this setup. Microsoft has some extensions that make working with your WSL filesystem very easy. Vim/Neovim also work great, but using an editor like PHPStorm currently requires some extra setup if you want decent performance.

## Day to day development

You'll want to do all of your shell activity from within the WSL system, and you treat it like a separate Linux development box. You can run `code .` from the directory of any project you're working on and it will lauch VS Code, properly setup to develop within WSL. If you launch the terminal within WSL, it is going to work just like you expect and open the session within the WSL system.

## Some caveats

Performance is generally very good with this approach, however, stability can at times leave something to be be desired. Occassional freezes under heavy load are fairly commonplace, and seem to be resolved by rebooting the system. All things considered, the reduction in CPU load, battery drain, and the accompanied increase in the speed of every single action you take (accessing site pages, running any CLI commands) more than outweighs the disruption of these occasional issues for most users. Hopefully stability will continue to increase with time.

<GuideFooter test="" original="" repo=""/>
<Newsletter />
