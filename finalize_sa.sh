#!/bin/bash
set -e
cd /root/.openclaw/workspace/web-pp7
OUT=/root/.openclaw/workspace/web-pp7/SA_TO_SA_FINAL.txt
: > "$OUT"

echo "STEP1 data.js idempotent fix" >> "$OUT"
python3 - << 'PYEOF'
import io
for p in ['prg-pdg-data.js', 'prg-pdg-69-data.js']:
    s = io.open(p, encoding='utf-8').read()
    s = s.replace('GM ÷ SA', 'GM ÷ S&A')
    io.open(p, 'w', encoding='utf-8').write(s)
    print(p, 'S&A_new=', s.count('GM ÷ S&A'), 'SA_old=', s.count('GM ÷ SA'))
PYEOF
echo "STEP1 done" >> "$OUT"

echo "STEP2 extract main script + node --check" >> "$OUT"
python3 - << 'PYEOF'
import io, re, subprocess
s = io.open('prg-pdg-dashboard.html', encoding='utf-8').read()
scripts = re.findall(r'<script>([\s\S]*?)</script>', s)
main = next(sc for sc in scripts if 'PRG/PDG Dashboard' in sc)
open('/tmp/main_script.js', 'w', encoding='utf-8').write(main)
r = subprocess.run(['node', '--check', '/tmp/main_script.js'], capture_output=True, text=True)
print('NODE_CHECK_EXIT=', r.returncode)
if r.stderr:
    print('NODE_STDERR=', r.stderr[:300])
# leftover display SA labels
left = []
for i, line in enumerate(s.split('\n'), 1):
    if 'SA' not in line: continue
    if 'PKG_DATA' in line: continue
    if re.search(r'\.sa\b|saPer|sa2568|sa2569|saByMonth|momSA|pctSA|totalSA|pSA|sumM\(|\'sa\'|"sa"|const sa|let sa|var sa|saPct', line): continue
    st = line.strip()
    if st.startswith('*') or st.startswith('//') or st.startswith('/*'): continue
    left.append((i, st[:80]))
print('LEFT_DISPLAY_SA=', len(left))
for i, t in left:
    print(i, t)
PYEOF
echo "STEP2 done" >> "$OUT"

echo "STEP3 git add/commit/push" >> "$OUT"
git add -A
if git diff --cached --quiet; then
  echo "NO_CHANGES_TO_COMMIT" >> "$OUT"
else
  git commit -m "fix(dashboard): change label SA -> S&A (selling & administrative expenses) per Pakorn definition" >> "$OUT" 2>&1
fi
git push origin main >> "$OUT" 2>&1
echo "FULL_HASH=$(git rev-parse HEAD)" >> "$OUT"
echo "SHORT_HASH=$(git rev-parse --short HEAD)" >> "$OUT"
echo "ALL_DONE" >> "$OUT"
