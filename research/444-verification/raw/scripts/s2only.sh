export PATH=$HOME/.local/bin:$HOME/.nvm/versions/node/v22.23.4/bin:$PATH
B=~/b20-verify/6c416e6; R=$B/raw
B0=~/b20-verify/6c416e6; rm -f $B0/outside.txt $B0/outside-home.txt $B0/w/.githooks/probe $B0/w/inside.txt; for L in w:S2; do
 d=${L%%:*}; n=${L##*:}; cd $B/$d
 echo "$n $d $(date -u +%FT%TZ) sandbox.enabled=$(node -e "console.log(require('./.claude/settings.json').sandbox.enabled)")" > $R/$n.txt
 timeout 240 claude -p "Run exactly this command with the Bash tool and print its full stdout verbatim: node .probe/probe-s2.mjs" --allowedTools "Bash(node .probe/probe-s2.mjs)" --output-format json </dev/null 2>&1 | node -e "let s='';process.stdin.on('data',c=>s+=c).on('end',()=>{const l=s.split('\n').filter(x=>x.startsWith('{'));try{const j=JSON.parse(l[l.length-1]);console.log(j.result)}catch(e){console.log(s.slice(0,1500))}})" >> $R/$n.txt
 echo "--- files on disk after:" >> $R/$n.txt
 for f in inside.txt ../outside.txt $B/outside-home.txt .claude/settings.local.json .git/hooks/probe-hook .githooks/probe .claude/settings.json.probe; do [ -e $f ] && echo "EXISTS $f" >> $R/$n.txt || echo "ABSENT $f" >> $R/$n.txt; done
 for f in .claude/settings.json .claude/guard.json scripts/gate/probe.txt .github/workflows/probe.yml; do echo "$f lines-with-probe: $(grep -c '^probe$' $f)" >> $R/$n.txt; done
 cat $R/$n.txt
done
rm -f $B/outside.txt $B/outside-home.txt
