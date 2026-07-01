#!/bin/bash
# Auto-check S3 column in P1-4 tab
# If S3 has any content (not empty) → proceed with S4-S7
# Supports: initial fill + re-process if S3 changes
# Runs every 30 minutes

SHEET_ID="1zgDOqhuWajQyn4c58XN1jmhjxmavqpEdKqpOlouLM5w"
ACCOUNT="suppasit@cyphinvest.io"
STATE_FILE="/tmp/s3_check_state.json"

python3 << 'PYEOF'
import json
import subprocess
import os

SHEET_ID = "1zgDOqhuWajQyn4c58XN1jmhjxmavqpEdKqpOlouLM5w"
ACCOUNT = "suppasit@cyphinvest.io"
STATE_FILE = "/tmp/s3_check_state.json"

# Load state: {"docs": {"doc_name": {"s3_value": "...", "s4_done": true}}}
state = {}
if os.path.exists(STATE_FILE):
    with open(STATE_FILE) as f:
        state = json.load(f)

if "docs" not in state:
    state = {"docs": {}}

# Get sheet data
result = subprocess.run(
    ["/usr/local/bin/gog.real", "sheets", "get", "--account", ACCOUNT, "-j", SHEET_ID, "'P1-4'!A:E"],
    capture_output=True, text=True
)
data = json.loads(result.stdout)
rows = data.get("values", [])

# Parse rows
s3_ready = []
doc_name = ""
doc_code = ""
doc_title = ""

for i, row in enumerate(rows):
    col_a = row[0] if len(row) > 0 else ""
    col_b = row[1] if len(row) > 1 else ""
    col_c = row[2] if len(row) > 2 else ""

    if col_a == "📄":
        doc_code = col_b
        doc_title = col_c
        doc_name = f"{doc_code} | {doc_title}"

    if col_a == "S3" and doc_name:
        s3_val = col_c.strip() if col_c else ""
        if s3_val and s3_val != "รอ" and s3_val != "":
            prev = state["docs"].get(doc_name, {})
            prev_s3 = prev.get("s3_value", "")
            # Process if: new document OR S3 value changed
            if prev_s3 != s3_val:
                s3_ready.append({
                    "doc_name": doc_name,
                    "doc_code": doc_code,
                    "doc_title": doc_title,
                    "row_index": i,
                    "s3_value": s3_val,
                    "is_change": doc_name in state["docs"]
                })

