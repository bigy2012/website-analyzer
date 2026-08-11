/**
 * Generates assets/demo.gif — a stylized walkthrough of Website Analyzer MCP.
 * Run: npx tsx scripts/make-demo-gif.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import GIFEncoder from 'gif-encoder-2';
import { PNG } from 'pngjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outPath = join(root, 'assets', 'demo.gif');

const W = 960;
const H = 540;

type Scene = { html: string; delayMs: number };

function frame(body: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: ${W}px; height: ${H}px; overflow: hidden; }
  body {
    font-family: 'IBM Plex Sans', system-ui, sans-serif;
    background: #0f1419;
    color: #e7ecf3;
  }
  .shell {
    display: grid;
    grid-template-rows: 40px 1fr;
    height: 100%;
    background:
      radial-gradient(900px 420px at 12% -10%, #1a3a4a55, transparent 55%),
      radial-gradient(700px 380px at 95% 110%, #3a2a1a44, transparent 50%),
      #0f1419;
  }
  .topbar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 18px;
    border-bottom: 1px solid #243040;
    background: #121820;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.02em;
  }
  .dot { width: 9px; height: 9px; border-radius: 50%; }
  .dot.r { background: #ff5f57; }
  .dot.y { background: #febc2e; }
  .dot.g { background: #28c840; }
  .brand { margin-left: 8px; color: #9fb0c3; }
  .brand strong { color: #f0f4f8; font-weight: 600; }
  .badge {
    margin-left: auto;
    font-size: 11px;
    font-family: 'IBM Plex Mono', monospace;
    color: #7dcfb6;
    background: #143028;
    border: 1px solid #1f5a48;
    padding: 3px 8px;
    border-radius: 4px;
  }
  .main {
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: 14px;
    padding: 16px;
    height: 100%;
  }
  .panel {
    background: #161d27;
    border: 1px solid #273445;
    border-radius: 10px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  .panel h2 {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #7f93a8;
    padding: 10px 14px;
    border-bottom: 1px solid #243040;
  }
  .chat { padding: 14px; display: flex; flex-direction: column; gap: 12px; flex: 1; }
  .bubble {
    max-width: 92%;
    padding: 10px 12px;
    border-radius: 10px;
    font-size: 14px;
    line-height: 1.45;
  }
  .bubble.user {
    align-self: flex-end;
    background: #243447;
    border: 1px solid #33485e;
  }
  .bubble.agent {
    align-self: flex-start;
    background: #1a222d;
    border: 1px solid #2a3646;
    color: #c9d4e0;
  }
  .bubble .muted { color: #8a9bb0; font-size: 12px; margin-bottom: 6px; }
  .tools { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
  .tool {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    padding: 4px 8px;
    border-radius: 5px;
    background: #1e2a20;
    border: 1px solid #2f4a34;
    color: #9fdb87;
  }
  .tool.active {
    background: #2a3f1c;
    border-color: #5a8f3a;
    color: #c8f0a8;
  }
  .tool.done {
    background: #1a2e28;
    border-color: #2d6b55;
    color: #7dcfb6;
  }
  .side { padding: 12px 14px; display: flex; flex-direction: column; gap: 12px; flex: 1; }
  .swatches { display: flex; gap: 8px; }
  .swatch {
    width: 36px; height: 36px; border-radius: 8px;
    border: 1px solid #00000055;
    box-shadow: inset 0 0 0 1px #ffffff22;
  }
  .meta { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #9fb0c3; line-height: 1.55; }
  .meta b { color: #e7ecf3; font-weight: 500; }
  .files { display: flex; flex-direction: column; gap: 6px; }
  .file {
    display: flex; align-items: center; gap: 8px;
    font-family: 'IBM Plex Mono', monospace; font-size: 12px;
    padding: 7px 10px; border-radius: 6px;
    background: #121820; border: 1px solid #243040; color: #c5d0dc;
  }
  .file .check { color: #7dcfb6; }
  .file.pending { opacity: 0.35; }
  .viewports { display: flex; gap: 8px; align-items: flex-end; }
  .vp {
    background: #0c1016; border: 1px solid #2a3646; border-radius: 6px;
    overflow: hidden; position: relative;
  }
  .vp .bar { height: 8px; background: #1c2530; border-bottom: 1px solid #2a3646; }
  .vp .body {
    background: linear-gradient(160deg, #2a6fb0, #1a3a55 55%, #0f2740);
    position: relative;
  }
  .vp.m { width: 52px; height: 78px; }
  .vp.t { width: 88px; height: 66px; }
  .vp.d { width: 128px; height: 72px; }
  .vp .label {
    position: absolute; bottom: 4px; left: 0; right: 0;
    text-align: center; font-size: 9px; color: #cfe0f0;
    font-family: 'IBM Plex Mono', monospace;
  }
  .hero-line {
    height: 6px; width: 55%; margin: 10px auto 0; border-radius: 3px; background: #ffffff55;
  }
  .hero-line.short { width: 35%; margin-top: 5px; background: #ffffff33; }
  .cta {
    width: 28%; height: 8px; margin: 8px auto 0; border-radius: 3px; background: #f0c14b;
  }
  .json {
    font-family: 'IBM Plex Mono', monospace; font-size: 11px; line-height: 1.5;
    color: #9fb0c3; white-space: pre;
  }
  .json .k { color: #7dcfb6; }
  .json .s { color: #e8c07a; }
  .json .n { color: #89b4fa; }
  .progress {
    height: 4px; background: #243040; border-radius: 2px; overflow: hidden; margin-top: 4px;
  }
  .progress > i {
    display: block; height: 100%; background: linear-gradient(90deg, #3d8b6e, #7dcfb6);
    width: var(--w, 0%);
  }
  .footer-note {
    margin-top: auto;
    font-size: 11px;
    color: #6b7d90;
  }
  ${body.includes('/*EXTRA*/') ? '' : ''}
