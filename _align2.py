#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# Idempotent alignment of succession dashboards with master plan (11 Sep 2026).
import io, re

def read(p):
    with io.open(p, encoding='utf-8') as f:
        return f.read()

def write(p, s):
    with io.open(p, 'w', encoding='utf-8') as f:
        f.write(s)

ADM_NEW = ("  ADM:{icon:'\U0001F680',label:'ADM',level:3,levelTxt:'บริหาร - ทีมเดิม(พี่เลี้ยง) + ทีมใหม่',color:'sky',hex:'#0284c7',\n"
"    scope:'เฉพาะด้าน BSC ที่รับผิดชอบ',role:'ทีมเดิม(พี่เลี้ยง อดีต GAT 11 คน) + ทีมใหม่(ADM 6 คน) ทำงานร่วมกันด้วย Co-Ownership - บริหารแนวทางกลยุทธ์ (ไม่ใช่ operation)',\n"
"    duties:[['\U0001F3AF บริหารกลยุทธ์ (ทุกคนใน ADM)','บริหารแนวทางการทำงานของกลยุทธ์ด้าน BSC ที่รับผิดชอบ (ไม่ทำงาน operation)'],\n"
"      ['\U0001F91D Co-Ownership ทำงานร่วม','ทีมเดิม + ทีมใหม่ ทำงานร่วมกันก่อนส่งมอบ - Alignment งาน · ตัดสินใจสอดคล้อง · ถ่ายทอดจากงานจริง · ลดความเสี่ยงเปลี่ยนมือ'],\n"
"      ['\U0001F9ED ทีมเดิม - ถ่ายทอด/Mentor/Coach','พี่เลี้ยง(อดีต GAT) ถ่ายทอดความรู้และประสบการณ์ · ให้คำปรึกษาการตัดสินใจสำคัญ · สนับสนุนการเปลี่ยนผ่าน Operation'],\n"
"      ['\U0001F3DB ทีมเดิม - รักษามาตรฐาน/วัฒนธรรม','รักษามาตรฐาน วัฒนธรรม และบรรยากาศ PKG · ช่วงแรกยังทำ Operation สำคัญ (การเงิน/อนุมัติสินเชื่อ) แล้วค่อยลดบทบาทเมื่อทีมใหม่พร้อม'],\n"
"      ['\U0001F680 ทีมใหม่ - รับผิดชอบ Operation','รับผิดชอบ Operation มากขึ้น + อำนาจตัดสินใจ + รับผิดชอบผลลัพธ์ตามลำดับ'],\n"
"      ['\U0001F4BB ทีมใหม่ - Tech/Digital/AI/Automation','พัฒนาความสามารถ Technology/Digital/AI/Automation เพื่อรองรับการทำงานอนาคต'],\n"
"      ['\U0001F3D7 ทีมใหม่ - รักษา Culture/Value','รับและรักษา Culture/Value/Working Environment ของ PKG ครบทุกมิติ'],\n"
"      ['\U0001F4B0 ทีมใหม่ - สร้างธุรกิจใหม่','สร้างธุรกิจใหม่ + สร้างความสามารถใหม่ให้ PKG'],\n"
"      ['\U0001F4E4 เงื่อนไขถ่ายทอด','ต้องผ่านก่อน 5 ข้อ: Operation Strategy Execution · ลดหนี้ตามเป้า · งานเงื่อนไข (AMS5) · รับผิดชอบจริง · Co-Ownership'],\n"
"      ['\U0001F517 ความเชื่อมโยง','รับการกำกับ/Advise/Veto จาก OAC · ถูกตรวจสอบโดย GAT · ทีมเดิมกับทีมใหม่ทำงานคู่กันภายใน ADM']],\n"
"    mentors:ADM_MENTORS, juniors:ADM_JUNIORS,\n"
"    members:[...ADM_MENTORS,...ADM_JUNIORS]}")

results = []