# Process each
results = []
for item in s3_ready:
    doc = item["doc_name"]
    row_idx = item["row_index"]
    s3_val = item["s3_value"]
    is_change = item["is_change"]

    # Read S2 content
    s2_row = rows[row_idx - 1] if row_idx > 0 else []
    s2_content = s2_row[2] if len(s2_row) > 2 else ""

    # Determine S4 text
    if s3_val == "ไม่มี":
        s4_text = f"🔄 กระบวนการใหม่ (จาก S2 + S3='ไม่มี'):\n{s2_content[:300]}"
    else:
        s4_text = f"🔄 กระบวนการใหม่ (จาก S2 + S3):\n\n📌 จาก S2 (AI วิเคราะห์):\n{s2_content[:200]}\n\n📌 จาก S3 (ผู้ปฏิบัติงานต้องการ):\n{s3_val}"

    subprocess.run([
        "/usr/local/bin/gog.real", "sheets", "update",
        "--account", ACCOUNT,
        "--values-json", json.dumps([["S4","🔄 กระบวนการใหม่ จาก S2 S3 โดยOpenClaw", s4_text, "OpenClaw", "✅"]]),
        "-j", SHEET_ID, f"'P1-4'!A{row_idx+2}:E{row_idx+2}"
    ])

    # S5
    if s3_val == "ไม่มี":
        s5_text = f"🤖 แปลงกระบวนการใหม่เป็นระบบอัตโนมัติสำหรับ {item['doc_title']}\n- สกรีน/คัดกรองอัตโนมัติ\n- แจ้งเตือนอัตโนมัติ (Line/Telegram)\n- จัดเก็บข้อมูลลงฐานอัตโนมัติ"
    else:
        s5_text = f"🤖 แปลงกระบวนการใหม่เป็นระบบอัตโนมัติสำหรับ {item['doc_title']}\n- รวมความต้องการจาก S3: {s3_val[:150]}\n- สกรีน/คัดกรองอัตโนมัติ\n- แจ้งเตือนอัตโนมัติ (Line/Telegram)\n- จัดเก็บข้อมูลลงฐานอัตโนมัติ"
    subprocess.run([
        "/usr/local/bin/gog.real", "sheets", "update",
        "--account", ACCOUNT,
        "--values-json", json.dumps([["S5","🤖 กระบวนการใหม่บน web PP7 โดยOpenClaw", s5_text, "OpenClaw", "✅"]]),
        "-j", SHEET_ID, f"'P1-4'!A{row_idx+3}:E{row_idx+3}"
    ])

    # S6
    if s3_val == "ไม่มี":
        s6_text = f"🌐 ออกแบบ Web PP7 สำหรับ {item['doc_title']}:\n- Database schema\n- UI flow\n- Automation rules\n- Integration point"
    else:
        s6_text = f"🌐 ออกแบบ Web PP7 สำหรับ {item['doc_title']}:\n- Database schema\n- UI flow\n- Automation rules\n- Integration point\n- เพิ่ม feature ตาม S3: {s3_val[:150]}"
    subprocess.run([
        "/usr/local/bin/gog.real", "sheets", "update",
        "--account", ACCOUNT,
        "--values-json", json.dumps([["S6","🌐 ออกแบบ Web PP7 เพื่อรองรับ S5 โดยOpenClaw", s6_text, "OpenClaw", "✅"]]),
        "-j", SHEET_ID, f"'P1-4'!A{row_idx+4}:E{row_idx+4}"
    ])

    # S7
    if s3_val == "ไม่มี":
        s7_text = f"📝 Task ทีมพัฒนาโปรแกรม สำหรับ {item['doc_title']}:\n1. ออกแบบ database schema\n2. สร้าง UI form\n3. เขียน automation script\n4. ทดสอบระบบ\n5. Deploy"
    else:
        s7_text = f"📝 Task ทีมพัฒนาโปรแกรม สำหรับ {item['doc_title']}:\n1. ออกแบบ database schema\n2. สร้าง UI form รวม S3 requirement\n3. เขียน automation script\n4. ทดสอบระบบ\n5. Deploy\n6. เพิ่ม feature ตาม S3: {s3_val[:150]}"
    subprocess.run([
        "/usr/local/bin/gog.real", "sheets", "update",
        "--account", ACCOUNT,
        "--values-json", json.dumps([["S7","📝 Task ทีมพัฒนาโปรแกรม", s7_text, "ทีมพัฒนา", "✅"]]),
        "-j", SHEET_ID, f"'P1-4'!A{row_idx+5}:E{row_idx+5}"
    ])

    state["docs"][doc] = {"s3_value": s3_val, "s4_done": True, "updated_at": os.popen('date -u').read().strip()}

    if is_change:
        results.append(f"🔄 {doc}: S3 เปลี่ยนจาก '{prev_s3[:50]}' → '{s3_val[:50]}' → ทำ S4-S7 ใหม่เรียบร้อย")
    else:
        results.append(f"✅ {doc}: S3='{s3_val[:50]}' → ทำ S4-S7 เรียบร้อย")

# Save state
with open(STATE_FILE, "w") as f:
    json.dump(state, f, ensure_ascii=False, indent=2)

# Output
if results:
    print("\n".join(results))
    with open("/tmp/s3_change_detected.txt", "a") as f:
        f.write(f"[{os.popen('date -u').read().strip()}]\n" + "\n".join(results) + "\n\n")
else:
    print("No S3 changes detected")
PYEOF
