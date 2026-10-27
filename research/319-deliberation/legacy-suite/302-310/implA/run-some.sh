#!/bin/sh
# usage: sh run-some.sh <tpl2-dir> <outdir> <script:work> ...   回帰スイートの一部だけを流す(例: v3:v new:n tz:z)
cd "$1" || exit 2
out="$2"; shift 2
export PATH="$(pwd)/fakebin:$PATH" GH_LOG="$(pwd)/$out/gh.log"
mkdir -p "$out"
for p in "$@"; do
  s=${p%%:*}; w=${p##*:}
  ( cd suite && { [ "$w" = "-" ] || sh fresh.sh $w >/dev/null; } && timeout 1800 node $s.mjs > ../$out/$s.log 2>&1 ); echo "$s exit $?" | tee -a $out/summary.log
done
