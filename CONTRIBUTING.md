# How to contribute

## Deploy a new version
Only the maintainers of the repo can deploy a new version

### Deploy a regular release
1. Make sure that you are on the `master` branch
2. Figure out what the `<new-version-number>` will be
3. Update the [changelog](./CHANGELOG.md) so that all the yet unreleased changes are grouped under the `<new-version-number>`
4. Run: `$> git commit -m "doc: updated changelog"`
5. Run: `$> yarn version --new-version <new-version-number>"`
6. Run: `$> git push`
7. Run: `$> git push --tags`
8. Go to the GitHub Releases and create a new release from the pushed tag and with the `<new-version-number>` and include the changes from the changelog

### Deploy a tagged npm release
This is useful if you would like to create a `next` or `beta` release.

1. Run: `$> yarn publish . --tag <tag-name>`
