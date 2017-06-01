File syncing issues
-------------------

There are generally a few causes of slow or stalled file sharing. Here are some workaround and checks you can do in each circumstances.

### 1. Is my sync complete?

If you've just synced a large amount of files, as can be the case after a `npm install` you can check on the status of your sync by invoking docker directly.

```bash
# For an app named "myapp" with sharing enabled on a service called "web"
docker logs myapp_unisonweb_1
```

### 2. Has my sync stalled or failed?

There are two common reasons for a failed sync: the sharing container or docker filesharing daemon have crashed. You can resolve the former with a `lando restart` on your app. You can resolve the latter by restarting the docker daemon itself.

### 3. Is my app located in a shared directory?

Your app need to live inside of a shared drive or folder. Here are the following default shared drive/folder locations:

| OS | Shared Drives/Folders |
| -- | -- | -- |
| `Windows` | `C:\`  |
| `macOS` | `/Users`, `/Volumes`, `/tmp`, `/private` |
| `Linux` | `All the folders` |

Note that on macOS these need to be HARD LINKS aka you cannot symlink `/Users` to `/SomethingElse` and expect it to work. This is often the case if you have an external drive.

Also note that you can add additional folders and shares to Windows/macOS through the Docker GUI.

> #### Hint::Shared drives is a manual step on Windows
>
>  You will want to make sure you have [enabled shared drives](https://docs.docker.com/docker-for-windows/#/shared-drives).

