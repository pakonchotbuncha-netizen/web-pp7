#!/bin/bash
# Check accessibility of all links in Index tab
SS_ID="1hTF8ZI5Xvex0TBHUB8jciG_5GGhNB5kp0oX57RBeVtY"
GOG="/usr/local/bin/gog.real"
TAB="Index"

echo "🔍 Checking all links in Index..."

# Read rows 4-105 (data area)
ROWS=$($GOG sheets get $SS_ID "'${TAB}'!A4:J105" --plain 2>&1)

ROW_IDX=0
while IFS=$'\t' read -r seq code name ptype pcol link status worker note access; do
  ROW_IDX=$((ROW_IDX + 1))
  SHEET_ROW=$((ROW_IDX + 3))

  # Skip empty rows
  [ -z "$seq" ] && [ -z "$code" ] && [ -z "$link" ] && continue

  if [ -z "$link" ]; then
    echo "  Row $SHEET_ROW: (ว่าง) — ข้าม"
    continue
  fi

  # Extract file ID from Google Drive link
  FILE_ID=$(echo "$link" | grep -oP '/d/\K[^/?&]+')

  if [ -z "$FILE_ID" ]; then
    $GOG sheets update $SS_ID "'${TAB}'!J${SHEET_ROW}" "❌ ลิงก์ผิดรูปแบบ" 2>&1
    echo "  Row $SHEET_ROW: ❌ Invalid link format"
    sleep 8
    continue
  fi

  # Try to access the file via Drive API
  RESULT=$($GOG drive get "$FILE_ID" 2>&1)

  if echo "$RESULT" | grep -qiE "notFound|404|Permission denied|error|not found"; then
    $GOG sheets update $SS_ID "'${TAB}'!J${SHEET_ROW}" "❌ เข้าถึงไม่ได้" 2>&1
    echo "  Row $SHEET_ROW: ❌ Cannot access — $FILE_ID"
  else
    $GOG sheets update $SS_ID "'${TAB}'!J${SHEET_ROW}" "✅ เข้าถึงได้" 2>&1
    echo "  Row $SHEET_ROW: ✅ Accessible — $FILE_ID"
  fi

  sleep 10
done <<< "$ROWS"

echo ""
echo "✅ Link check complete"
