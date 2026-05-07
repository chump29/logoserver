#!/usr/bin/env -S bash -e

clear

# ! NOTE: Using NPM because Bun does not include README.md in metadata for Verdaccio

npm unpublish --force

npm version --no-git-tag-version patch

bun run build

npm publish ./dist
