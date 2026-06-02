#!/usr/bin/env -S bash -e

clear

npm unpublish --force || :

bun pm version patch --no-git-tag-version

./build.sh

npm publish ./dist --ignore-scripts
