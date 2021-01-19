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

Windows Development used to be something that caused most web developers agony and pain, but with the introduction of WSL, this is no longer quite so. With the introduction of WSL2, Microsoft has given us a near-native Linux experience for developing web applications using WSL2.

Long time Mac or Windows Lando users will be familiar with the long standing performance difficulties associated with file system access when using Docker in a non-linux host environment. WSL2 manages to bypass the majority of this performance penalty by never mounting your source code on a non-linux filesystem. Here is the best (highest performance) way to setup Docker (and Lando) on a Windows 10 machine in 2021:

## Pre-Req

You will want to make sure that if you have an existing Docker or WSL setup, that you are **not** using the Docker + WSL2 backend. If you have this setup, things are going to get funky and break. It is very sad, very frustrating, so if you are here, do yourself a favor and uninstall the Docker Desktop WSL2 backend.

You also need to ensure your machine supports virtualization (Vt-d, etc.). You don't need to have Windows 10 pro like the traditional Lando on Windows setup, as WSL doesn't require it.

## Get WSL2 rolling

The first thing we need to do is enable WSL2. to do so, open the start menu and search for "Turn Windows features on or off". In the resulting window, we want to check 'Windows Subsystem for Linux' and 'Virtual Machine Platform' and then click 'ok'. This starts the system installed for WSL and will ask us to restart after it downloads the stuff it needs. This really only gives you the WSL1 setup, and you need to download a kernel update to get WSL2 going, see the (Microsoft docs on installing the kernel update)[https://docs.microsoft.com/en-us/windows/wsl/install-win10#step-4---download-the-linux-kernel-update-package].

After you install the kernel update, make sure to launch a powershell and run `wsl --set-default-version 2` to default to WSL 2.

After installing the kernel update, its time to head to the Microsoft store and install a Linux distro. I am going to choose Ubuntu 18.04 LTS, since it is the most common distro for Lando users and our handy (Hyperdrive)[https://github.com/lando/hyperdrive] supports it.

## Jump into Hyperspace

After installing the latest LTS Ubuntu, using Hyperdrive makes the rest extremely easy. We simply lauch a bash shell in the WSL instance, follow the user setup process, and then follow the hyperdrive instructions. 

## Rules to keep your setup easy and happy

1. **never** run a lando app from within the default directory that WSL drops you into (`/mnt/c/Users/whateveruser`). This is the Windows filesystem mounted into your WSL instance, and it suffers from the filesystem performance issues that this setup avoids, therefore making going through the trouble of setting this up pointless.
2. You have to start Docker every time you start up the WSL2 instance. I just run `sudo service docker start` but you can probably do some `.bashrc` magic to do this automatically. This is because the WSL2 distros have no init system, so docker doesn't auto start.
3. VS Code is the absolute easiest editor to use with this setup. Microsoft has some extensions that make working with your WSL filesystem very easy. Vim/Neovim also work great, but using an editor like PHPStorm currently requires some extra setup if you want decent performance.

## Day to day development

You'll want to do all of your shell activity from within the WSL system, and you treat it generally just like a linux development box. You can run `code .` from the directory of any project you're working on and it will lauch VS Code, properly setup to develop within WSL. If you launch the terminal within WSL, it is going to work just like you expect and open the session within the WSL system.

## Some caveats

Performance is generally very good with this approach, however, stability can at times leave something to be be desired. Occassional freezes under heavy load are fairly common place, and seem to be resolved by rebooting the system. All things considered, the reduction in CPU load, battery drain, and the accompanied increase in the speed of every single action you take (accessing site pages, running any CLI commands) more than outweighs the disruption of these occasional issues for most users. Hopefully stability will continue to increase with time

<GuideFooter test="" original="" repo=""/>
<Newsletter />
