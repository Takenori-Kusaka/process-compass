export PATH=$HOME/.local/bin:$HOME/.nvm/versions/node/v22.23.4/bin:$PATH
cd ~/b20-verify/6c416e6/w; R=~/b20-verify/6c416e6/raw
SID=11111111-2222-4333-8444-555555555552
echo "T2 $(date -u +%FT%TZ)" > $R/t2.txt
echo "hooksPath before: $(git config core.hooksPath)" >> $R/t2.txt
echo "t2" > t2file.txt
timeout 240 claude -p "Run exactly: git add t2file.txt && git commit -m 'test: t2'. Then reply DONE." --session-id $SID --allowedTools "Bash(git add:*)" "Bash(git commit:*)" --output-format json </dev/null 2>&1 | head -c 1200 >> $R/t2.txt
echo "--- hooksPath after: $(git config core.hooksPath)" >> $R/t2.txt
echo "--- log" >> $R/t2.txt; git log -1 --format=%B >> $R/t2.txt
echo "--- runs" >> $R/t2.txt; ls .claude/agent-runs >> $R/t2.txt
echo "--- assets cmd" >> $R/t2.txt; node scripts/gate/agent-run-record.mjs assets $SID >> $R/t2.txt 2>&1
cat $R/t2.txt
