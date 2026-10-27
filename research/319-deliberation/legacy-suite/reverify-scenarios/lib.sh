# 再検証の補助。source して使う
RV=/e/Github/process-compass/tmp/reverify-scenarios
fresh() { rm -rf "$RV/w/$1"; cp -r "$RV/base" "$RV/w/$1"; (cd "$RV/w/$1" && git init -q -b main && git add -A && git -c user.name=tester -c user.email=t@example.com commit -qm init); }
clone() { rm -rf "$RV/w/$2"; cp -r "$RV/w/$1" "$RV/w/$2"; }
# d0 <work> <version>: D-0 体制図を置く(frontmatter を埋める)
d0() { local f="$RV/w/$1/docs/D-0-governance.md"; [ -f "$f" ] || cp "$RV/w/$1/templates/00-d0-governance.md" "$f";
  sed -i -E "s/^version:.*/version: $2/; s/^approver:.*/approver: 山田 太郎/; s/^approved_at:.*/approved_at: 2026-09-30/; s/^approval_scope:.*/approval_scope: 全体/; s/^next_review:.*/next_review: 2027-03-31/" "$f"; }
gp() { local w="$1"; shift; (cd "$RV/w/$w" && echo "\$ node scripts/init/generate-profile.mjs $*" && node scripts/init/generate-profile.mjs "$@"; echo "[exit $?]"); }
vc() { local w="$1"; shift; (cd "$RV/w/$w" && echo "\$ node scripts/gate/verify-gate-contract.mjs $*" && node scripts/gate/verify-gate-contract.mjs "$@"; echo "[exit $?]"); }
cd0() { (cd "$RV/w/$1" && echo "\$ node scripts/gate/check-d0.mjs" && node scripts/gate/check-d0.mjs; echo "[exit $?]"); }
cpr() { (cd "$RV/w/$1" && echo "\$ node scripts/gate/check-process-rules.mjs" && node scripts/gate/check-process-rules.mjs; echo "[exit $?]"); }
ae() { local w="$1"; shift; (cd "$RV/w/$w" && echo "\$ node scripts/gate/aggregate-evidence.mjs $*" && node scripts/gate/aggregate-evidence.mjs "$@"; echo "[exit $?]"); }
cfg() { (cd "$RV/w/$1" && node -e "const c=require('./process.config.json');const pick=($2);console.log(JSON.stringify(pick(c),null,1))"); }
# 出力から「なし」だけの節と定型の行を落とす(証拠の要点だけを残す)
trim() { node -e '
const lines=require("fs").readFileSync(0,"utf8").split(/\r?\n/).filter(l=>l.trim()&&!/較正引き継ぎ|\[プロセス構成\]|人へ戻る判定件数の見込み/.test(l));
const out=[];for(let i=0;i<lines.length;i++){const l=lines[i];if(/^## /.test(l)&&/^- (なし|構成の変更なし)$/.test(lines[i+1]??"")&&!/構成の差分/.test(l)){i++;continue;}out.push(l);}
console.log(out.join("\n"));'; }
# chg <work> <名前> <<JSON ... : 入力を in/ へ保存して適用する
chg() { local w="$1" n="$2"; shift 2; cat > "$RV/in/$n.json"; echo "--- 入力 in/$n.json: $(tr -d '\n' < "$RV/in/$n.json" | cut -c1-700)"; gp "$w" --change "$RV/in/$n.json" "$@" 2>&1 | trim; }
# brief: 残作業・候補・再判定の節を落として、差分と向きと拒否だけを残す
brief() { node -e '
const drop=/残作業|無効になった確認の候補|兼務禁止と独立性の再判定/;
const lines=require("fs").readFileSync(0,"utf8").split(/\r?\n/);const out=[];let skip=false;
for(const l of lines){ if(/^## /.test(l)) skip=drop.test(l); else if(/^(\[|wrote|--- |\$ |### |::|契約検査|{|}| )/.test(l)) skip=false; if(!skip&&!/^wrote|^\$ node scripts\/init/.test(l)) out.push(l.length>420?l.slice(0,420)+"…":l);}
console.log(out.join("\n"));'; }
chgb() { chg "$@" | brief; }
