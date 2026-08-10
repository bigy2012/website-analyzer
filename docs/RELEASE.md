# Release guide

แพ็กเกจนี้ปล่อยผ่าน **GitHub Actions → npm + GHCR + GitHub Releases**

## ช่องทางที่ผู้ใช้โหลดได้

| Platform | วิธีใช้ |
|----------|---------|
| **npm** | `npx website-analyzer-mcp` / `npm i -g website-analyzer-mcp` |
| **GitHub Releases** | ดาวน์โหลด source / release notes จากแท็ก `v*` |
| **GHCR (Docker)** | `docker pull ghcr.io/<owner>/website-analyzer-mcp:latest` |

## ครั้งแรก (ทำครั้งเดียว)

### 1) สร้าง GitHub repo แล้ว push โค้ด

```bash
git init
git add .
git commit -m "chore: initial v0.1.0"
git remote add origin https://github.com/<OWNER>/website-analyzer-mcp.git
git push -u origin main
```

อัปเดต `package.json` → `repository.url` ให้ตรง repo จริง

### 2) ตั้ง GitHub Environment ชื่อ `release`

Settings → Environments → New environment → `name: release`  
(แนะนำใส่ protection: required reviewers)

### 3) เตรียม npm

1. สร้างบัญชีที่ [npmjs.com](https://www.npmjs.com/)
2. สร้างแพ็กเกจเปล่าหรือเตรียม publish ครั้งแรก
3. เลือกอย่างใดอย่างหนึ่ง:

**แนะนำ — Trusted Publishing (OIDC, ไม่ต้องเก็บ token นาน)**  
Package Settings → Trusted Publisher:

- Organization/user = GitHub owner
- Repository = `website-analyzer-mcp`
- Workflow filename = `release.yml`
- Environment = `release`

**ทางเลือก — NPM_TOKEN**  
สร้าง Automation token แล้วใส่ Secret ชื่อ `NPM_TOKEN` ใน repo/environment `release`  
(ใช้ bootstrap หรือถ้ายังตั้ง OIDC ไม่ได้)

### 4) Package visibility

`npm publish --access public` ถูกตั้งใน workflow แล้ว (แพ็กเกจ unscoped)

## ปล่อยเวอร์ชันใหม่

1. บัมพ์เวอร์ชันใน `package.json` ให้ตรงที่จะแท็ก เช่น `0.1.1`
2. Commit + push
3. สร้างแท็กแล้ว push:

```bash
git tag v0.1.1
git push origin v0.1.1
```

Workflow `Release` จะ:

1. typecheck / build / test
2. `npm publish` → registry.npmjs.org
3. build & push image → `ghcr.io/<owner>/website-analyzer-mcp:<version>` และ `:latest`
4. สร้าง GitHub Release จากแท็ก

หรือรันมือ: Actions → Release → Run workflow

## ตรวจว่าขึ้นแล้ว

```bash
npm view website-analyzer-mcp version
npx website-analyzer-mcp --help   # หรือรันเป็น MCP stdio
docker pull ghcr.io/<owner>/website-analyzer-mcp:0.1.0
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
