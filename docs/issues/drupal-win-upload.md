Uploading Files on Drupal
-------------------------

When uploading files in Lando (esp on Windows), you may see an error like the following:

```
The upload directory private://TESTDIR for the file field field_TESTFIELD could not be created or is not accessible. A newly uploaded file could not be saved in this directory as a consequence, and the upload was canceled.
```

This error is caused by a bug in Drupal core. To perform file uploads in Lando, [apply the latest version of this patch](https://www.drupal.org/node/944582).
