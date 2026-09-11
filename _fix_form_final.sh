#!/usr/bin/env bash
# Restore original form format, apply MINIMAL group/role change only, then push.
set -e
cd /root/.openclaw/workspace/web-pp7

# 1) form-v2: restore ORIGINAL format (CEO role view + item 9 + question flow intact)
git checkout 451f481 -- succession-form-v2.html

# 2) apply minimal group fix (GAT=พี่อ๊อด, ADM=พี่เลี้ยง11+ใหม่6) — no question changes
python3 _form_fix.py

# 3) form-dashboard: restore to today's correctly-grouped version (undo accidental revert)
git checkout 3575f08 -- succession-form-dashboard.html

# 4) cleanup stray helper scripts (keep workspace tidy)
rm -f _diag_form.py _form_fix.py _final_fix.py 2>/dev/null || true

# 5) commit + push both branches
git add -A
git commit -q -m "fix: restore original form-v2 format (CEO view + item 9) with minimal group change only" || echo "nothing to commit"
git push origin main
git push origin main:gh-pages --force

echo "FIX_COMPLETE"
