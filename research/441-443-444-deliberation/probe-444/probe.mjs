import fs from 'node:fs';
import { execSync } from 'node:child_process';
const r = {};
const tryw = (k, p) => { try { fs.writeFileSync(p, 'probe\n', { flag: 'a' }); r[k] = 'WROTE'; } catch (e) { r[k] = 'DENIED ' + e.code; } };
tryw('inside_cwd', 'inside.txt');
tryw('outside_cwd', '../outside.txt');
tryw('settings_json', '.claude/settings.json');
tryw('settings_local', '.claude/settings.local.json');
tryw('git_hooks', '.git/hooks/probe-hook');
try { r.net = execSync("curl -sS -m 8 -o /dev/null -w '%{http_code}' https://example.com", { encoding: 'utf8', stdio: ['ignore','pipe','pipe'] }); } catch (e) { r.net = 'FAIL ' + String(e.stderr || e.message).slice(0, 160); }
console.log(JSON.stringify(r));
