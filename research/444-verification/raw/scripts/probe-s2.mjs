import fs from 'node:fs';
import { execSync } from 'node:child_process';
const r = {};
const tryw = (k, p) => { try { fs.writeFileSync(p, 'probe\n', { flag: 'a' }); r[k] = 'WROTE'; } catch (e) { r[k] = 'DENIED ' + e.code; } };
tryw('inside_cwd', 'inside.txt');
tryw('outside_cwd', '../outside.txt');
tryw('home_outside', process.env.HOME + '/b20-verify/6c416e6/outside-home.txt');
tryw('settings_json', '.claude/settings.json');
tryw('settings_local', '.claude/settings.local.json');
tryw('git_hooks', '.git/hooks/probe-hook');
tryw('githooks_dir', '.githooks/probe');
tryw('guard_json', '.claude/guard.json');
tryw('scripts_gate', 'scripts/gate/probe.txt');
tryw('workflows', '.github/workflows/probe.yml');
for (const [k, u] of [['net_registry','https://registry.npmjs.org/'],['net_github','https://github.com/'],['net_api_github','https://api.github.com/'],['net_example','https://example.com/']]) {
  try { r[k] = execSync(`curl -sS -m 8 -o /dev/null -w '%{http_code}' ${u}`, { encoding: 'utf8', stdio: ['ignore','pipe','pipe'] }); } catch (e) { r[k] = 'FAIL ' + String(e.stderr || e.message).replace(/\n/g,' ').slice(0, 120); }
}
console.log(JSON.stringify(r, null, 1));
