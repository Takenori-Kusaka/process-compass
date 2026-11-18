export PATH=$HOME/.local/bin:$HOME/.nvm/versions/node/v22.23.4/bin:$PATH
B=~/b20-verify/6c416e6
cd $B/w; git add -A; git commit -q -m wip
rm -rf $B/w1; cp -a $B/w $B/w1
node -e "const fs=require('fs');const p='$B/w1/.claude/settings.json';const s=JSON.parse(fs.readFileSync(p));s.sandbox.enabled=false;fs.writeFileSync(p,JSON.stringify(s,null,2))"
for d in $B/w $B/w1; do cd $d
 mkdir -p .github/rulesets .github/workflows adapters scripts/vendor scripts/gate
 for f in .github/rulesets/probe.json .github/workflows/probe.yml adapters/probe.json scripts/gate/probe.txt scripts/vendor/probe.txt scripts/vendor/probe2.txt; do echo base > $f; done
 mkdir -p .probe; cp /mnt/c/Users/kokor/AppData/Local/Temp/probe-s3.sh /mnt/c/Users/kokor/AppData/Local/Temp/probe-s2.mjs .probe/
done
