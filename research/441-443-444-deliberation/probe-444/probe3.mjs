import fs from 'node:fs';
import { execSync } from 'node:child_process';
const r = {};
const tryw = (k, p) => { try { fs.writeFileSync(p, 'probe\n', { flag: 'a' }); r[k] = 'WROTE'; } catch (e) { r[k] = 'DENIED ' + e.code; } };
tryw('claude_hooks', '.claude/hooks/x.mjs');
tryw('guard_json', '.claude/guard.json');
tryw('scripts_gate', 'scripts/gate/x.mjs');
tryw('workflows', '.github/workflows/x.yml');
tryw('process_config', 'process.config.json');
try { execSync('git -c user.email=p@example.invalid -c user.name=p commit -q --allow-empty -m sandboxed', { stdio: 'pipe' }); r.git_commit = 'OK'; } catch (e) { r.git_commit = 'FAIL ' + String(e.stderr).slice(0, 160); }
console.log(JSON.stringify(r));
