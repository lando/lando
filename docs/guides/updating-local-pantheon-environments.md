---
title: Updating your Pantheon site from the latest DB backup
metaTitle: Updating your Pantheon site from the latest DB backup | Lando
description: Add this tool to catch your local dev environment up to date.
summary: Add this tool to catch your local dev environment up to date.
date: 2020-03-03T21:14:32.815Z
original: 
repo: 

author:
  name: Jason Purdy
  pic: https://www.gravatar.com/avatar/cb8c34b202e121d059c955433511f0b9
  link: https://twitter.com/jason_purdy

feed:
  enable: true
  author:
    - name: Jason Purdy
      email: alliance@lando.dev
      link: https://twitter.com/jason_purdy
  contributor:
    - name: Jason Purdy
      email: alliance@lando.dev
      link: https://twitter.com/jason_purdy
---

# Updating your Pantheon site from the latest DB backup

<GuideHeader test="" name="Jason Purdy" pic="https://www.gravatar.com/avatar/cb8c34b202e121d059c955433511f0b9" link="https://twitter.com/jason_purdy" />
<YouTube url="" />

I can't claim credit for this, but I wanted to share a really powerful and useful addition we add to our .lando.yml files in the tooling section. It should be said that this particular use case works for Drupal and Pantheon users.

```yaml
tooling:
  latest:
    service: appserver
    description: Updates the database from the latest backup
    cmd:
      - mkdir -p /app/artifacts
      - rm -f /app/artifacts/database.sql.gz
      - terminus backup:get site.env --element=db --to=/app/artifacts/database.sql.gz
      - database: cd /app && /helpers/sql-import.sh artifacts/database.sql.gz
      - drush cc all && drush en devel stage_file_proxy -y && drush sql-sanitize --sanitize-password="1234" --yes
```

For Drupal 8, we setup [config split](https://www.drupal.org/project/config_split) to handle separate development configurations, so our last line looks something like this:

```yaml
- cd /app/web && drush cr && drush sql-sanitize --sanitize-password="1234" --yes && drush cr && drush config-split:import config_dev -y
```

Once you add this, then you can type `lando latest` whenever you want to refresh your local environment to bring it up to date with the latest database backup.

The first time you run this, you may run into an issue where your environment cannot download the backup because you need to authenticate it with Pantheon. Basically, [create a machine token](https://dashboard.pantheon.io/machine-token/create) and then type `lando terminus auth:login --machine-token=[TOKEN]`. You may have multiple Drupal/Pantheon environments and you will need to authenticate each one, but you only need to do that once, even if you restart/rebuild the app.

 You could still use this for non-Pantheon cases, but you'll have to change the terminus command to something that grabs your latest database backup and copies it into the `artifacts` folder.

 You'll also want to add the `artifacts` folder to your `.gitignore` file so you don't commit any database backups.

<GuideFooter test="" original="" repo=""/>
<Newsletter />
