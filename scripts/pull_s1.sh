#!/bin/bash
# /พร้อม script: Validate Index row and pull S1 data
# Usage: bash pull_s1.sh <row_number>
# row_number 1 = sheet row 4, row_number 2 = sheet row 5, etc.

set -e

SS_ID="1hTF8ZI5Xvex0TBHUB8jciG_5GGhNB5kp0oX57RBeVtY"
GOG="/usr/local/bin/gog.real"
ROW=$1
TAB="Index"

if [ -z "$ROW" ] || [ "$ROW" -lt 1 ]; then
  echo "ERROR: ต้องระบุเลขแถว (เช่น 1, 2, 3)"
  exit 1
fi

# Map input row to actual sheet row
AR=$((ROW + 3))

echo "DEBUG: Input row=$ROW -> Sheet row=$AR"

# Step 1: Read row data
ROW_DATA=$($GOG sheets get $SS_ID "'${TAB}'!A${AR}:I${AR}" --plain 2>&1)
echo "DEBUG: Row data: $ROW_DATA"

# Parse fields
LINK=$(echo "$ROW_DATA" | cut -f6)
P_COL=$(echo "$ROW_DATA" | cut -f5)
echo "DEBUG: LINK=$LINK | P=$P_COL"

# Step 2: Validate
MISSING=""
if [ -z "$LINK" ]; then MISSING="${MISSING}❌ ลิงก์เอกสาร\n"; fi
if [ -z "$P_COL" ]; then MISSING="${MISSING}❌ P ที่เกี่ยวข้อง (P1-P7)\n"; fi

if [ -n "$MISSING" ]; then
  echo "INCOMPLETE|ข้อมูลไม่ครบแถว $ROW\n\nสิ่งที่ต้องกรอกเพิ่ม:\n$(echo -e "$MISSING")\nกรอกให้ครบก่อนกดปุ่มดึงข้อมูล"
  exit 1
fi

# Step 3: Update status to กำลังดึง
$GOG sheets update $SS_ID "'${TAB}'!G${AR}" "🟡 กำลังดึง..." 2>&1
echo "STATUS: 🟡 กำลังดึงข้อมูล..."

# Step 4: Extract file ID from link
FILE_ID=$(echo "$LINK" | grep -oP '/d/\K[^/]+')
if [ -z "$FILE_ID" ]; then
  $GOG sheets update $SS_ID "'${TAB}'!G${AR}" "⚠️ ผิดพลาด" 2>&1
  echo "ERROR: ดึง File ID จากลิงก์ไม่ได้"
  exit 1
fi
echo "DEBUG: File ID: $FILE_ID"

# Step 4.5: Check link accessibility
ACCESS_STATUS="✅ เข้าถึงได้"
ACCESS_CHECK=$($GOG drive get "$FILE_ID" 2>&1)
if echo "$ACCESS_CHECK" | grep -qiE "notFound|404|Permission denied|error|not found"; then
  ACCESS_STATUS="❌ เข้าถึงไม่ได้"
  $GOG sheets update $SS_ID "'${TAB}'!J${AR}" "$ACCESS_STATUS" 2>&1
  echo "ERROR: ไม่สามารถเข้าถึงไฟล์ได้ — $FILE_ID"
  exit 1
else
  $GOG sheets update $SS_ID "'${TAB}'!J${AR}" "$ACCESS_STATUS" 2>&1
  echo "DEBUG: Link accessible ✓"
fi
sleep 5

FILE_PATH=$(echo "$DL_RESULT" | grep "^path" | cut -f2)
echo "DEBUG: Downloaded: $FILE_PATH"

# Step 6: Extract data
DOC_CODE=$(echo "$DL_RESULT" | grep -oP 'LDC-[A-Za-z-]+-[0-9]+' | head -1)
FULL_NAME=$(basename "$FILE_PATH")
DOC_NAME=$(echo "$FULL_NAME" | sed "s/^${FILE_ID}[^_]*_//" | sed 's/ฉบับคัดลอกของ //g' | sed 's/\.[^.]*$//' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

# Auto-detect type from doc code or filename
TYPE=$(echo "$DOC_CODE" | grep -oP '(PM|WI|SD|FM)' | head -1)
if [ -z "$TYPE" ]; then
  TYPE=$(echo "$DL_RESULT" | grep -oP '(PM|WI|SD|FM)' | head -1)
fi
if [ -z "$TYPE" ]; then TYPE="PM"; fi

echo "DEBUG: DOC_CODE=$DOC_CODE | DOC_NAME=$DOC_NAME | TYPE=$TYPE"

# Extract steps from draw.io
if [[ "$FILE_PATH" == *.drawio ]]; then
  STEPS_RAW=$(cat "$FILE_PATH" | grep -oP 'value="[^"]*"' | sed 's/value="//;s/"$//' | grep -P '^\s*[0-9]+')
  S1_STEPS=""
  while IFS= read -r line; do
    CLEAN=$(echo "$line" | sed 's/<[^>]*>//g' | sed 's/&lt;br&gt;/ /g' | sed 's/&amp;/\&/g' | sed 's/&nbsp;/ /g' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | sed "s/'//g" | sed 's/"/ /g' | tr -s ' ')
    if [ -n "$CLEAN" ] && [ ${#CLEAN} -gt 3 ]; then
      if [ -n "$S1_STEPS" ]; then S1_STEPS="${S1_STEPS} • ${CLEAN}"; else S1_STEPS="${CLEAN}"; fi
    fi
  done <<< "$STEPS_RAW"
elif [[ "$FILE_PATH" == *.csv ]] || [[ "$FILE_PATH" == *.txt ]]; then
  S1_STEPS=$(cat "$FILE_PATH" | head -20 | tr '\n' ' • ' | sed "s/'//g" | sed 's/"/ /g')
fi

if [ -z "$S1_STEPS" ]; then S1_STEPS="ไม่สามารถดึงขั้นตอนจากไฟล์ได้"; fi

# Step 7: Map P to tab
case "$P_COL" in
  P1) P_TAB="P1-แสวงหา" ;; P2) P_TAB="P2-หยั่งประเมิน" ;;
  P3) P_TAB="P3-จับคู่คนกับงาน" ;; P4) P_TAB="P4-ประเมินผล" ;;
  P5) P_TAB="P5-พัฒนา" ;; P6) P_TAB="P6-ค่าตอบแทนและแรงจูงใจ" ;;
  P7) P_TAB="P7-คุณภาพชีวิต" ;;
  *) echo "ERROR: P ไม่รู้จัก: $P_COL"; exit 1 ;;
