#!/bin/sh
# usage: runall2.sh <outdir>  段2 の suite・stages・テンプレートの試験(偽の gh を PATH の先頭に置く)
cd "$(dirname "$0")"
export PATH="$(pwd)/fakebin:$PATH" GH_LOG="$(pwd)/$1/gh.log"
mkdir -p "$1"; : > "$1/summary.log"
sh runsuite.sh "$1"
( cd suite && sh fresh.sh st1 >/dev/null && sh fresh.sh st5 >/dev/null && sh fresh.sh st15 >/dev/null && timeout 1200 node stages.mjs > ../$1/stages.log 2>&1 ); echo "stages exit $?" | tee -a $1/summary.log
for t in test-check-delegation test-check-pr test-init-g5; do
  ( cd tpl && timeout 1200 node scripts/gate/$t.mjs > ../$1/$t.log 2>&1 ); echo "$t exit $?" | tee -a $1/summary.log
done
