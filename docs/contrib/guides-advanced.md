---
description: Learn some advanced tricks for making Lando guides or tutorials
metaTitle: Advanced Lando guide docs | Lando
title: Advanced
---

# Advanced guide topics

## Adding a category

If you do not see a category that makes sense for your content while going through `lando guide:generate`, you can add a new category by modifying `docs/.vuepress/guides.json`.

Load up `docs/.vuepress/guides.json` in your favorite text editor. An empty category snippet you can add into the aforementioned `guides.json` is shown below:

```json
{
  "title": "New Category",
  "collapsable": false,
  "children": []
}
```

Make sure you save the file after your edit and also make sure that it [is still valid JSON](https://jsonlint.com/).

### Naming considerations

We highly recommend you first create new categories that match up with sidebar items over in the [config](./../config/lando.html) docs (e.g. _Backdrop_, _node_ or _Security_). This allows us to surface related guides in those sections which is very valuable. See the bottom of the [networking docs](./../config/networking.md) as an example.

However, if there is _still_ not an item over there that makes sense, then feel free to create something fresh.

### Clearing the tasks cache

Also make sure you clear the task cache for your new category to show up.

```bash
lando.dev --clear
lando.dev guide:generate
```
