# Automatic screenshot comparison

What we ideally want:

* Run comparison on CI
* Run comparison on a local working copy
* Have an graphic UI for comparison and approval
* Associate baseline with a specific commit (as opposed to having one baseline per repo)


Survey of screenshot-based CSS testing tools: https://gist.github.com/cvrebert/adf91e429906a4d746cd

In wix-incubator we also have a few projects:

https://github.com/wix-incubator/puppeteer-eyes.it
https://github.com/wix-incubator/match-screenshot
https://github.com/wix-incubator/match-screenshot-jest
https://github.com/wix-incubator/with-eyes

All of them use local Chrome for taking screenshots, and Applitools Eyes for baseline storage and comparison.

The problem with running Chrome locally is that there are significant differences between MacOS/Windows/Linux in rendering of native UI controls, scrollbars and fonts. We could solve the problem with native UI controls by simply not using them, or styling them to look identical, but there's no good solution for normalizing font rendering.

Possible solutions:

1. Sacrifice running comparisons on a local working copy, run them only on CI for the master branch and PRs like we do now. We would still have the problem of how to tie the baseline to a specific commit, and how to update the baseline for the master branch automatically when a new commit (pre-approved in a PR) is added.

2. Run Puppeteer locally/remotely in a Docker container.

3. Create a web service that you can send the test bundle to and it will return the screenshots.

4. Instead of saving screenshots to the baseline, save the static HTMLs that we took those screenshots from. Then the screenshot tool can load the baseline HTML, and the corresponding HTML page generated from the working copy, take screenshots of both, and compare them. The main issue here is generating the baseline HTML in a form that can be efficiently stored in git repo. I.e. not having a single 5MB bundle with all components, styles, and dependencies that changes on every commit.
