#!/usr/bin/env bash
# Auto-scan all C2 tabs for newly accessible links
# Usage: auto_scan_c2_links.sh

SHEET_ID="1zgDOqhuWajQyn4c58XN1jmhjxmavqpEdKqpOlouLM5w"
ACCOUNT="suppasit@cyphinvest.io"
CLI="/usr/local/bin/gog.real"

# Track file
STATE_FILE="/tmp/c2_link_scan_state.json"
FOUND=0

# Get all rows from each tab
get_rows() {
    local tab="$1" range="$2"
    $CLI sheets get --account "$ACCOUNT" -j "$SHEET_ID" "'${tab}'!${range}" 2>/dev/null | python3 -c "
import json,sys
data=json.load(sys.stdin)
vals=data.get('values',[])
for i,row in enumerate(vals):
    if len(row)>=8 and row[0].strip():
        code=row[0].strip()
        title=row[6] if len(row)>6 else ''
        url=row[7] if len(row)>7 else ''
        status=row[8].strip() if len(row)>8 else ''
        if url and 'drive.google.com' in url:
            import re
            m=re.search(r'/d/([a-zA-Z0-9_-]+)',url)
            fid=m.group(1) if m else ''
            print(json.dumps({'code':code,'title':title,'url':url,'fid':fid,'status':status}))
"
}

# Check single file
check_access() {
    local fid="$1"
    local tmpfile="/tmp/chk_${fid}.bin"
    curl -sL -w "HTTP:%{http_code}" -o "$tmpfile" \
        "https://drive.usercontent.google.com/download?id=${fid}&export=download" 2>/dev/null
}

# Process each tab
echo "Scanning C2 tabs..."

for row in $(get_rows "C2_สรรหาและประเมินผล" "A1:I35"); do
    code=$(echo "$row" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['code'])")
    status=$(echo "$row" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['status'])")
    fid=$(echo "$row" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['fid'])")
    title=$(echo "$row" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['title'])")

    if [ "$status" = "❌" ] && [ -n "$fid" ]; then
        http_code=$(check_access "$fid")
        size=$(wc -c < "/tmp/chk_${fid}.bin" 2>/dev/null || echo 0)

        if [ "$http_code" = "HTTP:200" ] && [ "$size" -gt 1000 ]; then
            # Check it's not a login page
            if ! grep -q "Sign in\|requiredCookies" "/tmp/chk_${fid}.bin" 2>/dev/null; then
                echo "✅ NEW: $code | $title | size=${size}B"
                FOUND=$((FOUND+1))
            fi
        fi
    fi
done

for row in $(get_rows "C2_บริหารหลักสูตร" "A1:I20"); do
    code=$(echo "$row" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['code'])")
    status=$(echo "$row" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['status'])")
    fid=$(echo "$row" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['fid'])")
    title=$(echo "$row" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['title'])")

    if [ "$status" = "❌" ] && [ -n "$fid" ]; then
        http_code=$(check_access "$fid")
        size=$(wc -c < "/tmp/chk_${fid}.bin" 2>/dev/null || echo 0)

        if [ "$http_code" = "HTTP:200" ] && [ "$size" -gt 1000 ]; then
            if ! grep -q "Sign in\|requiredCookies" "/tmp/chk_${fid}.bin" 2>/dev/null; then
                echo "✅ NEW: $code | $title | size=${size}B"
                FOUND=$((FOUND+1))
            fi
        fi
    fi
done

for row in $(get_rows "C2_สวัสดิการและค่าตอบแทน" "A1:I12"); do
    code=$(echo "$row" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['code'])")
    status=$(echo "$row" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['status'])")
    fid=$(echo "$row" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['fid'])")
    title=$(echo "$row" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['title'])")

    if [ "$status" = "❌" ] && [ -n "$fid" ]; then
        http_code=$(check_access "$fid")
        size=$(wc -c < "/tmp/chk_${fid}.bin" 2>/dev/null || echo 0)

        if [ "$http_code" = "HTTP:200" ] && [ "$size" -gt 1000 ]; then
            if ! grep -q "Sign in\|requiredCookies" "/tmp/chk_${fid}.bin" 2>/dev/null; then
                echo "✅ NEW: $code | $title | size=${size}B"
                FOUND=$((FOUND+1))
            fi
        fi
    fi
done

if [ "$FOUND" -eq 0 ]; then
    echo "No new accessible links found"
else
    echo "Total new accessible: $FOUND"
fi
