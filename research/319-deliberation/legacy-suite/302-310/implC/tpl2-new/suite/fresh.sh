#!/bin/sh
set -e
cd "$(dirname "$0")"
rm -rf "w/$1"
mkdir -p "w/$1"
(cd ../tpl && tar cf - --exclude=.git --exclude=node_modules .) | (cd "w/$1" && tar xf -)
cd "w/$1"
git init -q -b main .
top="$(git rev-parse --show-toplevel)"
here="$(pwd -W 2>/dev/null || pwd)"
if [ "$top" != "$here" ]; then echo "fresh: 最上位が作業用の複製でない($top / $here)。中止"; exit 9; fi
git config user.email t@example.com; git config user.name tester; git config core.autocrlf false
git add -A >/dev/null 2>&1; git commit -q -m "chore: template" >/dev/null 2>&1
echo "fresh: $1"
