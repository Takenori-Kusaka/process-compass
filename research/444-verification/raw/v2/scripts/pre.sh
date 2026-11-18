export PATH=$HOME/.local/bin:$HOME/.nvm/versions/node/v22.23.4/bin:$PATH
B=~/b20-verify/533d8c7; cd $B/w
cp $B/raw/t1.txt $B/raw/t1-uncommitted-init.txt
grep -o '"\(Edit\|Write\)([^"]*"' .claude/settings.json | tr '\n' ' '; echo
echo "hooksPath=$(git config core.hooksPath)"; ls -a .githooks
git status --short | head -20
git add -A; git commit -q -m "chore: process-init output"
git rev-parse HEAD
SID=11111111-2222-4333-8444-5555555555a1
timeout 120 claude -p "Reply with the single word OK" --session-id $SID --output-format json </dev/null 2>&1 | head -c 200 >/dev/null
cat .claude/agent-runs/$SID.json; git rev-parse HEAD
node -e "import('./scripts/gate/agent-run-record.mjs').then(m=>console.log(m.assetsDigest()))"
