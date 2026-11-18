export PATH=$HOME/.local/bin:$HOME/.nvm/versions/node/v22.23.4/bin:$PATH
cd ~/b20-verify/533d8c7/w
R=~/b20-verify/533d8c7/raw; mkdir -p $R
SID=11111111-2222-4333-8444-555555555551
date -u +%FT%TZ > $R/t1.txt
echo "claude $(claude --version)" >> $R/t1.txt
timeout 120 claude -p "Reply with the single word OK" --session-id $SID --output-format json </dev/null 2>&1 | head -c 1500 >> $R/t1.txt
echo "--- ls" >> $R/t1.txt; ls -la .claude/agent-runs >> $R/t1.txt 2>&1
cat .claude/agent-runs/*.json >> $R/t1.txt 2>&1
echo "--- head" >> $R/t1.txt; git rev-parse HEAD >> $R/t1.txt
node -e "import('./scripts/gate/agent-run-record.mjs').then(m=>console.log(m.assetsDigest()))" >> $R/t1.txt
cat $R/t1.txt
