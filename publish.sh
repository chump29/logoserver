#!/usr/bin/env -S bash -e

clear

./build.sh

bun pm version patch --no-git-tag-version

npm unpublish --force || :

npm publish ./dist --ignore-scripts
