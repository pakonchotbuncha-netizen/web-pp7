#!/bin/bash
# Rebuild S1-S7 template in all P-tabs
SS_ID="1hTF8ZI5Xvex0TBHUB8jciG_5GGhNB5kp0oX57RBeVtY"
GOG="/usr/local/bin/gog.real"

TABS=("P1-แสวงหา" "P2-หยั่งประเมิน" "P3-จับคู่คนกับงาน" "P4-ประเมินผล" "P5-พัฒนา" "P6-ค่าตอบแทนและแรงจูงใจ" "P7-คุณภาพชีวิต")

DOC_NAMES=("แสวงหา" "หยั่งประเมิน" "จับคู่คนกับงาน" "ประเมินผล" "พัฒนา" "ค่าตอบแทนและแรงจูงใจ" "คุณภาพชีวิต")

for i in "${!TABS[@]}"; do
  TAB="${TABS[$i]}"
  NAME="${DOC_NAMES[$i]}"

  echo "Rebuilding $TAB..."

  # Row 6: Doc header placeholder
  $GOG sheets update $SS_ID "'${TAB}'!A6" "📄" 2>&1
  sleep 2
  $GOG sheets update $SS_ID "'${TAB}'!B6" "(รอเพิ่มเอกสาร)" 2>&1
  sleep 2

  # S1-S7 rows 7-13
  TMPL="S1|📌 กระบวนการเดิม (OpenClaw ดึงให้)|OpenClaw จะดึงกระบวนการเดิมจากเอกสารมาแสดงที่นี่|OpenClaw|รอ
S2|✏️ ทบทวนกระบวนการเดิม|เปรียบเทียบกระบวนการเดิมกับงานที่ทำจริง|ผู้ปฏิบัติงาน|รอ
S3|💡 ความต้องการเพิ่มเติม|กรอกสิ่งที่ต้องการเพื่อช่วยให้ทำงานง่ายขึ้น|ผู้ปฏิบัติงาน|รอ
S4|🔄 กระบวนการใหม่ ใช้ปฏิบัติงานจริง|จัดทำจาก S2+S3|OpenClaw|รอข้อมูล
S5|🤖 กระบวนการใหม่ อนาคต + AI|นำ AI มาใช้ ลดความซับซ้อน|OpenClaw|รอข้อมูล
S6|🌐 ออกแบบ Web PP7|นำไปออกแบบใน Web PP7|OpenClaw|รอข้อมูล
S7|📝 Task ทีมพัฒนา|Task ที่ทีมพัฒนาต้องทำจริง|OpenClaw|รอข้อมูล"

  R=7
  while IFS='|' read -r step title desc owner status; do
    $GOG sheets update $SS_ID "'${TAB}'!A${R}" "$step" 2>&1
    sleep 2
    $GOG sheets update $SS_ID "'${TAB}'!B${R}" "$title" 2>&1
    sleep 2
    $GOG sheets update $SS_ID "'${TAB}'!C${R}" "$desc" 2>&1
    sleep 2
    $GOG sheets update $SS_ID "'${TAB}'!D${R}" "$owner" 2>&1
    sleep 2
    $GOG sheets update $SS_ID "'${TAB}'!E${R}" "$status" 2>&1
    sleep 2
    R=$((R + 1))
  done <<< "$TMPL"

  echo "$TAB done ✅"
done

echo "ALL TABS REBUILT ✅"
