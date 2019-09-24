---
description: Learn how to handle file syncing issue when using Lando for local development.
---

# File syncing issues

There are generally a few causes of slow or stalled file sharing. Here are some workarounds and checks you can do in each circumstance.

## 1. Has my sync stalled or failed?

A common reason for a failed sync is that the docker filesharing daemon has crashed. You can resolve the latter by restarting the docker daemon itself.

## 2. Is my app located in a shared directory?

Your app needs to live inside of a shared drive or folder. Here are the following default shared drive/folder locations:

| OS | Shared Drives/Folders |
| -- | -- | -- |
| `Windows` | `C:\`  |
| `macOS` | `/Users`, `/Volumes`, `/tmp`, `/private` |
| `Linux` | `All the folders` |

Note that on macOS these need to be HARD LINKS. In other words, you cannot symlink `/Users` to `/SomethingElse` and expect it to work. This is often the case if you have an external drive.

Also note that you can add additional folders and shares to Windows/macOS through the Docker GUI.
