#!/usr/bin/env -S bash -e

if [ ! -d ../node_modules ]; then
  echo -e "🛠️ Installing packages\n"
  bun install
  echo
fi

echo -e "📌 Packages:\n"

_biome=^$(bun biome --version | cut -d " " -f 2)
export _biome
echo -e " • @biomejs/biome: $_biome"

_version=$(bun --version)
bun pm pkg set packageManager="bun@$_version" engines.bun="~$_version" > /dev/null 2>&1
_bun=$(jq -r .engines.bun ../package.json)
export _bun
echo -e " • Bun: $_bun"

if [ ! -f "../coverage/lcov.info" ]; then
  bun run test > /dev/null 2>&1
fi
_coverage=$(bun run lcov-total ../coverage/lcov.info)
export _coverage
echo -e "\n☂️  Coverage: $_coverage%"

echo -e "\n🛠️  Creating README.md..."

envsubst < README.template.md > ../README.md

echo -e "\n✔️  Done!\n"
