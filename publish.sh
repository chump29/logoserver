#!/usr/bin/env -S bash -e

clear

_version=$(bun --version)
bun pm pkg set packageManager="bun@$_version" engines.bun="~$_version" > /dev/null 2>&1

bun pm version patch --no-git-tag-version

./build.sh

npm unpublish --force

# ! NOTE: Using npm because the following command throws: EISDIR: failed to read tarball: './dist'
#bun publish ./dist --ignore-scripts
npm publish ./dist --ignore-scripts
