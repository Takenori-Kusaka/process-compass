#!/bin/sh
# usage: fresh.sh <name>   テンプレートの複製(../tpl。sync.sh で作る)から作業用の複製を作り、git の基準点を置く
set -e
cd "$(dirname "$0")"
rm -rf "w/$1"
mkdir -p "w/$1"
(cd ../tpl && tar cf - --exclude=.git --exclude=node_modules .) | (cd "w/$1" && tar xf -)
cd "w/$1"
git init -q -b main . 2>/dev/null
git config user.email t@example.com; git config user.name tester; git config core.autocrlf false
git add -A >/dev/null 2>&1; git commit -q -m "chore: template" >/dev/null 2>&1
echo "fresh: $1"
