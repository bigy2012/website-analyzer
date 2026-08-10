# Release guide

แพ็กเกจนี้ปล่อยผ่าน **GitHub Actions → npm + GHCR + GitHub Releases**

## ช่องทางที่ผู้ใช้โหลดได้

| Platform | วิธีใช้ |
|----------|---------|
| **npm** | `npx website-analyzer-mcp` / `npm i -g website-analyzer-mcp` |
| **GitHub Releases** | ดาวน์โหลด source / release notes จากแท็ก `v*` |
| **GHCR (Docker)** | `docker pull ghcr.io/bigy2012/website-analyzer:latest` |

## แก้ error `E404` ตอน publish

ข้อความแบบนี้มัก**ไม่ใช่**ว่าไฟล์หาย แต่แปลว่า npm **ไม่ยอมให้ publish** (auth/config ผิด หรือแพ็กเกจยังไม่ถูกสร้าง):

```text
404 Not Found - PUT https://registry.npmjs.org/website-analyzer-mcp
```

Checklist:

1. **`package.json` → `repository.url` ต้องตรง GitHub จริง**  
   ตอนนี้ควรเป็น `https://github.com/bigy2012/website-analyzer.git`
2. **Trusted Publisher บน npm** ต้องตรงทุกช่อง:
   - Organization/user: `bigy2012`
   - Repository: `website-analyzer` (ชื่อ repo ไม่ใช่ชื่อแพ็กเกจ)
   - Workflow filename: `release.yml` (แค่ชื่อไฟล์)
   - Environment: `release`
3. **แพ็กเกจครั้งแรกยังไม่มีบน npm** → ต้อง bootstrap ด้วย `NPM_TOKEN` ครั้งหนึ่งก่อน (ด้านล่าง)
4. อย่าใส่ `registry-url` ใน `setup-node` คู่กับ OIDC (workflow แก้แล้ว)

## ครั้งแรก (bootstrap)

### A) สร้าง Automation token บน npm

1. เข้า [npmjs.com](https://www.npmjs.com/) → Access Tokens → Generate New Token → **Automation**
2. ใน GitHub repo `bigy2012/website-analyzer`:  
   Settings → Environments → `release` → Environment secrets → เพิ่ม `NPM_TOKEN`

### B) Publish ครั้งแรก

Push แท็กใหม่ หรือรัน Actions → Release อีกรอบ  
Workflow จะเห็น `NPM_TOKEN` แล้ว publish แบบ token (สร้างแพ็กเกจบน npm)

ตรวจ:

```bash
npm view website-analyzer-mcp version
```

### C) ตั้ง Trusted Publishing (หลังแพ็กเกจมีแล้ว)

บน https://www.npmjs.com/package/website-analyzer-mcp → Settings → Trusted Publisher:

| Field | Value |
|-------|-------|
| Organization/user | `bigy2012` |
| Repository | `website-analyzer` |
| Workflow filename | `release.yml` |
| Environment | `release` |

จากนั้นจะลบ `NPM_TOKEN` ออกก็ได้ — release ถัดไปใช้ OIDC

## ปล่อยเวอร์ชันใหม่

1. บัมพ์ `version` ใน `package.json`
2. Commit + push
3. แท็กให้ตรงเวอร์ชัน:

```bash
git tag v0.1.1
git push origin v0.1.1
```

หรือ Actions → Release → Run workflow

## ถ้าแท็ก `v0.1.0` ใช้ไปแล้วแต่ publish ไม่สำเร็จ

ไม่ต้องเปลี่ยนเวอร์ชันก็ได้ — รัน workflow ซ้ำ:

- Actions → Release → Re-run failed jobs  
  หรือ workflow_dispatch

ถ้าต้องการแท็กใหม่หลังแก้โค้ด:

```bash
git add package.json .github/workflows/release.yml docs/RELEASE.md
git commit -m "fix: npm release auth and repository url"
git push
# ลบแท็กเก่าแล้วแท็กใหม่ (เฉพาะเมื่อยังไม่ขึ้น npm)
git tag -d v0.1.0
git push origin :refs/tags/v0.1.0
git tag v0.1.0
git push origin v0.1.0
```

## MCP config หลัง publish

```json
{
  "mcpServers": {
    "website-analyzer": {
      "command": "npx",
      "args": ["-y", "website-analyzer-mcp"]
    }
  }
}
```
