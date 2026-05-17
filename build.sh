#!/usr/bin/env -S bash -e

clear

bun run lint
echo
bun run test
echo
./docs.sh

bun run build
