# dartanalyzer-annotations-action

Creates [annotations](https://developer.github.com/v3/checks/runs/) from dartanalyzer output.
This action requires installed `dartanalyzer` - you can provide it by adding another action for example [flutter-action](https://github.com/subosito/flutter-action).
Recommended is to use with one of the lint rulesets: 
- [effective_dart](https://pub.dev/packages/effective_dart)
- [pedantic](https://pub.dev/packages/pedantic)


## Inputs

### `check_name`

**Required** The name of the check run to add annotations to. This should be the same as the job that uses this action.

### `commit_sha`

**Required** Commit to attach the check to. If the trigger is `push`, this should just be `github.sha`. If the trigger is `pull_request`, this should be the `github.event.pull_request.head.sha`.


## Example usage

On pull requests branch:

```
name: Run lint on pull requests
on:
  pull_request:
    branches: [ develop ]

jobs:
  lint:
    name: Check code style
    runs-on: ubuntu-latest
    steps:
      - name: Checkout source code
        uses: actions/checkout@v2
      - name: Install Flutter
        uses: subosito/flutter-action@v1
        with:
          channel: 'stable'
      - name: Get packages in a Flutter project
        run: flutter pub get
      - name: Run lint
        uses: kitek/dartanalyzer-annotations-action@v1  
        env:
          GITHUB_TOKEN: ${{ github.token }}
        with:
          check_name: 'Check code style'
          commit_sha: ${{ github.event.pull_request.head.sha }}

```

On develop branch:

```
name: Build and release app to beta testers

on:
  push:
    branches: [ develop ]
jobs:
  build-android:
    name: Build Android App
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Action
        uses: actions/checkout@v2
      - name: Install Flutter
        uses: subosito/flutter-action@v1
        with:
          channel: 'stable'
      - name: Get packages in a Flutter project
        run: flutter pub get
      - name: Run lint
        uses: kitek/dartanalyzer-annotations-action@v1  
        env:
          GITHUB_TOKEN: ${{ github.token }}
        with:
          check_name: 'Build Android App'
          commit_sha: ${{ github.sha }}

```

## Example output:

![alt text](https://raw.githubusercontent.com/kitek/dartanalyzer-annotations-action/master/doc-assets/checks.jpg?v=2)


