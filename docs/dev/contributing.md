Contributing
============

Here are some guidelines for contributing to the Lando project.

Working with Code
-----------------

To work directly on Lando code you will want to [install from source](./../installation/installing.html#from-source).

Creating Issues
---------------

**ALL ISSUES** for the lando should be created on the main [lando project page](https://github.com/lando/lando/issues).

Once you create an issue please follow the guidelines that are posted as the first comment on your issue.

Issue tags
----------

Here is a list of the tags we use on our issues and what each means.

#### Issue tags

*   **bug fix** - The issue indicates a buggy feature that needs to be fixed.
*   **documentation** - The issue wishes to improve documentation.
*   **improvement** - The issue indicates improvement to an existing feature.
*   **feature** - The issue contains new proposed functionality.
*   **task** - The issue indicates a non-code related task.

Epic Guidelines
---------------

An issue should be expressed as an epic if it satisfies the following two critera

1.  A feature which is best expressed as more than one issue.
2.  Each sub-issue is shippable by itself.

Submitting Fixes
----------------

Perform all of your work in a forked branch of lando, preferably named in the convention `[issue number]-some-short-desc`. Please also prefix your commits with a relevant issue number if applicable ie

`#314: Adding pi to list of known trancendental numbers`

When you feel like your code is ready for review open a pull request against the lando repository. The pull request will auto-generate a checklist of things you need to do before your code will be considered merge-worthy.

Please always reference the main lando issue in your commit messages and pull requests using the `lando/lando#issue-number` syntax.
