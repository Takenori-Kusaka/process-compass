export PATH=$HOME/.local/bin:$HOME/.nvm/versions/node/v22.23.4/bin:$PATH
cd ~/b20-verify/533d8c7/w; R=~/b20-verify/533d8c7/raw
SID=11111111-2222-4333-8444-555555555558
echo "T2d $(date -u +%FT%TZ)" > $R/t2e.txt
echo d > t2efile.txt
timeout 240 claude -p "Run exactly: git status --porcelain=v1 -uall -- .claude CLAUDE.md AGENTS.md context > t2e-status.txt; git add t2efile.txt && git commit -m 'test: t2e'. Then reply DONE." --session-id $SID --allowedTools "Bash(git status:*)" "Bash(git add:*)" "Bash(git commit:*)" "Bash(git status*)" --output-format json </dev/null 2>&1 | head -c 100 >> $R/t2e.txt
echo >> $R/t2e.txt; echo "--- log" >> $R/t2e.txt; git log -1 --format=%B >> $R/t2e.txt
echo "--- status during" >> $R/t2e.txt; cat t2e-status.txt >> $R/t2e.txt 2>&1
echo "--- status after" >> $R/t2e.txt; git status --porcelain=v1 -uall -- .claude CLAUDE.md AGENTS.md context >> $R/t2e.txt
cat $R/t2e.txt
rm -f t2e-status.txt
