#!/usr/bin/env python3
"""Scan all C2 tabs for newly accessible Drive links."""
import subprocess, json, re, os, time

SHEET_ID = "1zgDOqhuWajQyn4c58XN1jmhjxmavqpEdKqpOlouLM5w"
ACCOUNT = "suppasit@cyphinvest.io"
CLI = "/usr/local/bin/gog.real"

tabs = [
    ("C2_สรรหาและประเมินผล", 35),
    ("C2_บริหารหลักสูตร", 20),
    ("C2_สวัสดิการและค่าตอบแทน", 12),
]

found = []

for tab_name, max_row in tabs:
    cmd = [CLI, "sheets", "get", "--account", ACCOUNT, "-j", SHEET_ID, f"'{tab_name}'!A1:I{max_row}"]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
    data = json.loads(r.stdout)
    rows = data.get("values", [])
    
    for row in rows[2:]:  # skip headers
        if len(row) < 8:
            continue
        code = row[0].strip()
        title = row[6] if len(row) > 6 else ""
        url = row[7] if len(row) > 7 else ""
        status = row[8].strip() if len(row) > 8 else ""
        
        if not code or status == "✅" or not url or "drive.google.com" not in url:
            continue
        
        # Extract file ID
        m = re.search(r'/d/([a-zA-Z0-9_-]+)', url)
        if not m:
            continue
        fid = m.group(1)
        
        # Check access
        tmpfile = f"/tmp/scan_{fid}.bin"
        curl_cmd = f'curl -sL -w "HTTP:%{{http_code}}" -o "{tmpfile}" "https://drive.usercontent.google.com/download?id={fid}&export=download"'
        r2 = subprocess.run(curl_cmd, shell=True, capture_output=True, text=True, timeout=15)
        out = r2.stdout.strip()
        http_code = out[-14:]  # HTTP:200
        
        try:
            size = os.path.getsize(tmpfile)
        except:
            size = 0
        
        if http_code == "HTTP:200" and size > 1000:
            # Check not a login page
            try:
                with open(tmpfile, 'r', errors='ignore') as f:
                    content = f.read(500)
                if "Sign in" not in content and "requiredCookies" not in content:
                    found.append({
                        "code": code, "title": title, "fid": fid,
                        "size": size, "tab": tab_name,
                        "type": "draw.io" if "<mxfile" in content else
                                "pdf" if content.startswith("%PDF") else
                                "doc"
                    })
            except:
                pass

if found:
    print(f"Found {len(found)} newly accessible links:")
    for f in found:
        print(f"  ✅ {f['code']} | {f['title']} | {f['tab']} | {f['type']} ({f['size']}B)")
else:
    print("No new accessible links found")
