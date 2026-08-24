#!/usr/bin/env -S bash -e

echo -e "📌 Packages:\n"

_bun=$(jq -r '.engines.bun // "❓"' ../package.json)
export _bun
echo -e " • Bun: $_bun"

echo -e "\n🧪 Running tests…"
bun run --bun test:coverage

_coverage=0
if [ -f "../tests/coverage/lcov.info" ]; then
  _coverage=$(bun run lcov-total ../tests/coverage/lcov.info)
fi
export _coverage
echo -e "\n☂️  Coverage: $_coverage%"


echo -e "\n🛠️  Creating README.md..."

envsubst < README.template.md > ../README.md

echo -e "\n✔️  Done!\n"
