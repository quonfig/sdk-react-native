# Table of Contents

- [How to Contribute](#how-to-contribute)
  - [Reporting Issues](#reporting-issues)
  - [Building Package](#building-package)
  - [Running Tests](#running-tests)
  - [Sending Pull Requests](#sending-pull-requests)
  - [Other Ways to Contribute](#other-ways-to-contribute)

# How to Contribute

Thanks for your interest in contributing to `@quonfig/react-native`! Here are a few general
guidelines on contributing and reporting bugs that we ask you to review. Following these guidelines
helps to communicate that you respect the time of the contributors managing and developing this open
source project. In return, they should reciprocate that respect in addressing your issue, assessing
changes, and helping you finalize your pull requests. In that spirit of mutual respect, we endeavour
to review incoming issues and pull requests within 10 days.

## Reporting Issues

Before reporting a new issue, please ensure that the issue was not already reported or fixed by
searching through our [issues list](https://github.com/quonfig/sdk-react-native/issues).

When creating a new issue, please be sure to include a **title and clear description**, as much
relevant information as possible, and, if possible, a test case.

## Dependencies

- [NodeJS: v24.4.1](https://github.com/asdf-vm/asdf-nodejs)

  ```sh
   asdf plugin add nodejs https://github.com/asdf-vm/asdf-nodejs.git
   asdf install nodejs 24.4.1
  ```

- [Yarn: v4.11.0](https://yarnpkg.com/getting-started/install)

  ```sh
  npm install -g corepack
  corepack enable
  corepack prepare yarn@4.11.0 --activate
  ```

## Installing Package Dependencies

```sh
yarn install
```

This installs the published `@quonfig/react` from npm. The `devDependencies` entry is a plain npm
range that matches the `peerDependencies` floor — not a `portal:`/`file:`/`link:` reference to the
sibling `../sdk-react` directory. A published range is what lets Dependabot's isolated, single-repo
npm updater resolve the full dependency tree (see qfg-zu8o).

### Developing against a local `../sdk-react`

When you need to test sdk-react-native against an unpublished change in the sibling `sdk-react`
repo, link it explicitly instead of editing `package.json`:

```sh
# from the sdk-react repo, point a link at this repo
yarn link --all --relative ../sdk-react-native
```

`yarn link` records the override in `.yarn/` build state, not in `package.json`, so it does not leak
into commits or break Dependabot. Run `yarn install` in `sdk-react-native` afterward to drop the
link and return to the published package.

## Building Package

```sh
yarn build
```

## Running Tests

```sh
yarn test
```

## Sending Pull Requests

Before sending a new pull request, take a look at existing pull requests and issues to see if the
proposed change or fix has been discussed in the past, or if the change was already implemented but
not yet released.

We expect new pull requests to include tests for any affected behavior, and, as we follow semantic
versioning, we may reserve breaking changes until the next major version release.

## Other Ways to Contribute

We welcome anyone that wants to contribute to `@quonfig/react-native` to triage and reply to open
issues to help troubleshoot and fix existing bugs. Here is what you can do:

- Help ensure that existing issues follows the recommendations from the
  _[Reporting Issues](#reporting-issues)_ section, providing feedback to the issue's author on what
  might be missing.
- Review and update the existing content of our [README](./README.md) with up-to-date instructions
  and code samples.
- Review existing pull requests, and testing patches against real existing applications that use
  `@quonfig/react-native`.
- Write a test, or add a missing test case to an existing test.

Thanks again for your interest on contributing to `@quonfig/react-native`!

:heart:
