# Release guide

แพ็กเกจนี้ปล่อยผ่าน **GitHub Actions → npm + GHCR + GitHub Releases**

## ช่องทางที่ผู้ใช้โหลดได้

| Platform | วิธีใช้ |
|----------|---------|
| **npm** | `npx website-analyzer-mcp` / `npm i -g website-analyzer-mcp` |
| **GitHub Releases** | ดาวน์โหลด source / release notes จากแท็ก `v*` |
| **GHCR (Docker)** | `docker pull ghcr.io/bigy2012/website-analyzer:latest` |

## แก้ error `ENEEDAUTH` / `npm login`

แปลว่า GitHub Actions **ไม่มี npm credentials**

แพ็กเกจ `website-analyzer-mcp` **ยังไม่มีบน npm** → ต้องใส่ `NPM_TOKEN` ก่อน (OIDC อย่างเดียวสร้างแพ็กเกจใหม่ไม่ได้ในเคสนี้)

### ตั้งค่า (ทำตามนี้)

1. ไปที่ https://www.npmjs.com/settings/~/tokens  
2. **Generate New Token** → เลือก **Automation** (ไม่ใช่ Classic ที่โดนจำกัด 2FA)  
3. คัดลอก token  
4. ไปที่ GitHub repo → **Settings → Environments → `release`**  
5. **Environment secrets** → New secret  
   - Name: `NPM_TOKEN` (ตัวพิมพ์ใหญ่ตรงนี้)  
   - Value: วาง token  
6. Commit/push workflow ล่าสุด แล้ว **Re-run** job Release ของแท็ก `v0.1.1`

ตรวจว่า secret อยู่ใน environment ชื่อ `release` จริง เพราะ workflow ใช้ `environment: release` — ถ้าใส่แค่ Actions repository secret บางทีก็ใช้ได้ แต่แนะนำใส่ใน environment `release` ให้ชัวร์

หลัง publish สำเร็จครั้งแรก ค่อยตั้ง Trusted Publisher แล้วค่อยลบ token ได้ภายหลัง

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
