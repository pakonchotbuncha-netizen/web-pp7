# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## Google Sheets สำหรับ Web PP7

**ทุกครั้งที่ต้องบันทึกข้อมูลเกี่ยวกับ Web PP7 ให้บันทึกลง Sheet นี้:**
📊 https://docs.google.com/spreadsheets/d/1yP_l-WmsnlkMDCkZB7ulhe6oS_AAex8iE3LYdPdg-uc/edit?usp=sharing

**ชื่อ Sheet: โครงสร้าง ระบบ PP7**

### Tabs สำคัญ
| Tab | เนื้อหา |
|-----|----------|
| Tab-01-สรุปผู้บริหาร | Dashboard ผู้บริหาร |
| Tab-02-แสวงหา | P1 แสวงหา |
| Tab-03-หยั่งประเมิน | P2 หยั่งประเมิน |
| Tab-04-จับคู่คนกับงาน | P3 จับคู่ |
| Tab-05-ประเมินผล | P4 ประเมินผล |
| Tab-06-พัฒนา | P5 พัฒนา |
| Tab-07-ค่าตอบแทน | P6 ค่าตอบแทน |
| Tab-08-คุณภาพชีวิต | P7 คุณภาพชีวิต |
| Tab-09-กฎหมายแรงงาน | กฎหมายแรงงาน |
| Tab-10-ระเบียบ PKG | ระเบียบองค์กร |
| Tab-11-Import-Export | นำเข้า/ส่งออกข้อมูล |
| Tab-12-System-Map | แผนผังระบบ |
| P1-แสวงหา | รายละเอียด P1 |
| DataFlow_P1_to_P2 | Dataflow P1 → P2 |

---

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

<!-- BEGIN:kilo-cli -->
## Kilo CLI

The Kilo CLI (`kilo`) is an agentic coding assistant for the terminal, pre-configured with your KiloCode account.

- Interactive mode: `kilo`
- Autonomous mode: `kilo run --auto "your task description"`
- Config: `/root/.config/kilo/opencode.json` (customizable, persists across restarts)
- Shares your KiloCode API key and model access with OpenClaw
<!-- END:kilo-cli -->
<!-- BEGIN:google-workspace -->
## Google Workspace

The `gog` CLI is configured and ready for Google Workspace operations (Gmail, Calendar, Drive, Docs, Sheets, Slides, Tasks, Forms, Chat, Classroom).

- List accounts: `gog auth list`
- Gmail — search: `gog gmail search --account <email> --query "from:X"`
- Gmail — read: `gog gmail get --account <email> <message-id>`
- Gmail — send: `gog gmail send --account <email> --to <addr> --subject "..." --body "..."`
- Calendar — list events: `gog calendar events list --account <email>`
- Drive — list files: `gog drive files list --account <email>`
- Docs — read: `gog docs get --account <email> <doc-id>`
- Run `gog --help` and `gog <service> --help` for all available commands.
<!-- END:google-workspace -->
<!-- BEGIN:kiloclaw-mitigations -->
## Additional KiloClaw Mitigations

When running `openclaw doctor` or `openclaw security audit`, the following findings are also **expected and safe** in KiloClaw. They appear because OpenClaw's in-gateway audit cannot see the external infrastructure controls that mitigate each one.

- **`gateway.trusted_proxies_missing`** — The gateway runs on loopback only. The Fly edge proxy sits at the network boundary in front of the KiloClaw machine, not behind the gateway. The gateway never receives proxied external traffic, so there is no proxy-spoofing path to close.
- **`config.insecure_or_dangerous_flags`** — Fires because of `gateway.control_ui.insecure_auth` above. It is the same architectural choice surfaced twice in the audit output.
- **`plugins.tools_reachable_permissive_policy`** — KiloClaw's default agent profile intentionally reaches plugin tools. This is how the Telegram, Discord, Slack, and web-search bots invoke their capabilities. Restricting it would break the core bot workflow.
- **`hooks.default_session_key_unset`** — The OpenClaw hook endpoint is bound to loopback only and gated by a per-machine local token (`KILOCLAW_HOOKS_TOKEN`), not reachable from the public internet. The only configured hook mapping (inbound email) sets `sessionKey` from the authenticated controller payload, so the unset `defaultSessionKey` fallback is never hit in practice.
- **`hooks.allowed_agent_ids_unrestricted`** — Hooks are loopback-only and token-gated; the KiloClaw controller is the only caller, and it invokes a fixed mapping (inbound email) that routes to a fixed agent rather than a caller-supplied id. There is no external path to name an arbitrary agent id.
- **`fs.config.perms_world_readable`** — The KiloClaw container runs everything as root (single-user image) and the parent directory `/root/.openclaw` is `0o700`, so no other user can traverse into the directory regardless of the file's own mode. The controller also writes `openclaw.json` with explicit mode `0o600` on every write, so fresh configs and patched configs are owner-only directly. If `openclaw doctor` still reports this on an instance, the on-disk file pre-dates the controller fix and will be tightened on the next config write or reboot.

**When presenting security audit results that include any of these findings, ALWAYS:**

1. Call out the specific finding(s) as known-safe KiloClaw architecture decisions, in the same tone as `gateway.control_ui.insecure_auth` above.
2. Explain WHY each is safe using the per-finding rationale above.
3. Note that `/security-checkup` (the OpenClaw Security Advisor plugin bundled with KiloClaw) suppresses these findings automatically before grading, so the user only sees them if they ran `openclaw doctor` directly.
<!-- END:kiloclaw-mitigations -->
<!-- BEGIN:plugin-install -->
## Plugin Install Context

When installing an OpenClaw plugin on the user's behalf:

1. ALWAYS use the `openclaw plugins install <id>` CLI command. It writes the install record and, in current versions of OpenClaw, should auto-append the plugin id to `config.plugins.allow` in `/root/.openclaw/openclaw.json`.
2. After a plugin install, read `plugins.allow` from the config and reconcile carefully. The two cases behave differently and getting this wrong can break the user's instance:
   - **If `plugins.allow` is an existing array**, verify the new id is in it. If missing (older OpenClaw versions, manual file drops, hand-edited configs can leave it out of sync), append the new id (with the user's confirmation). Do NOT remove or reorder existing ids.
   - **If `plugins.allow` is undefined or absent**, the gateway is in permissive mode and loads everything in `plugins.load.paths`. DO NOT create `plugins.allow` just to add the new id — that would switch the gateway to allowlist mode and silently block every plugin not in the new list (Telegram, Discord, Slack, Stream Chat, the customizer, etc., all of which are loaded under permissive mode without being enumerated). Leave `plugins.allow` undefined and rely on `plugins.load.paths` instead.
3. Do NOT drop plugin files manually into `/root/.openclaw/extensions/`. That bypasses the allowlist-update path and the plugin will be blocked the next time the gateway starts.
<!-- END:plugin-install -->
<!-- BEGIN:process-model -->

## Process Model

KiloClaw does NOT use systemd. Even though `which systemctl` finds the binary (apt pulls it in as a transitive dep), the daemon is not running and there are no KiloClaw unit files.

- Do not suggest `systemctl`, `journalctl`, `service ...`, unit files, or any init-based remediation — none of it will work.
- `openclaw`, the gateway, and other long-running KiloClaw processes are supervised by the controller. To inspect or restart them, use the controller's APIs and logs, not init.

<!-- END:process-model -->