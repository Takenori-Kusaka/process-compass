export PATH=$HOME/.local/bin:$HOME/.nvm/versions/node/v22.23.4/bin:$PATH
cd ~/b20-verify/533d8c7/w; R=~/b20-verify/533d8c7/raw
SID=11111111-2222-4333-8444-555555555552
echo "T2b human commit (no env) $(date -u +%FT%TZ)" > $R/t2b.txt
env | grep -c CLAUDE_CODE_SESSION_ID >> $R/t2b.txt
echo h > hfile.txt; git add hfile.txt; git commit -q -m "human: commit" ; git log -1 --format=%B >> $R/t2b.txt
cat $R/t2b.txt
echo "T3 $(date -u +%FT%TZ)" > $R/t3.txt
sha256sum .claude/agent-runs/$SID.json >> $R/t3.txt
echo "# changed" >> CLAUDE.md
echo "t3" > t3file.txt
timeout 240 claude -p "Run exactly: git add t3file.txt && git commit -m 'test: t3'. Then reply DONE." --resume $SID --allowedTools "Bash(git add:*)" "Bash(git commit:*)" --output-format json </dev/null 2>&1 | head -c 300 >> $R/t3.txt
echo >> $R/t3.txt
sha256sum .claude/agent-runs/$SID.json >> $R/t3.txt
git log -1 --format=%B >> $R/t3.txt; ls .claude/agent-runs >> $R/t3.txt
echo "digest now (CLAUDE.md changed): $(node -e "import('./scripts/gate/agent-run-record.mjs').then(m=>console.log(m.assetsDigest()))")" >> $R/t3.txt
sed -i '$ d' CLAUDE.md
cat $R/t3.txt
