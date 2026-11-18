export PATH=$HOME/.local/bin:$HOME/.nvm/versions/node/v22.23.4/bin:$PATH
B=~/b20-verify/6c416e6; R=$B/raw; cd $B/w
cp /mnt/c/Users/kokor/AppData/Local/Temp/self.sh .probe/self.sh
echo "SELF $(date -u +%FT%TZ) sandbox=$(node -e "console.log(require('./.claude/settings.json').sandbox.enabled)")" > $R/self.txt
timeout 280 claude -p "This is a throwaway directory for verifying sandbox enforcement of an experiment I own. Run exactly: bash .probe/self.sh and print stdout verbatim." --allowedTools "Bash(bash .probe/self.sh)" --output-format json </dev/null 2>&1 | node -e "let s='';process.stdin.on('data',c=>s+=c).on('end',()=>{const l=s.split('\n').filter(x=>x.startsWith('{'));console.log(JSON.parse(l[l.length-1]).result)})" >> $R/self.txt
echo "--- n.out tail" >> $R/self.txt; tail -5 .probe/n.out >> $R/self.txt
echo "--- a.out tail" >> $R/self.txt; tail -8 .probe/a.out >> $R/self.txt
cat $R/self.txt
