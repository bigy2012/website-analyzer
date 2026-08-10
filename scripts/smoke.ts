import { generateDocs } from '../src/tools/generate-docs.ts';
import { closeBrowser } from '../src/browser/playwright.ts';

async function main() {
  const result = await generateDocs('https://example.com', {
    outputDir: './docs',
    screenshots: true,
    documents: ['design', 'rule', 'component', 'layout', 'content', 'readme'],
  });
  console.log(JSON.stringify({ outputDir: result.outputDir, files: result.files }, null, 2));
  await closeBrowser();
}

main().catch(async (err) => {
  console.error(err);
  await closeBrowser();
  process.exit(1);
});
