for f in .claude/agents .claude/commands .claude/launch.json .claude/loop.md .claude/output-styles .claude/routines .claude/scheduled_tasks.json .claude/workflows context/_archive/README.md; do stat -c '%n %F size=%s' $f 2>&1; done
ls -la context/_archive
git status --porcelain=v1 -uall -- .claude CLAUDE.md AGENTS.md context
git ls-files context/_archive
