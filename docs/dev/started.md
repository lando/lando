Getting Started
===============

This section of documentation serves as a guide to help people who wish to contribute code get used to how the Lando source repo works.

Forking and Installing Lando From Source
----------------------------------------

In order to help contribute code you will likely need to get Lando running from source. **All subsequent documentation in this section assume you have done this!**

1. If you are not a Lando committer with write access to the [official repo](https://github.com/lando/lando) start by [forking the aforementioned repo](https://help.github.com/articles/fork-a-repo/)
2. Follow the [install from source instructions](./../installing/installing.md#from-source) using either the [official repo](https://github.com/lando/lando) or your fork.
3. Read through the [contribution section](./../contrib/contributing.md) to get a sense of how things work.

Contributing Code
-----------------

Lando uses a modified [GitHub Flow](https://guides.github.com/introduction/flow/) development model. You can read more about this process in the aforementioned link but the general flow is:

  1.  Choose a ticket or issue from the [ZenHub board](https://github.com/lando/lando#boards) of the project you are working on.
  2.  Open a new branch from `master` in the form `ISSUENUMBER-BRIEFDESCRIPTION` to work on that issue
  3.  Add commits to this branch with message form `#ISSUENUMBER: COMMIT DESCRIPTION`
  4.  Push the `git push {REMOTE} {ISSUENUMBER-BRIEFDESCRIPTION}` when work is complete
  5.  [Open a pull request](https://help.github.com/articles/creating-a-pull-request/)

Before opening a PR its a good idea to

  * Run [tests locally](./testing.md)
  * Pull in the latest code from `master` with `git pull origin master`
  * Make sure you have looked at the [PR checklist](https://github.com/lando/lando/blob/master/.github/PULL_REQUEST_TEMPLATE.md)

**NEVER EVER EVER EVER PUSH ANYTHING DIRECTLY TO THE MASTER BRANCH!!!**
