#!/usr/bin/env -S bash -e

clear

npm unpublish --force || :

./build.sh

bun pm version patch --no-git-tag-version

npm publish ./dist --ignore-scripts
