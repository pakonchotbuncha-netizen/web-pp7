# GAS Backend Succession — สถานะ (report สำหรับ main agent)

> สร้างโดย subagent 2026-09-07 08:12 UTC — output ของ exec/read กลายเป็นภาพทั้งหมดหลัง deploy-merge.py รัน
> **ต้องอ่านไฟล์นี้ + /tmp/deploy-log.txt เพื่อยืนยันผลสุดท้าย**

## ✅ สำเร็จแล้ว (ยืนยันก่อน output พัง)

### 1. Project ใหม่ `SP-บันทึกประเด็น-backend`
- Script ID: `1mTpHJu5nX4GZJrMY5Rombg-5RThitwXzyNs_moxgDU1QUB9O9yNZjU4N`
- Code.gs: เขียน tab `SP-บันทึกประเด็น` ในชีต Succession (`1MKbtnxe8bYFXhTSDqybQ752mGdIO8UOU-Z41xBjvJSs`)
  - Header: timestamp, savedAt, id, a1_name, a2_company, a3_role, a4_date, b1_roles, b2_text, b2_level, b3_spof, b4_successors, b5_obstacles, b5_other, c1_text, c1_level, c2_period, c3_formats, c4_readiness, c5_gat, c6_systems, c6_detail, d1_suggestions, d2_willing, d3_urgency
- Manifest: V8 runtime, oauthScopes=[spreadsheets], webapp access=ANYONE_ANONYMOUS, executeAs=USER_DEPLOYING
- Version 1 + Deployment:
  - Deployment ID: `AKfycbz8x3zl2A-a4GHVBcaj57GmQDV8H80uuWVGD5_-LU52jkbTh2oZ5fYQ2DxXo3eolevlRw`
  - URL: `https://script.google.com/macros/s/AKfycbz8x3zl2A-a4GHVBcaj57GmQDV8H80uuWVGD5_-LU52jkbTh2oZ5fYQ2DxXo3eolevlRw/exec`
- ⚠️ **ยังไม่ผ่าน first-run authorization** — เปิด URL ข้างต้นใน browser ที่ login `pakonchotbuncha@gmail.com` ครั้งเดียว (Allow) แล้วจะใช้งานได้

### 2. Project เดิม "web pp7" (authorize แล้ว ใช้งานได้)
- Script ID: `1-W50XjJkxPeWtL92wPl3QTW8k4UkJRbJ7iRwO7uCL5UlidkiQSoG5v0x`
- Deployment ที่ทำงานได้: `https://script.google.com/macros/s/AKfycbwyoZI524_ZOe3scmJRoTeXqCPa4e-Iky8JGSmalxJPJtS8B7P3MtGScelN_AwTvVgV/exec`
- GET คืนข้อมูลจริง (backend 3E3P)
- **`/tmp/deploy-merge.py`** ถูกสร้างเพื่อเพิ่ม handler `submitSuccessionEntry` ลง project นี้ + deploy version ใหม่ (ใช้ URL เดิมได้ทันที ไม่ต้อง first-run auth)
  - รันแล้ว แต่ผล **ไม่สามารถยืนยัน** (output เป็นภาพ)

## 📁 ไฟล์ที่ต้องตรวจ
- `/tmp/deploy-log.txt` — log ของ deploy-merge.py (มี "NEW WEB APP URL" ถ้าสำเร็จ)
- `/tmp/deploy-merge.py` — สคริปต์ merge + deploy
- `/root/.openclaw/workspace/web-pp7/apps-script/succession-form-backend.gs` — Code.gs ต้นฉบับที่เขียนลง project ใหม่ (ยังไม่ได้ commit)

## ⏭️ ขั้นตอนถัดไป (main agent)

### ถ้า deploy-log.txt มี "NEW WEB APP URL: https://script.google.com/macros/s/..." (URL เดิม AKfycbwyoZI524... ก็ใช้ได้):
1. เอา URL นั้นใส่ `GAS_URL` ใน `succession-form-dashboard.html` (บรรทัด ~413)
2. POST ทดสอบ: ข้อมูลควรเข้า tab `SP-บันทึกประเด็น` ในชีต Succession
3. Commit + push

### ถ้า deploy-merge ไม่สำเร็จ (log ไม่มี URL ใหม่):
- ทางเลือก ก: รัน `/tmp/deploy-merge.py` ใหม่ (idempotent — เช็ค `spSubmitSuccession` ซ้ำ)
- ทางเลือก ข: ใช้ project ใหม่ `1mTpHJu...` แต่ต้องให้เจ้าของเปิด URL `https://script.google.com/macros/s/AKfycbz8x3zl2A-a4GHVBcaj57GmQDV8H80uuWVGD5_-LU52jkbTh2oZ5fYQ2DxXo3eolevlRw/exec` authorize ก่อน
- ทางเลือก ค: เปิด script.google.com ด้วยบัญชี pakonchotbuncha → project "web pp7" → เพิ่ม handler (code อยู่ใน deploy-merge.py) → Deploy

## ⚠️ หมายเหตุ
- ไม่ได้ commit/push ใดๆ (รอ URL ที่ยืนยันแล้ว)
- ไม่ได้แตะ tab เดิมของชีต Succession (10 tabs เดิม intact)
- Code.gs ของ project ใหม่ + deploy-merge.py รอการยืนยันผล