# ---- member-tabs: normalize ADM block via regex ----
p = "succession-member-tabs.html"
s = read(p)
pat = re.compile(r"  ADM:\{icon:'\U0001F680'.*?members:\[\.\.\.ADM_MENTORS,\.\.\.ADM_JUNIORS\]\}", re.DOTALL)
s, n = pat.subn(ADM_NEW, s)
results.append("member-tabs ADM block replaced x%d" % n)
# OAC advise wording
s = s.replace("['\U0001F4AC Advise','ให้คำปรึกษาแก่ GAT และ ADM — ถอดประสบการณ์บริหารส่งต่อทีมใหม่']",
              "['\U0001F4AC Advise','ให้คำปรึกษาแก่ทีมใหม่ — ถอดประสบการณ์บริหารส่งต่อทีมใหม่']")
write(p, s)

# ---- plan-dashboard: ensure section 4 (ทีมเดิม) and 5 (ทีมใหม่) present ----
p = "succession-plan-dashboard.html"
s = read(p)
# add a "ทีมเดิม" duty card after OAC / GAT sections if not present
if "บทบาทของทีมเดิม" not in s:
    # Insert a new section block before the closing </main> — minimal: append team cards
    insert = (
"    <!-- ======= 4. บทบาทของทีมเดิม ======= -->\n"
"    <section>\n"
"      <div class=\"flex items-center gap-3 mb-4\">\n"
"        <span class=\"sec-chip bg-slate-700\">4</span>\n"
"        <div><h2 class=\"text-xl sm:text-2xl font-extrabold text-slate-900\">บทบาทของทีมเดิม</h2>\n"
"        <p class=\"text-sm text-slate-500\">ทีมเดิมไม่ได้ออกจากระบบ — ใช้ Co-Ownership ทำงานร่วม</p></div>\n"
"      </div>\n"
"      <div class=\"card bg-white rounded-2xl p-5 mb-4\">\n"
"        <ul class=\"list-disc list-inside space-y-2 text-sm text-slate-700\">\n"
"          <li>ถ่ายทอดความรู้และประสบการณ์ให้ทีมใหม่</li>\n"
"          <li>เป็น Mentor / Coach</li>\n"
"          <li>ให้คำปรึกษาในการตัดสินใจเรื่องสำคัญ</li>\n"
"          <li>สนับสนุนการเปลี่ยนผ่านของ Operation</li>\n"
"          <li>รักษามาตรฐาน วัฒนธรรม และบรรยากาศของ PKG</li>\n"
"          <li>ช่วงแรกยังทำ Operation ที่สำคัญได้ เช่น การเงิน / การอนุมัติสินเชื่อ</li>\n"
"          <li>เมื่อทีมใหม่พร้อม จึงค่อยลดบทบาท Operation ลง</li>\n"
"        </ul>\n"
"      </div>\n"
"    </section>\n"
"\n"
"    <!-- ======= 5. บทบาทของทีมใหม่ ======= -->\n"
"    <section>\n"
"      <div class=\"flex items-center gap-3 mb-4\">\n"
"        <span class=\"sec-chip bg-emerald-600\">5</span>\n"
"        <div><h2 class=\"text-xl sm:text-2xl font-extrabold text-slate-900\">บทบาทของทีมใหม่</h2>\n"
"        <p class=\"text-sm text-slate-500\">ผู้รับช่วงต่อและผู้ขับเคลื่อนอนาคตของ PKG</p></div>\n"
"      </div>\n"
"      <div class=\"card bg-white rounded-2xl p-5 mb-4\">\n"
"        <ul class=\"list-disc list-inside space-y-2 text-sm text-slate-700\">\n"
"          <li>รับผิดชอบ Operation มากขึ้น + เพิ่มอำนาจตัดสินใจและรับผิดชอบผลลัพธ์ตามลำดับ</li>\n"
"          <li>มีความสามารถด้าน Technology / Digital / AI / Automation</li>\n"
"          <li>รับและรักษา Culture / Value / Working Environment ของ PKG ครบทุกมิติ</li>\n"
"          <li>สร้างธุรกิจใหม่ + สร้างความสามารถใหม่ให้ PKG</li>\n"
"        </ul>\n"
"      </div>\n"
"    </section>\n"
    )
    s = s.replace("  </main>", insert + "  </main>")
    results.append("plan-dashboard sections 4 & 5 inserted")
else:
    results.append("plan-dashboard sections 4 & 5 already present")
write(p, s)

with io.open('/tmp/align2_report.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(results))
print("done align2")