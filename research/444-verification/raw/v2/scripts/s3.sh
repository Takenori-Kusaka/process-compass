set -e
B=~/b20-verify/533d8c7; rm -rf $B; mkdir -p $B
git clone -q /mnt/e/Github/orca/workspace/process-compass/b20/template $B/src
mkdir $B/w; cd $B/src; tar --exclude=.git --exclude=node_modules -cf - . | tar -xf - -C $B/w
cd $B/w
sed -i 's/@OWNER\b/@tester/g' .github/CODEOWNERS
git init -q -b main; git config user.email t@example.com; git config user.name tester; git config core.autocrlf false
git add -A; git commit -q -m "chore: template"
cat > $B/answers.json <<'J'
{"q-team-size":"size-1-2","q-biz-phase":"poc","q-external-reviewer":"reviewer-no","q-quality":"quality-standard","q-criticality":"cl0","q-dev-form":"inhouse","q-existing-gates":"gates-none","q-ai-constraint":"ai-free"}
J
node scripts/init/generate-profile.mjs --answers $B/answers.json --stack node --template-commit 533d8c70d492a2e1cec0403f08d6a2f66fc5c1a1 2>&1 | tail -15
git status --short | head -20
