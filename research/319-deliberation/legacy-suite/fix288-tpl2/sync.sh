#!/bin/sh
# usage: sync.sh <dir>  テンプレートの作業ツリーを LF で <dir> へ写し、知識ベースを標準側から作り直す
set -e
cd "$(dirname "$0")"
rm -rf "$1"; mkdir -p "$1"
(cd ../../template && tar cf - --exclude=.git --exclude=node_modules .) | (cd "$1" && tar xf -)
# CRLF → LF(テキストだけ)
find "$1" -type f \( -name '*.md' -o -name '*.mjs' -o -name '*.js' -o -name '*.json' -o -name '*.yml' -o -name '*.yaml' -o -name '*.sh' -o -name '*.template' -o -name '*.py' -o -name '.gitignore' -o -name 'CODEOWNERS' \) -exec sed -i 's/\r$//' {} +
node ../../scripts/build-template-kb.mjs --out "$1/scripts/vendor/tailoring-kb.json" >/dev/null
echo "synced $1"
