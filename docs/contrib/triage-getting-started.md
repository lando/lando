# Getting Started

Welcome intrepid Lando contributor! Thank you for joining the alliance and jumping on the front lines to triage issues!

Issue triage is incredibly important to the project. Good handling of issue reports from our users leads to folks sticking around and getting all the benefits that Lando has to offer, becoming contributors themselves, and improving the overall health and sustainability of the project.

When a user files an issue, they're probably either filled with hope and energy about improving the project, or frustration caused by their expectations not lining up with their experience. Both of these energies are valuable when channeled correctly, and damaging when mismanaged. 

Behind every issue is a person taking the time to fill out the report when they could have simply remained silent. They could have left their good ideas on the shelf, thrown Lando in the trash, or needlessly struggled in silence.

With all this in mind, treat issue reporters with respect, assume good will, and ask for clarification when needed. The extra energy you put in here to show kindness and compassion can be the difference between steering the project towards growth and sustainability or stagnation and burnout.

Now that you're equipped with the laser sword of empathy and the armor of respect, this is the standard procedure you should go through to triage an issue.

## Requirements

1. A Github account
2. [Install Lando](/basics/installation.html) (So you can reproduce issues)

## Classify the Issue

The first step in triaging an issue is to decide if the issue is a _bug report_, _feature request_, _documentation request_, or a _guide request_.

Our issue templates will hopefully help to pre-categorize issues for us, but use your discretion to recategorize issues that may have come in under the wrong label. It's not uncommon for a user to assume that their issue is a bug when it is really a need to improve documentation, or even for a user to assume they've done something wrong when they've actually just discovered a bug for us!

Review the issue and recategorize as necessary.

## Bug Reports

If the user is reporting that something isn't working as documented, or something generally appears to be broken, it should be classified as a bug report.

The first thing you want to do is to check the report against our [bug reporting template](https://github.com/lando/lando/blob/master/.github/ISSUE_TEMPLATE/bug_report.md). 

The most important thing we need for a good bug report are reliable steps to reproduce the issue. If the user has included steps to replicate, you should first try to replicate the bug. 

If you do nothing else, this is the most valuable thing you can do for Lando maintainers. It can sometimes be time consuming, but making sure we can replicate a bug saves massive amounts of time for the intrepid developer who attempts to fix the bug. It helps us to write clear functional tests and spend less time fixing the bug.

Once steps to reproduce have been ironed out, the issue should be tagged as `triaged`. 

If you can't reproduce the issue, tag it with `can not replicate` and let the user know that you are unable to replicate the issue. If you can think of additional information that might be helpful, request it in your comment. Non-reproducable issues will remain unscheduled until they are closed by a maintainer or stalebot.

## Feature Requests

If the user is asking for something that Lando currently doesn't do, this is a feature request. If the user wants Lando to add a new command to our API, a new service, recipe, tooling command, or support a new operating system we don't currently support, this is a feature request. 

Refer to the [feature request template](https://github.com/lando/lando/blob/master/.github/ISSUE_TEMPLATE/feature_request.md) to see what kind of data we want from the user. If their report is missing one of these areas, it might be helpful to ask them questions about the areas that need clarification.

New feature requests will be regularly reviewed by the maintainers and scheduled, iceboxed, or closed as appropriate, as long as the request is something you can understand, it can be reviewed by a maintainer at a later date. If it seems unclear, it would be helpful to ask clarifying questions from the requester so that the issue is fully fleshed out when a maintainer is able to review it.

## Documentation Requests

Documentation requests should be tagged with `documentation` and checked against the [documentation issue template](https://github.com/lando/lando/blob/master/.github/ISSUE_TEMPLATE/documentation.md).

If a reference page isn't included, try to find the right page in the documentation that addresses the topic at hand and add a link to the page in the issue. If there is no suitable page, a new one will need to be created.

## Guides

Some documentation requests might actually be [guide](/contrib/guides-intro.html#what-is-a-guide) requests in disguise. 

If the requester is looking for the answer to a specific technical question like "How do I run Behat tests using Chromedriver with Lando?", the issue should be classified as a guide request (and tagged with `guide`).

In some instances, the user might actually have more subject matter expertise than the contributor team. In the example above, using Behat and Chromedriver, asking the user to describe how they have possibly setup this workflow outside of Lando might be a clue that helps someone eventually contribute the guide that will help with this request in the future. 

It also may be helpful to provide links to existing documentation that provides some building blocks for the ultimate use case being described (for example, giving the Behat user above a link to our compose documentation, service overrides documentation, and tooling documentation). Doing this can provide the raw materials they need to forge the solution so they can come back and write the guide themselves.

## Extra Credit

We use an application called [Zenhub](https://zenhub.com) to help track and schedule Lando issues. Zenhub is free and if you register, you can see the current state of any issues. We use a fairly standard set of swim lanes to schedule work. If you are curious about the state of an issue, you can get more details here.
