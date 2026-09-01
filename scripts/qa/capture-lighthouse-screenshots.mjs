import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';

const root = process.cwd();
const manifestPath = resolve(root, '.lighthouseci/manifest.json');
const outputDir = resolve(root, 'docs/assets/testing/lighthouse');

function readReportMetadata(htmlPath) {
  const html = readFileSync(htmlPath, 'utf8');
  const marker = 'window.__LIGHTHOUSE_JSON__ = ';
  const start = html.indexOf(marker);
  const end = html.indexOf(';</script>', start);

  if (start < 0 || end < 0) {
    throw new Error(`Lighthouse JSON not found in ${htmlPath}`);
  }

  return JSON.parse(html.slice(start + marker.length, end));
}

function endpointName(url) {
  const pathname = new URL(url).pathname;
  return pathname === '/en'
    ? 'homepage'
    : pathname.split('/').filter(Boolean).at(-1);
}

let manifest;
try {
  manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
} catch {
  throw new Error('Run `pnpm run test:lighthouse` first so .lighthouseci reports exist.');
}

const latestByUrl = new Map();
for (const entry of manifest) {
  const report = readReportMetadata(entry.htmlPath);
  const current = latestByUrl.get(entry.url);

  if (!current || report.fetchTime > current.report.fetchTime) {
    latestByUrl.set(entry.url, { entry, report });
  }
}

if (latestByUrl.size !== 6) {
  throw new Error(`Expected 6 Lighthouse endpoints, found ${latestByUrl.size}.`);
}

mkdirSync(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
const sources = [];

try {
  for (const [url, { entry, report }] of latestByUrl) {
    const page = await context.newPage();
    const reportUrl = pathToFileURL(entry.htmlPath).href;
    const output = resolve(outputDir, `${endpointName(url)}-full.png`);

    await page.goto(reportUrl, { waitUntil: 'load' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: output, fullPage: true });
    await page.close();

    sources.push({
      endpoint: new URL(url).pathname,
      report: entry.htmlPath.replace(`${root}/`, ''),
      output: output.replace(`${root}/`, ''),
      source: 'Lighthouse report HTML opened as file://',
      capture: 'Chromium fullPage screenshot',
      lighthouseVersion: report.lighthouseVersion,
      capturedAt: report.fetchTime,
    });
    console.log(`${url} <- ${reportUrl} -> ${output}`);
  }
} finally {
  await context.close();
  await browser.close();
}

writeFileSync(
  resolve(outputDir, 'sources.json'),
  `${JSON.stringify(sources, null, 2)}\n`,
);
console.log(`Captured ${sources.length} Lighthouse HTML reports as full-page PNGs.`);
