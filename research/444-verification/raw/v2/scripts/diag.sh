export PATH=$HOME/.local/bin:$HOME/.nvm/versions/node/v22.23.4/bin:$PATH
cd ~/b20-verify/533d8c7/w
git status --porcelain=v1 -uall -- .claude CLAUDE.md AGENTS.md .githooks scripts | head -20
node -e "import('./scripts/gate/agent-run-record.mjs').then(m=>console.log('uncommitted',m.assetsUncommitted(),'dirty',m.assetsDirty()))"
