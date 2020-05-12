---
description: Learn how to remove a Lando guide or tutorial
metaTitle: Removing a guide to Lando | Lando
---

# Removing a guide

Removing a guide is currently a manual two-step process.

## 1. Remove the markdown file

Navigate to the source directory and remove the guide.

```bash
# From the lando source root
cd docs/guides
rm -f name-of-guide.md
```

## 2. Remove from the sidebar

Load up `docs/.vuepress/guides.json` in your favorite text editor. A snippet of the aforementioned `guides.json` is shown below:

We've highlighted the guide we want to remove.

```json{6}
[
  {
    "title": "Databases",
    "collapsable": false,
    "children": [
      "db-import",
      "db-export"
    ]
  },
]
```

After removal

```json{6}
[
  {
    "title": "Databases",
    "collapsable": false,
    "children": [
      "db-export"
    ]
  },
]
```

Make sure you save the file after your edit and also make sure that it [is still valid JSON](https://jsonlint.com/).
