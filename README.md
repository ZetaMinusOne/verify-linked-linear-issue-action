# Verify Linked Linear Issue Action

[![GitHub Super-Linter](https://github.com/ZetaMinusOne/verify-linked-linear-issue-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/ZetaMinusOne/verify-linked-linear-issue-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/ZetaMinusOne/verify-linked-linear-issue-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/ZetaMinusOne/verify-linked-linear-issue-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/ZetaMinusOne/verify-linked-linear-issue-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/ZetaMinusOne/verify-linked-linear-issue-action/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

A GitHub action that verifies your pull request contains a reference to a 
Linear issue. 

On a PR that does not include a linked Linear issue placed by the Linear bot,
the check should fail and a comment will be added to the PR.


## Installation

### As a part of an existing workflow
``` yaml
- name: Verify Linked Issue
  uses: ZetaMinusOne/verify-linked-linear-issue-action@v0
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Pleasure ensure the following types on the pull_request triggers:
```yaml
  pull_request:
    types: [edited, synchronize, opened, reopened]
```

### As a separate workflow
* Ensure you have the folder .github/workflows
* In .github/workflows, place the 
[pr_verify_linked_issue.yml](example/pr_verify_linked_issue.yml) workflow.


## Trying it out

* Create a new pull request and take care to not include a linked item or 
mention an issue.
* The build should fail.
* Edit the PR body or title and add a reference to a valid issue (e.g. LNR-123 )
