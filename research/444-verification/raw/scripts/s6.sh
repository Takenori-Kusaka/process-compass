export PATH=$HOME/.local/bin:$HOME/.nvm/versions/node/v22.23.4/bin:$PATH
B=~/b20-verify/6c416e6; R=$B/raw; cd $B/w
node scripts/gate/aggregate-evidence.mjs >.probe/a-plain.out 2>&1; echo "plain-shell aggregate rc=$?" | tee -a $R/self.txt
cp .probe/a.out $R/self-aggregate-sandboxed.out; cp .probe/a-plain.out $R/self-aggregate-plain.out
echo "diff sandboxed vs plain: $(diff .probe/a.out .probe/a-plain.out | wc -l) lines" | tee -a $R/self.txt
grep -ci "read-only\|EROFS\|EACCES\|denied" .probe/a.out | sed 's/^/denial-keywords in sandboxed output: /' | tee -a $R/self.txt
grep -c '::error::' .probe/a.out | sed 's/^/error lines: /'
