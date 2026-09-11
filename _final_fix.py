#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# Final alignment: plan-dashboard ADM card (section 3) should reflect
# ADM = ทีมเดิม(พี่เลี้ยง 11) + ทีมใหม่(6) ทำงานร่วม Co-Ownership.
import io

p = "succession-plan-dashboard.html"
with io.open(p, encoding='utf-8') as f:
    s = f.read()

orig = s
log = []

# 1) ADM badge in section 3
old_badge = '<span class="rec-badge bg-white text-sky-700">🚀 ADM — ทีมบริหารใหม่ (ทีมใหม่)</span>'
new_badge = '<span class="rec-badge bg-white text-sky-700">🚀 ADM — ทีมเดิม (พี่เลี้ยง) + ทีมใหม่ (ทำงานร่วม)</span>'
if old_badge in s:
    s = s.replace(old_badge, new_badge)
    log.append("HIT  ADM badge")
else:
    log.append("MISS ADM badge")

# 2) ADM subtitle
old_sub = '<span class="rec-badge bg-sky-900/40 text-sky-100 border border-sky-400/40">อำนาจเบื้องต้น → เพิ่มขึ้นตามเงื่อนไข</span>'
new_sub = '<span class="rec-badge bg-sky-900/40 text-sky-100 border border-sky-400/40">ทีมเดิม ถ่ายทอด/Mentor + ทีมใหม่ รับ Empowerment</span>'
if old_sub in s:
    s = s.replace(old_sub, new_sub)
    log.append("HIT  ADM subtitle")
else:
    log.append("MISS ADM subtitle")

# 3) ADM description line
old_desc = '<p class="text-sm text-sky-100">ทีมบริหารชุดใหม่ที่กำลังรับช่วงต่อ — รับ Empowerment และความรับผิดชอบเพิ่มขึ้นตามลำดับ เมื่อผ่านเงื่อนไขการถ่ายทอดบทบาท</p>'
new_desc = ('<p class="text-sm text-sky-100">ทีมเดิม (พี่เลี้ยง อดีต GAT 11 คน) ทำงานคู่กับทีมใหม่ (ADM 6 คน) ด้วย Co-Ownership — '
            'พี่เลี้ยงถ่ายทอดความรู้/เป็น Mentor/Coach ส่วนทีมใหม่รับ Empowerment + ความรับผิดชอบเพิ่มขึ้นตามลำดับ เมื่อผ่านเงื่อนไขการถ่ายทอดบทบาท</p>')
if old_desc in s:
    s = s.replace(old_desc, new_desc)
    log.append("HIT  ADM desc")
else:
    log.append("MISS ADM desc")

# 4) Header structure badge (top of page) already says ADM = บริหาร (พี่เลี้ยง + ADM ใหม่) — fine

if s != orig:
    with io.open(p, 'w', encoding='utf-8') as f:
        f.write(s)

with io.open('/tmp/final_fix_report.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(log))
print("done")
