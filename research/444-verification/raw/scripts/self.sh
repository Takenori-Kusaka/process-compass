cd "$(dirname "$0")/.."
echo x > selfcheck.txt; git add selfcheck.txt; git commit -q -m "test: self"; echo "commit rc=$?"; git log -1 --format=%B | head -4
node scripts/gate/next.mjs >.probe/n.out 2>&1; echo "next.mjs rc=$?"
node scripts/gate/aggregate-evidence.mjs >.probe/a.out 2>&1; echo "aggregate-evidence.mjs rc=$?"; 
