#!/bin/sh
# 反映 組A: 回帰スイート(tmp/fix288-tpl2)を複製して、変更前(template の HEAD)と変更後(作業ツリー)で流す準備
# suite は、組C が fixture(BASIS.detection の 3 欄、unit.mjs の相対パス)を直した複製 tmp/302-310/implC/tpl2-new/suite を元にする
# usage: sh tpl2-setup.sh <base|new> [suite の元のディレクトリ]
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../../.." && pwd)"
SRC="$ROOT/tmp/fix288-tpl2"
SUITE="${2:-$ROOT/tmp/302-310/implC/tpl2-new/suite}"
DST="$HERE/tpl2-$1"
rm -rf "$DST"
mkdir -p "$DST/suite/w"
cp "$SUITE"/*.mjs "$DST/suite/"
cp "$SRC"/suite/w/*.json "$DST/suite/w/" 2>/dev/null || true
cp -r "$SRC/fakebin" "$DST/fakebin"
cp "$SRC/mockgh.mjs" "$DST/"
cp "$SRC/runsuite.sh" "$SRC/runall2.sh" "$DST/"
cp "$ROOT/tmp/302-310/implC/tpl2-new/suite/fresh.sh" "$DST/suite/fresh.sh"

mkdir -p "$DST/tpl"
if [ "$1" = "base" ]; then
  # 変更前: template の HEAD(複製済みの知識ベースをそのまま使う)
  git -C "$ROOT/template" archive HEAD | tar xf - -C "$DST/tpl"
else
  # 変更後: template の作業ツリーと、標準の作業ツリーから作り直した知識ベース
  (cd "$ROOT/template" && tar cf - --exclude=.git --exclude=node_modules .) | (cd "$DST/tpl" && tar xf -)
  node "$ROOT/scripts/build-template-kb.mjs" --out "$DST/tpl/scripts/vendor/tailoring-kb.json" >/dev/null
fi
find "$DST/tpl" -type f \( -name '*.md' -o -name '*.mjs' -o -name '*.js' -o -name '*.json' -o -name '*.yml' -o -name '*.yaml' -o -name '*.sh' -o -name '*.template' -o -name '*.py' -o -name '.gitignore' -o -name 'CODEOWNERS' \) -exec sed -i 's/\r$//' {} +
echo "setup: $DST"
