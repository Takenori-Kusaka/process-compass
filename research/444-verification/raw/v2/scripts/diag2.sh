cd ~/b20-verify/533d8c7/w
for s in 552 554 556 557; do grep -H '"assets"\|"base"' .claude/agent-runs/11111111-2222-4333-8444-555555555$s.json; done
