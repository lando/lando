ssh
===

Allows the user to ssh into a specific service of their app.

Optionally a user can run a command directly against a specific service without dropping into a shell. If you find yourself running a lot of these commands then set up a [tooling route](./../config/tooling.md) or use some bash aliases.

> #### Hint::What are my services called?
>
> Try running `lando info` from inside your app to get a list of services you can `ssh` into.

### Usage

```bash
# Drop into a shell on the appserver from an app directory or its subdirectories
lando ssh appserver

# Drop into a shell for the database for myapp
lando ssh myapp database

# List all the files in the root directory of the appserver
lando ssh appserver -c "ls -ls /"
```

### Options

```bash
  --help, -h     Show help                                             [boolean]
  --command, -c  Run a command in the service
```