</style>
</head>
<body>${body}</body>
</html>`;
}

function shell(left: string, right: string, badge = 'MCP · Playwright'): string {
  return `
  <div class="shell">
    <div class="topbar">
      <span class="dot r"></span><span class="dot y"></span><span class="dot g"></span>
      <span class="brand"><strong>Website Analyzer</strong> · Cursor chat</span>
      <span class="badge">${badge}</span>
    </div>
    <div class="main">
      <div class="panel">
        <h2>Agent</h2>
        ${left}
      </div>
      <div class="panel">
        <h2>Output</h2>
        ${right}
      </div>
    </div>
  </div>`;
}

const scenes: Scene[] = [
  {
    delayMs: 1600,
    html: frame(
      shell(
        `<div class="chat">
          <div class="bubble user">
            Analyze https://example.com<br/>
            Create design.md + rule.md
          </div>
          <div class="bubble agent">
            <div class="muted">Planning…</div>
            I'll inspect the page, extract design tokens, then generate docs.
          </div>
        </div>`,
        `<div class="side">
          <div class="meta">Waiting for tools…</div>
          <div class="files">
            <div class="file pending">design.md</div>
            <div class="file pending">rule.md</div>
            <div class="file pending">component.md</div>
            <div class="file pending">screenshots/</div>
          </div>
          <div class="footer-note">No paid LLM API inside the MCP — JSON in, docs out.</div>
        </div>`,
        'idle',
      ),
    ),
  },
  {
    delayMs: 1400,
    html: frame(
      shell(
        `<div class="chat">
          <div class="bubble user">Analyze https://example.com…</div>
          <div class="bubble agent">
            <div class="muted">Calling tools</div>
            <div class="tools">
              <span class="tool active">inspect_page</span>
              <span class="tool">analyze_design</span>
              <span class="tool">capture_screenshot</span>
              <span class="tool">generate_docs</span>
            </div>
            <div class="progress" style="margin-top:12px"><i style="--w:22%"></i></div>
          </div>
        </div>`,
        `<div class="side">
          <div class="meta"><b>inspect_page</b><br/>title · headings · landmarks · links</div>
          <div class="json"><span class="k">"h1"</span>: <span class="s">"Example Domain"</span>
