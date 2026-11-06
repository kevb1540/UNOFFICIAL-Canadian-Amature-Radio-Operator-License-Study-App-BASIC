// ©️ Kevin W. Brown 2026
// Exercise the shipped screens and formula content, including mobile and Back behavior.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/playwright' : 'playwright');
const root = path.resolve(__dirname, '../app/src/main/assets');
const screenshots = path.resolve(__dirname, '../../research/formulas');
fs.mkdirSync(screenshots, { recursive: true });
const guide = JSON.parse(fs.readFileSync(path.join(root, 'formula-guide.json')));
const course = JSON.parse(fs.readFileSync(path.join(root, 'course.json')));
const errors = [], externalRequests = [];
let checks = 0;
const server = http.createServer((req, res) => {
  const name = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(root, name === '/' ? 'index.html' : name);
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
  try {
    res.setHeader('Content-Type', file.endsWith('.js') ? 'application/javascript'
      : file.endsWith('.css') ? 'text/css' : file.endsWith('.json') ? 'application/json'
      : file.endsWith('.png') ? 'image/png' : 'text/html');
    res.end(fs.readFileSync(file));
  } catch { res.writeHead(404); res.end(); }
});
async function check(name, run) { await run(); checks++; console.log('PASS', name); }
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({ headless: true,
    executablePath: process.env.CHROME_BIN || path.resolve(__dirname,
      '../../toolchain/chromium/chrome-headless-shell-linux64/chrome-headless-shell'),
    args: ['--no-sandbox'] });
  try {
    const context = await browser.newContext({ viewport: { width: 393, height: 852 } });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => {
      if (!request.url().startsWith(url + '/')) externalRequests.push(request.url());
    });
    await page.goto(url);
    await page.waitForFunction(() => window.MaplewaveTest);
    await page.locator('[data-action="profile-new"]').click();
    await page.locator('#new-name').fill('Formula learner');
    await page.locator('#new-password').fill('Formula study passphrase');
    await page.locator('#new-confirm').fill('Formula study passphrase');
    await page.locator('#new-email').fill('formulas@example.org');
    await page.locator('[data-profile-form="create"] button[type="submit"]').click();
    await page.locator('#login-password').fill('Formula study passphrase');
    await page.locator('[data-profile-form="login"] button[type="submit"]').click();
    await page.waitForFunction(() => MaplewaveTest.signedIn);
    const navigate = view => page.evaluate(v => MaplewaveTest.navigate(v), view);
    const open = async id => {
      await navigate('reference');
      await page.locator(`.formula-link[data-id="${id}"]`).click();
    };
    await check('every existing formula has a complete guide with valid related formulas and labs', async () => {
      assert.equal(guide.formulas.length, 16);
      assert.deepEqual(guide.formulas.map(f => f.title), course.formulas.map(f => f.title));
      const ids = new Set(guide.formulas.map(f => f.id));
      assert.equal(ids.size, guide.formulas.length);
      for (const f of guide.formulas) {
        assert.ok(f.definition.length > 80, f.id);
        assert.ok(f.variables.length >= 2, f.id);
        assert.ok(f.symbols.length >= 3, f.id);
        assert.ok(f.rearrangements.length >= 2, f.id);
        assert.ok(f.example.steps.length >= 3, f.id);
        assert.ok(f.tips.length >= 3, f.id);
        for (const variable of f.variables) for (const key of ['symbol', 'name', 'unit', 'meaning'])
          assert.ok(variable[key], f.id + ': ' + key);
        for (const key of f.symbols) assert.equal(guide.notation[key].length, 3, f.id);
        for (const id of f.related) assert.ok(ids.has(id) && id !== f.id, f.id);
        assert.ok(!f.lab || course.labs.some(lab => lab.id === f.lab), f.id);
        for (const id of f.sources) assert.ok(guide.references[id].url.startsWith('https://'), f.id);
      }
    });
    await check('tapping any part of each formula card opens its full dedicated page without changing progress', async () => {
      const before = await page.evaluate(() => JSON.stringify(MaplewaveTest.state));
      for (const [i, f] of guide.formulas.entries()) {
        await navigate('reference');
        assert.equal(await page.locator('.formula-link').count(), 16);
        const card = page.locator(`.formula-link[data-id="${f.id}"]`);
        await card.locator(i % 2 ? '.helper' : '.formula').click();
        assert.equal(await page.locator('main h1').innerText(), f.title);
        assert.equal(await page.locator('.formula-hero').innerText(), course.formulas[i].formula);
        assert.equal(await page.locator('#formula-definition p').innerText(), f.definition);
        assert.equal(await page.locator('.formula-table tbody tr').count(), f.variables.length);
        assert.equal(await page.locator('.formula-notation dt').count(), f.symbols.length);
        assert.equal(await page.locator('.formula-rearrangement').count(), f.rearrangements.length);
        assert.equal(await page.locator('#formula-example ol li').count(), f.example.steps.length);
        assert.equal(await page.locator('main h1').evaluate(el => el === document.activeElement), true);
        assert.ok((await page.locator('.copyright').innerText()).includes('Kevin W. Brown 2026'));
        await page.locator('main > .back').click();
        assert.equal(await page.locator('.formula-link:focus').getAttribute('data-id'), f.id);
      }
      assert.equal(await page.evaluate(() => JSON.stringify(MaplewaveTest.state)), before);
    });
    await check('formula cards support Enter and Space; Android Back restores list position and focus', async () => {
      await navigate('reference');
      const card = page.locator('.formula-link[data-id="lc-resonance"]');
      await card.scrollIntoViewIfNeeded();
      await card.focus();
      const before = await page.evaluate(() => scrollY);
      await page.keyboard.press('Enter');
      assert.equal(await page.locator('h1').innerText(), 'LC resonance');
      await page.evaluate(() => appBack());
      assert.ok(Math.abs(await page.evaluate(() => scrollY) - before) < 2);
      assert.equal(await page.locator('.formula-link:focus').getAttribute('data-id'), 'lc-resonance');
      await page.keyboard.press('Space');
      assert.equal(await page.locator('h1').innerText(), 'LC resonance');
    });
    await check('section shortcuts keep headings below the fixed header and glossary returns to the same formula', async () => {
      await page.getByRole('link', { name: 'Rearrange', exact: true }).click();
      const heading = await page.locator('#formula-rearrange').boundingBox();
      const header = await page.locator('.appbar').boundingBox();
      assert.ok(heading.y >= header.y + header.height - 1);
      const before = await page.evaluate(() => ({ html: document.querySelector('main').innerHTML,
        state: JSON.stringify(MaplewaveTest.state), scroll: scrollY }));
      await page.locator('.glossary-shortcut').click();
      await page.locator('#quick-glossary-search').fill('resonance');
      await page.evaluate(() => appBack());
      const after = await page.evaluate(() => ({ html: document.querySelector('main').innerHTML,
        state: JSON.stringify(MaplewaveTest.state), scroll: scrollY }));
      assert.deepEqual(after, before);
    });
    await check('related formula buttons open their lessons and lab buttons open the correct interactive lab', async () => {
      await open('lc-resonance');
      await page.locator('#formula-related [data-action="formula"][data-id="inductive-reactance"]').click();
      assert.equal(await page.locator('h1').innerText(), 'Inductive reactance');
      for (const f of guide.formulas.filter(f => f.lab)) {
        await open(f.id);
        await page.locator('#formula-related [data-action="lab"]').click();
        assert.equal(await page.locator('h1').innerText(), course.labs.find(lab => lab.id === f.lab).title);
      }
    });
    await check('all formula pages fit small phones, normal phones, landscape and tablets', async () => {
      for (const viewport of [{ width: 320, height: 740 }, { width: 393, height: 852 },
        { width: 852, height: 393 }, { width: 800, height: 1280 }]) {
        await page.setViewportSize(viewport);
        for (const f of guide.formulas) {
          await open(f.id);
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1),
            false, f.id + ' ' + JSON.stringify(viewport));
          assert.equal(await page.locator('.formula-detail').isVisible(), true);
        }
      }
      await page.setViewportSize({ width: 393, height: 852 });
      await open('lc-resonance');
      await page.screenshot({ path: path.join(screenshots, 'lc-resonance-phone.png'), fullPage: true });
      await open('swr-reflection');
      await page.screenshot({ path: path.join(screenshots, 'swr-phone.png'), fullPage: true });
      await navigate('reference');
      await page.screenshot({ path: path.join(screenshots, 'formula-list-phone.png') });
    });
    await check('formula lessons escape authored text as plain text and open publisher references safely', async () => {
      await page.evaluate(() => {
        window.originalDefinition = MaplewaveTest.formulaGuide.formulas[0].definition;
        MaplewaveTest.formulaGuide.formulas[0].definition = '<img src=x onerror="window.injected=true">';
      });
      await open('ohms-law');
      assert.equal(await page.locator('#formula-definition img').count(), 0);
      assert.ok((await page.locator('#formula-definition').innerText()).includes('<img'));
      assert.equal(await page.evaluate(() => window.injected), undefined);
      await page.evaluate(() => {
        MaplewaveTest.formulaGuide.formulas[0].definition = window.originalDefinition;
      });
      await open('lc-resonance');
      for (const link of await page.locator('#formula-sources a').evaluateAll(els => els.map(a =>
        ({ href: a.href, target: a.target, rel: a.rel })))) {
        assert.ok(link.href.startsWith('https://'));
        assert.equal(link.target, '_blank');
        assert.ok(link.rel.includes('noopener'));
      }
    });
    await check('letters and Greek symbols are explicitly named; every lesson loads without external requests or errors', async () => {
      for (const [id, names] of [['wavelength', ['Lambda']], ['lc-resonance', ['Pi', 'Square root']],
        ['swr-reflection', ['Capital gamma', 'magnitude']], ['fm-bandwidth', ['Capital delta']],
        ['power-db', ['Base-ten logarithm', 'antilogarithm']]]) {
        await open(id);
        const text = await page.locator('main').innerText();
        for (const name of names) assert.ok(text.includes(name), id + ': ' + name);
      }
      assert.deepEqual(errors, []);
      assert.deepEqual(externalRequests, []);
    });
    const report = { passed: checks, formulas: guide.formulas.length, errors, externalRequests,
      layouts: ['320×740', '393×852', '852×393', '800×1280'], checked_at: new Date().toISOString() };
    fs.writeFileSync(path.resolve(__dirname, '../formula-ui-test-report.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify(report));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => server.close());
