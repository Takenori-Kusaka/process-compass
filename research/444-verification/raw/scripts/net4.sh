for u in https://registry.npmjs.org/ https://github.com/ https://api.github.com/ https://example.com/; do printf '%s ' "$u"; curl -sS -m 8 -o /dev/null -w '%{http_code}\n' "$u" 2>&1 | tail -1; done
