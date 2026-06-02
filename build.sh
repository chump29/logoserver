#!/usr/bin/env -S bash -e

bun run lint
echo
bun run test
echo
./docs.sh

bun run build
