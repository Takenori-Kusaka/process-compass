export PATH=$HOME/.local/bin:$HOME/.nvm/versions/node/v22.23.4/bin:$PATH
cd ~/b20-verify/533d8c7/w; R=~/b20-verify/533d8c7/raw
SID=11111111-2222-4333-8444-555555555556
echo "T2c mid-run asset change $(date -u +%FT%TZ)" > $R/t2c.txt
timeout 240 claude -p "Run exactly: echo '# midrun' >> CLAUDE.md && git add CLAUDE.md && git commit -m 'test: t2c'. Then reply DONE." --session-id $SID --allowedTools "Bash(echo:*)" "Bash(git add:*)" "Bash(git commit:*)" "Bash(echo*)" --output-format json </dev/null 2>&1 | head -c 300 >> $R/t2c.txt
echo >> $R/t2c.txt; echo "--- log" >> $R/t2c.txt; git log -1 --format=%B >> $R/t2c.txt
echo "--- record" >> $R/t2c.txt; cat .claude/agent-runs/$SID.json >> $R/t2c.txt
cat $R/t2c.txt