<span class="k">"links"</span>: <span class="n">1</span>
<span class="k">"landmarks"</span>: [<span class="s">"main"</span>]</div>
          <div class="footer-note">Structured DOM JSON for the host LLM</div>
        </div>`,
        'inspect_page',
      ),
    ),
  },
  {
    delayMs: 1600,
    html: frame(
      shell(
        `<div class="chat">
          <div class="bubble user">Analyze https://example.com…</div>
          <div class="bubble agent">
            <div class="muted">Calling tools</div>
            <div class="tools">
              <span class="tool done">inspect_page</span>
              <span class="tool active">analyze_design</span>
              <span class="tool">capture_screenshot</span>
              <span class="tool">generate_docs</span>
            </div>
            <div class="progress" style="margin-top:12px"><i style="--w:48%"></i></div>
          </div>
        </div>`,
        `<div class="side">
          <div class="meta"><b>Design tokens</b></div>
          <div class="swatches">
            <div class="swatch" style="background:#ffffff"></div>
            <div class="swatch" style="background:#1a1a1a"></div>
            <div class="swatch" style="background:#2a5db0"></div>
            <div class="swatch" style="background:#f5f5f5"></div>
            <div class="swatch" style="background:#737373"></div>
          </div>
          <div class="meta">
            type: <b>system-ui / 16px</b><br/>
            spacing: <b>8 · 16 · 24 · 40</b><br/>
            radius: <b>0–4px</b>
          </div>
          <div class="footer-note">Colors · typography · spacing · radius · shadows</div>
        </div>`,
        'analyze_design',
      ),
    ),
  },
  {
    delayMs: 1500,
    html: frame(
      shell(
        `<div class="chat">
          <div class="bubble user">Analyze https://example.com…</div>
          <div class="bubble agent">
            <div class="muted">Calling tools</div>
            <div class="tools">
              <span class="tool done">inspect_page</span>
              <span class="tool done">analyze_design</span>
              <span class="tool active">capture_screenshot</span>
              <span class="tool">generate_docs</span>
            </div>
            <div class="progress" style="margin-top:12px"><i style="--w:72%"></i></div>
          </div>
        </div>`,
        `<div class="side">
          <div class="meta"><b>Responsive viewports</b></div>
          <div class="viewports">
            <div class="vp m"><div class="bar"></div><div class="body" style="height:70px"><div class="hero-line"></div><div class="hero-line short"></div><div class="cta"></div></div><div class="label">375</div></div>
            <div class="vp t"><div class="bar"></div><div class="body" style="height:58px"><div class="hero-line"></div><div class="hero-line short"></div><div class="cta"></div></div><div class="label">768</div></div>
            <div class="vp d"><div class="bar"></div><div class="body" style="height:64px"><div class="hero-line"></div><div class="hero-line short"></div><div class="cta"></div></div><div class="label">1440</div></div>
          </div>
          <div class="meta" style="margin-top:4px">mobile.png · tablet.png · desktop.png</div>
          <div class="footer-note">Up to 5 viewport widths</div>
        </div>`,
        'capture_screenshot',
      ),
    ),
  },
  {
    delayMs: 2000,
    html: frame(
      shell(
        `<div class="chat">
          <div class="bubble user">Analyze https://example.com…</div>
          <div class="bubble agent">
            <div class="muted">Done</div>
            Design system extracted. Docs written under <b style="color:#e7ecf3;font-weight:600">docs/example.com/</b>
            <div class="tools" style="margin-top:8px">
              <span class="tool done">inspect_page</span>
              <span class="tool done">analyze_design</span>
              <span class="tool done">capture_screenshot</span>
              <span class="tool done">generate_docs</span>
            </div>
            <div class="progress" style="margin-top:12px"><i style="--w:100%"></i></div>
          </div>
        </div>`,
        `<div class="side">
          <div class="meta"><b>Generated files</b></div>
          <div class="files">
            <div class="file"><span class="check">✓</span> design.md</div>
            <div class="file"><span class="check">✓</span> rule.md</div>
            <div class="file"><span class="check">✓</span> component.md</div>
            <div class="file"><span class="check">✓</span> layout.md</div>
            <div class="file"><span class="check">✓</span> screenshots/</div>
          </div>
          <div class="footer-note">Ready for your AI agent to rebuild the UI</div>
        </div>`,
        'generate_docs ✓',
      ),
    ),
  },
];

async function main() {
  mkdirSync(dirname(outPath), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: W, height: H },
    deviceScaleFactor: 1,
  });

  const encoder = new GIFEncoder(W, H, 'neuquant', true);
  encoder.setRepeat(0);
  encoder.start();

  for (const scene of scenes) {
    await page.setContent(scene.html, { waitUntil: 'networkidle' });
    // Give webfonts a beat; fall back fine if offline
    await page.waitForTimeout(250);
    const buf = await page.screenshot({ type: 'png' });
    const png = PNG.sync.read(buf);
    encoder.setDelay(scene.delayMs);
    encoder.addFrame(png.data);
  }

  encoder.finish();
  writeFileSync(outPath, encoder.out.getData());
  await browser.close();
  console.log(`Wrote ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
