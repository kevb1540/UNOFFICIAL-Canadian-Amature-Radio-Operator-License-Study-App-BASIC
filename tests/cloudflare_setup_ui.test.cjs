// ©️ Kevin W. Brown 2026
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), http = require('node:http');
const playwright = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ? require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/playwright') : require('playwright');
test('setup page generates 32 private random bytes locally and fits phone/tablet screens', async t => {
  const source = fs.readFileSync(path.join(__dirname, '../recovery_service/cloudflare/worker.js'), 'utf8');
  const worker = (await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'))).default;
  const response = await worker.fetch(new Request('https://radio.example.org/'), {}, { waitUntil() {} });
  const headers = Object.fromEntries(response.headers), html = await response.text(), requests = [], errors = [];
  const server = http.createServer((req, res) => { requests.push(req.url); res.writeHead(200, headers); res.end(html); });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const launch = { headless: true, args: ['--no-sandbox'] };
  if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) launch.executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  const browser = await playwright.chromium.launch(launch); t.after(() => browser.close());
  const page = await browser.newPage(); page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:' + server.address().port);
  const requestCount = requests.length;
  await page.locator('#generate').click();
  const first = await page.locator('#key').inputValue(); assert.equal(Buffer.from(first, 'base64').length, 32);
  await page.locator('#generate').click();
  const second = await page.locator('#key').inputValue(); assert.equal(Buffer.from(second, 'base64').length, 32); assert.notEqual(first, second);
  assert.equal(requests.length, requestCount); assert.equal(await page.locator('#key').getAttribute('readonly'), '');
  for (const size of [{ width: 320, height: 740 }, { width: 393, height: 852 }, { width: 800, height: 1280 }]) {
    await page.setViewportSize(size);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, JSON.stringify(size));
  }
  if (process.env.CLOUDFLARE_SETUP_SCREENSHOT) await page.screenshot({ path: process.env.CLOUDFLARE_SETUP_SCREENSHOT, fullPage: true });
  assert.deepEqual(errors, []);
});
