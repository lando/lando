Project Vision
==============

This document serves as a high level set of considerations that maintainers should reference and attempt to adhere to while making decisions.

While it doesn't need to be strictly interpretted it does serve, more or less, as both manifesto and set of core values.

Why Does Lando Exist?
---------------------

> A user should be able to `git clone` a repository, run `lando start` and get **EVERYTHING** they need to develop their site locally in a few minutes.

Lando's primary purpose is to be the fastest and least painful way for developers or teams of developers to spin up the services, tools and automation tasks they need to develop their projects locally. It aims to accomplish this through a single, checked-into-version-control, YAML-based configuration file called `.lando.yml`, which lives in a project's root directory.

**This means that Lando is essentially local development dependency management handled on a per-project basis.**

More specifically, Lando is a free, open source, cross-platform, local development environment and DevOps tool built on Docker container technology and written in NodeJS. It is designed to work with most major languages, frameworks and services, and provide an easy way for developers of all types to specify simple or complex requirements for their projects, and then quickly get to work on them.

With Lando you should be able to...

  * Closely mimic your production environment and DevOps toolchain locally.
  * Standardize your teams local experience on OSX, Windows and Linux.
  * Integrate with hosting providers like Pantheon or build complex DevOps pipelines
  * Use Lando in continuous integrations environments to minimize setup time and mimic local
  * Easily customize or extend tooling, deployment options and basically any other functionality.
  * Free yourself from the tyranny of inferior local development products.

Lando is not a a magic pill to solve local development, nor is it a replacement for a badly designed application. Lando is a tool that requires at least some level of skill and expertise to use.

What is the Goal of Lando?
--------------------------

Lando aims to be the only, or primary, local development and DevOps tool you need for **ALL** your projects.

How Do We Develop and Design Lando?
-----------------------------------

Here are the top 10 design and development principles we use when making Lando that help keep us focused on Lando's core purpose, filter out noise, traps and common dev pitfalls while maximimzing project survivability.

#### 1. Minimalism

Less is more. We seek to use the least amount of code and dependencies to accomplish a given feature or objective. This makes the project more maintainable in the long run. New dependencies should not be introduced to the project without careful discussion and consideration.

Read we like to make sure [CodeClimate](https://codeclimate.com/github/lando/lando) doesn't get too upset with us.

#### 2. Deliberation

It's easy to add in every seemingly small and benign feature or pull request from every user. But each added feature means more potential for support churn and thus less work on advancing the project's stated goals.

Features should be added when they serve a stated design goal or objective or are overwhelmingly supported by the community. It is very important to assess whether each feature is going to be more trouble than its worth or if it furthers the projects stated goals.

#### 3. Unobtrusiveness

If Lando cannot do something out of the box without editing a users's codebase then it's something the user needs to set up on their own. It is extremely difficult to provide a simple, consistent and reliable codebase edits that work for a majority of users. Often these code edits change frequently and are hard to maintain. Documentaton and examples are the way to go here.

#### 4. User Space

Once the user has completed the initial Lando installaton they should never need to use `sudo` or admin rights to run anything else Lando related. Prompting a user continually for a password is annoying and editing system things that require `sudo` rights is a recipe for disaster.

#### 5. Upstreams

Attempting to provide big Lando-based workarounds for significant issues in upstream projects can be a huge time suck. If Lando absolutely requires a dependency with problems then we need to be comfortable indicating to our users that the problem exists there and that it needs to be solved there.

#### 6. Documentation

Great documentation and examples are often the things that make an open source project successful. We care about having extensive, well written and intuitively organized documentation.

#### 7. Project Management

Well defined milestones and a Kanban board can go a long way to triaging and prioritizing issues. This focuses current sprints, generates a healthy backlog and icebox and keeps issues and tasks tidy, manageable and not overwhelming.

We also like to [use robots](https://probot.github.io/apps/) to help keep our issues and pull requests tidy. See [this](https://github.com/probot/stale#is-closing-stale-issues-really-a-good-idea) for the benefits of issue automation.

#### 8. Value

Tackling "low hanging fruit" issues that are easy to test, solve and that impact many users keeps project morale high.

#### 9. Testing

Writing unit and functional tests should be done whenever is possible

#### 10. Fun

You are working on a project named after a fucking Star Wars character! Try to keep code comments, docs and other things fun!

Audience
---------

Lando is built primarily for professional developers working as freelancers or part of a dev team. The ideal Lando on ramp is for a DevOps person to design the `.lando.yml` file and a basic `README` for each project and to distribute those things to their other developers.

Other Things to Consider
------------------------

1. Community morale and growth is important and sometimes that means betraying some of the above
2. Expectation management is a thing, don't write a check you or Lando can't cash
3. Time is our scare resource let's make sure we use it as efficiently as possible
4. There are traps and temptations everywhere, stay upon the path of righteousness
