# PADClaw (beta) — คลังข้อมูลห้องสนทนา (Archive)

โฟลเดอร์นี้เก็บประวัติการสนทนาทั้งหมดของห้อง **PADClaw (beta)** (Telegram chat id: `-5106159211`)
ซึ่งเป็นห้องหลักที่ใช้คุยงาน **Web PP7** และงานอื่น ๆ ของ PKG ตั้งแต่เริ่มต้น

## ทำไมต้องมีโฟลเดอร์นี้
เพื่อสำรองข้อมูลให้พร้อมใช้ต่อยอดพัฒนา หากมีการปิดระบบการทำงานกับ Claw
ทุกบทสนทนา ข้อสรุป การตัดสินใจ และงานที่ทำ จะยังคงอ่านได้จากที่นี่

## โครงสร้าง
```
archive/padclaw-room/
├── 2026-06.md   # มิถุนายน 2569
├── 2026-07.md   # กรกฎาคม 2569
├── 2026-08.md   # สิงหาคม 2569
└── 2026-09.md   # กันยายน 2569 (ปัจจุบัน)
```

## วิธีอ่าน
- แต่ละไฟล์ = 1 เดือน เรียงตามเวลา (UTC)
- `## [เวลา] พี่ปกรณ์` = ข้อความจากผู้ใช้ (หรือคำสั่ง cron)
- `## [เวลา] KiloClaw` = ข้อความตอบกลับของ KiloClaw

## ความปลอดภัย
- ข้อความถูก **redact** ความลับอัตโนมัติ (GitHub token, private key ฯลฯ)
- Google Apps Script webapp URL (script.google.com) เป็น URL กึ่งสาธารณะ จึงเก็บไว้ตามเดิม

## วิธี regenerate
```bash
cd /root/.openclaw/workspace
python3 scripts/export-padclaw-archive.py
```

## แหล่งข้อมูลหลัก (อ้างอิงคู่กัน)
- `MEMORY.md` — ความรู้/ข้อสรุปถาวร (curated long-term memory)
- `memory/YYYY-MM-DD.md` — บันทึกรายวัน
- Repo `web-pp7` — โค้ดและหน้าจอจริง (https://github.com/pakonchotbuncha-netizen/web-pp7)
- Repo `kiloclaw-backup` — backup workspace เต็ม (private)
