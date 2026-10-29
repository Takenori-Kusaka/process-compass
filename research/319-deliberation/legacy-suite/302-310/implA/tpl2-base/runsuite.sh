#!/bin/sh
# usage: runsuite.sh <outdir>  h3a のスイートを実行する(各スクリプトの前に fresh.sh を通す)
cd "$(dirname "$0")"
mkdir -p "$1"
for p in v3:v v3b:v2 scenarios:s new:n replay:r tz:z acquire:a matrix:m unit:-; do
  s=${p%%:*}; w=${p##*:}
  ( cd suite && { [ "$w" = "-" ] || sh fresh.sh $w >/dev/null; } && timeout 1800 node $s.mjs > ../$1/$s.log 2>&1 ); echo "$s exit $?" | tee -a $1/summary.log
done
