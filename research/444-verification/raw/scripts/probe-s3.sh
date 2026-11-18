#!/bin/bash
# S3: write from the shell to each Edit/Write deny path (10 lines). Files are pre-created by setup.
for p in .claude/settings.json .claude/guard.json .claude/hooks/guard-write.mjs process.config.json .github/rulesets/probe.json .github/workflows/probe.yml adapters/probe.json scripts/gate/probe.txt scripts/vendor/probe.txt scripts/vendor/probe2.txt; do
  b=$(sha256sum "$p" 2>/dev/null | cut -c1-12); [ -z "$b" ] && b=ABSENT
  e=$( { echo x >> "$p"; } 2>&1 ); rc=$?
  a=$(sha256sum "$p" 2>/dev/null | cut -c1-12); [ -z "$a" ] && a=ABSENT
  if [ "$b" = "$a" ]; then v=UNCHANGED; else v=CHANGED; fi
  echo "S3 $p rc=$rc before=$b after=$a $v err=$(echo "$e" | head -c 80 | tr '\n' ' ')"
done
