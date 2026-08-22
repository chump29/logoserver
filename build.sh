#!/usr/bin/env -S bash -e

bun run lint
echo
./docs.sh

bun run build
