export PATH=$HOME/.local/bin:$HOME/.nvm/versions/node/v22.23.4/bin:$PATH
B=~/b20-verify/533d8c7; R=$B/raw3; mkdir -p $R
cd $B/w3; rm -f probe.sh p1-out.txt
cp $B/fixed.mjs scripts/gate/agent-run-record.mjs
git add -A; git commit -q -m "fix: scaffold (F2T)"; git status --short | head
SID=11111111-2222-4333-8444-5555555555c1
echo "T2v3 $(date -u +%FT%TZ) template=$(git -C . log -1 --format=%h)" > $R/t2.txt
echo t2 > t2v3file.txt
cat > statprobe.sh <<'EOT'
git status --porcelain=v1 -uall -- .claude CLAUDE.md AGENTS.md context
EOT
timeout 240 claude -p "Run exactly: bash statprobe.sh > t2v3-status.txt 2>&1 ; git add t2v3file.txt && git commit -m 'test: t2v3'. Then reply DONE." --session-id $SID --allowedTools "Bash(bash statprobe.sh:*)" "Bash(git add:*)" "Bash(git commit:*)" --output-format json </dev/null 2>&1 | head -c 200 >> $R/t2.txt
echo >> $R/t2.txt
echo "--- log" >> $R/t2.txt; git log -1 --format=%B >> $R/t2.txt
echo "--- status during" >> $R/t2.txt; cat t2v3-status.txt >> $R/t2.txt
echo "--- status after" >> $R/t2.txt; git status --porcelain=v1 -uall -- .claude CLAUDE.md AGENTS.md context >> $R/t2.txt
echo "--- assets cmd (outside isolation)" >> $R/t2.txt; node scripts/gate/agent-run-record.mjs assets $SID >> $R/t2.txt 2>&1
echo "--- record" >> $R/t2.txt; cat .claude/agent-runs/$SID.json >> $R/t2.txt
cat $R/t2.txt