esac
echo "DEBUG: Target tab: $P_TAB"

# Step 8: Find first empty doc block
BLOCK_START=6
for r in 6 14 22 30 38 46 54 62 70 78; do
  CHECK=$($GOG sheets get $SS_ID "'${P_TAB}'!A${r}" --plain 2>&1 | tr -d '[:space:]')
  if [ -z "$CHECK" ] || [ "$CHECK" = "📄" ]; then
    BLOCK_START=$r; break
  fi
done

S1_ROW=$((BLOCK_START + 1))

# Step 9: Write doc header
for item in "A${BLOCK_START}|📄" "B${BLOCK_START}|$DOC_CODE" "C${BLOCK_START}|$DOC_NAME" "D${BLOCK_START}|$TYPE"; do
  CELL="${item%%|*}"
  VAL="${item#*|}"
  sleep 3
  $GOG sheets update $SS_ID "'${P_TAB}'!${CELL}" "$VAL" 2>&1
done

# Step 10: Write S1
sleep 3; $GOG sheets update $SS_ID "'${P_TAB}'!A${S1_ROW}" "S1" 2>&1
sleep 3; $GOG sheets update $SS_ID "'${P_TAB}'!B${S1_ROW}" "📌 กระบวนการเดิม: $DOC_NAME" 2>&1
sleep 3; $GOG sheets update $SS_ID "'${P_TAB}'!C${S1_ROW}" "$S1_STEPS" 2>&1
sleep 3; $GOG sheets update $SS_ID "'${P_TAB}'!D${S1_ROW}" "OpenClaw" 2>&1
sleep 3; $GOG sheets update $SS_ID "'${P_TAB}'!E${S1_ROW}" "รอ" 2>&1

# S2-S7 template
TMPL="S2|✏️ ทบทวนกระบวนการเดิม|เปรียบเทียบกระบวนการเดิมกับงานที่ทำจริง|ผู้ปฏิบัติงาน|รอ
S3|💡 ความต้องการเพิ่มเติม|กรอกสิ่งที่ต้องการเพื่อช่วยให้ทำงานง่ายขึ้น|ผู้ปฏิบัติงาน|รอ
S4|🔄 กระบวนการใหม่ ใช้ปฏิบัติงานจริง|จัดทำจาก S2+S3|OpenClaw|รอข้อมูล
S5|🤖 กระบวนการใหม่ อนาคต + AI|นำ AI มาใช้ ลดความซับซ้อน|OpenClaw|รอข้อมูล
S6|🌐 ออกแบบ Web PP7|นำไปออกแบบใน Web PP7|OpenClaw|รอข้อมูล
S7|📝 Task ทีมพัฒนา|Task ที่ทีมพัฒนาต้องทำจริง|OpenClaw|รอข้อมูล"

i=2
while IFS='|' read -r step title desc owner status; do
  R=$((S1_ROW + i - 1))
  sleep 3
  $GOG sheets update $SS_ID "'${P_TAB}'!A${R}" "$step" 2>&1
  sleep 3
  $GOG sheets update $SS_ID "'${P_TAB}'!B${R}" "$title" 2>&1
  sleep 3
  $GOG sheets update $SS_ID "'${P_TAB}'!C${R}" "$desc" 2>&1
  sleep 3
  $GOG sheets update $SS_ID "'${P_TAB}'!D${R}" "$owner" 2>&1
  sleep 3
  $GOG sheets update $SS_ID "'${P_TAB}'!E${R}" "$status" 2>&1
  i=$((i + 1))
done <<< "$TMPL"

# Step 11: Update Index
STEP_COUNT=$(echo "$S1_STEPS" | grep -oP '•' | wc -l)
STEP_COUNT=$((STEP_COUNT + 1))

sleep 3; $GOG sheets update $SS_ID "'${TAB}'!G${AR}" "🟢 เสร็จแล้ว" 2>&1
sleep 3; $GOG sheets update $SS_ID "'${TAB}'!B${AR}" "$DOC_CODE" 2>&1
sleep 3; $GOG sheets update $SS_ID "'${TAB}'!C${AR}" "$DOC_NAME" 2>&1
sleep 3; $GOG sheets update $SS_ID "'${TAB}'!I${AR}" "S1 ดึงแล้ว $STEP_COUNT ขั้นตอน ($TYPE)" 2>&1

echo "SUCCESS|S1 ดึงเรียบร้อย $STEP_COUNT ขั้นตอน → $P_TAB | $DOC_CODE $DOC_NAME | ประเภท: $TYPE"
