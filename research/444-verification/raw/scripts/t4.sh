export PATH=$HOME/.local/bin:$HOME/.nvm/versions/node/v22.23.4/bin:$PATH
cd ~/b20-verify/6c416e6/w; R=~/b20-verify/6c416e6/raw
SID=11111111-2222-4333-8444-555555555554
echo "T4 $(date -u +%FT%TZ)" > $R/t4.txt
ls .claude/agent-runs > $R/t4-before.txt
echo "t4" > t4file.txt
timeout 300 claude -p "Use the Agent tool (subagent_type general-purpose) to launch one subagent. The subagent must run exactly: git add t4file.txt && git commit -m 'test: t4' and report the result. Do not run git yourself." --session-id $SID --allowedTools "Bash(git add:*)" "Bash(git commit:*)" "Agent" --output-format json </dev/null 2>&1 | head -c 600 >> $R/t4.txt
echo >> $R/t4.txt
echo "--- before:" >> $R/t4.txt; cat $R/t4-before.txt >> $R/t4.txt
echo "--- after:" >> $R/t4.txt; ls .claude/agent-runs >> $R/t4.txt
git log -3 --format='%h %s%n%b' >> $R/t4.txt
cat $R/t4.txt
