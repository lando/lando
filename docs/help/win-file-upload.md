---
description: Learn about weird file upload issues when using Lando for local development especially while using Drupal on Windows.
---

# Uploading Files in Windows

::: tip Probably fixed in 3.0.0-rc.2+
It is likely this issue has been resolved in Lando `3.0.0-rc.2` but let's keep these docs around for awhile just in case
:::

When uploading files via PHP and potentially other things in Lando on Windows you may see an error like the following:

```
The upload directory private://TESTDIR for the file field field_TESTFIELD could not be created or is not accessible. A newly uploaded file could not be saved in this directory as a consequence, and the upload was canceled.
```

## The Problem

The `tl;dr` is `php` will incorrectly assume a writable directory mounted by Docker Desktop is in fact not writable.

This seems to be caused by a convergence of two factors:

1. How Docker Desktop uses `SMB` to mount files
2. How the built in php function [`is_writable`](http://php.net/manual/en/function.is-writable.php) behaves

[This comment](https://github.com/wodby/docker4drupal/issues/29#issuecomment-316055081) while Drupal in flavor is helpful for a deeper dive on things.

If you are interested in replicating the issue yourself you should be able to do something like:

1. `lando start` a Drupal flavored app you have
2. Log in as an admin
3. Spin up a content type that has an image field
4. Create a new piece of content for that content type
5. Add a first image (this should succeed)
6. Add a second image (this should fail)

The Drupal core `includes/file.inc` file contains a function `file_prepare_directory`. This function is called on each file upload. If the upload is in a directory that does not yet exist, the directory is created, its writability is assumed and the upload succeeds. However, if a file upload is done in a directory that already exists then php's built-in function `is_writable` is used. This will fail for non-root users.

## The Solutions

### Using nginx (recommended)

Running the `php` instance as the `root` user seems to allow `is_writable` to function as expected and alleviates the issue described above. As of `beta.38` Lando will run `nginx` flavored `php` as `root` on Windows by default since this has no other known negative side effects.

**If you are experiencing this issue we recommend you upgrade to `beta.38+` and make sure your Lando app is using `nginx` instead of `apache`.**

Running `apache` as `root` is currently not supported. See [this issue](https://github.com/docker-library/httpd/issues/48) if you are interested in trying to get Docker to support `run-as-root` capable `apache` as this would provide full out-of-the-box coverage for this issue.

### Patching Your Code

If switching to `nginx` is not an option then it's possible the framework you are using (eg Drupal or Laravel) may have already identified this issue and supplied a patch to help. For example [this](https://www.drupal.org/node/944582) may be relevant for Drupal 7.

A Google search for `Docker Desktop file sharing MYFRAMEWORK` is probably a good way to start.
