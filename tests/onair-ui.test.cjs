// ©️ Kevin W. Brown 2026
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const root=path.resolve(__dirname,'../app/src/main/assets');
const guide=JSON.parse(fs.readFileSync(path.join(root,'onair-guide.json'))),original=JSON.parse(fs.readFileSync(path.join(root,'course.json'))).glossary;
const screenshots=path.resolve(__dirname,'../../research/onair');fs.mkdirSync(screenshots,{recursive:true});
let checks=0;const errors=[],external=[];
const server=http.createServer((req,res)=>{const name=decodeURIComponent(req.url.split('?')[0]),file=path.join(root,name==='/'?'index.html':name);if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}try{res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.json')?'application/json':file.endsWith('.png')?'image/png':'text/html');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});
async function check(name,run){await run();checks++;console.log('PASS',name);}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||path.resolve(__dirname,'../../toolchain/chromium/chrome-headless-shell-linux64/chrome-headless-shell'),args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:393,height:852}});page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith(url+'/'))external.push(r.url());});
  const nav=view=>page.evaluate(v=>MaplewaveTest.navigate(v),view);
  await page.goto(url);await page.waitForFunction(()=>window.MaplewaveTest);
  await check('all 61 terms have meanings, examples and notes; old glossary terms stay unique and intact',async()=>{
   assert.equal(guide.entries.length,61);assert.equal(new Set(guide.entries.map(e=>e.id)).size,61);assert.equal(guide.groups.length,6);
   for(const e of guide.entries){assert.ok(e.meaning&&e.example&&e.note,e.term);assert.ok(guide.groups.some(g=>g.id===e.group),e.term);if(e.group==='q-codes')assert.ok(e.question&&e.statement,e.term);}
   const merged=await page.evaluate(()=>MaplewaveTest.course.glossary);assert.equal(merged.length,223);assert.equal(new Set(merged.map(g=>g.term.toLowerCase())).size,223);for(const old of original){const current=merged.find(g=>g.term===old.term);assert.ok(current,old.term);assert.equal(current.definition,old.definition,old.term);assert.equal(current.category,old.category,old.term);if(old.example)assert.equal(current.example,old.example,old.term);}
  });
  await check('both glossary and definitions link to the on-air section before login, with correct Back destinations',async()=>{
   for(const view of ['glossary','definitions']){await nav(view);await page.locator('[data-action="onair-open"]').click();assert.equal(await page.locator('main h1').innerText(),'On-air terms & phrases');assert.equal(await page.locator('[data-onair-id]').count(),61);await page.evaluate(()=>appBack());assert.equal(await page.locator('[data-action="onair-open"]').count(),1);assert.ok((await page.locator('main h1').innerText()).includes(view==='glossary'?'radio language':'What changes'));}
  });
  await check('topic filters and everyday search aliases find the right meanings and show a usable empty state',async()=>{
   await nav('glossary');await page.locator('[data-action="onair-open"]').click();await page.locator('#onair-search').fill('five by nine');assert.equal(await page.locator('[data-onair-id="five-nine"]').count(),1);assert.ok((await page.locator('[data-onair-id="five-nine"]').innerText()).includes('does not mean 59 percent'));
   await page.locator('#onair-search').fill('');await page.locator('#onair-group').selectOption('q-codes');assert.equal(await page.locator('[data-onair-id]').count(),16);await page.locator('#onair-search').fill('QRS');assert.equal(await page.locator('[data-onair-id]').count(),1);assert.ok((await page.locator('[data-onair-id="qrs"]').innerText()).includes('Morse'));
   await page.locator('#onair-search').fill('no-such-phrase-123');assert.ok((await page.locator('#onair-results').innerText()).includes('No matching'));await page.locator('#onair-group').selectOption('');await page.locator('#onair-search').fill('');assert.equal(await page.locator('[data-onair-id]').count(),61);
  });
  await check('the spelling alphabet has all 26 standard words and conversation examples use visible placeholders',async()=>{
   await page.locator('.onair-phonetics summary').click();assert.equal(await page.locator('.onair-phonetics tbody tr').count(),26);const words=await page.locator('.onair-phonetics td').allTextContents();assert.equal(words[0],'Alfa');assert.equal(words[9],'Juliett');assert.equal(words[23],'X-ray');assert.equal(await page.locator('.onair-conversation').count(),3);assert.ok((await page.locator('.onair-conversation').first().innerText()).includes('[Your call sign]'));
  });
  await check('every on-air term is searchable in the main glossary and the on-air category includes old and new entries',async()=>{
   await nav('glossary');await page.locator('#glossary-category').selectOption({label:'On-air language'});assert.equal(await page.locator('#glossary-list details').count(),61);
   for(const term of ['CQ','QSL','Monitoring','Roger','59 (five nine)','Say again','Emergency traffic']){await page.locator('#glossary-search').fill(term);assert.ok((await page.locator('#glossary-list').innerText()).includes(term));}
   await page.locator('#glossary-search').fill('');await page.locator('#glossary-category').selectOption('');
  });
  await page.locator('.brand').click();await page.locator('[data-action="profile-new"]').click();await page.locator('#new-name').fill('On-air learner');await page.locator('#new-password').fill('On-air radio passphrase');await page.locator('#new-confirm').fill('On-air radio passphrase');await page.locator('#new-email').fill('onair@example.org');await page.locator('[data-profile-form="create"] button[type="submit"]').click();await page.locator('#login-password').fill('On-air radio passphrase');await page.locator('[data-profile-form="login"] button[type="submit"]').click();await page.waitForFunction(()=>MaplewaveTest.signedIn);
  await check('quick lookup during a test preserves the answer, question, flags and all progress',async()=>{
   await page.evaluate(()=>{const t=MaplewaveTest;t.state.active=RadioCore.session(t.bank.slice(0,10),'quick','On-air preservation test');t.state.active.current=2;t.state.active.answers[2]=1;t.state.active.flags[2]=true;t.navigate('quiz');});const before=await page.evaluate(()=>({html:document.querySelector('main').innerHTML,state:JSON.stringify(MaplewaveTest.state)}));await page.locator('.glossary-shortcut').click();await page.locator('#quick-glossary-search').fill('Say again');assert.ok((await page.locator('#quick-glossary-list').innerText()).includes('last three letters'));await page.evaluate(()=>appBack());assert.deepEqual(await page.evaluate(()=>({html:document.querySelector('main').innerHTML,state:JSON.stringify(MaplewaveTest.state)})),before);
  });
  await check('on-air browsing leaves scores, notes, highlighter choice and the unfinished test unchanged',async()=>{
   const before=await page.evaluate(()=>JSON.stringify(MaplewaveTest.state));await nav('glossary');await page.locator('[data-action="onair-open"]').click();for(const id of ['cq','qsl','roger','break','73']){await page.locator(`[data-onair-id="${id}"] summary`).click();assert.equal(await page.locator(`[data-onair-id="${id}"]`).getAttribute('open'),'');}await page.locator('.glossary-shortcut').click();await page.locator('#quick-glossary-search').fill('QTH');await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>JSON.stringify(MaplewaveTest.state)),before);
  });
  await check('all six topics, long examples and the spelling table fit phone, landscape and tablet layouts',async()=>{
   for(const viewport of [{width:320,height:740},{width:393,height:852},{width:852,height:393},{width:800,height:1280}]){await page.setViewportSize(viewport);for(const group of ['',...guide.groups.map(g=>g.id)]){await page.locator('#onair-group').selectOption(group);await page.locator('#onair-search').fill(group?'':' ');await page.locator('#onair-results details').evaluateAll(els=>els.forEach(e=>e.open=true));await page.locator('.onair-phonetics').evaluate(e=>e.open=true);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,JSON.stringify(viewport)+' '+group);}}
   await page.setViewportSize({width:393,height:852});await page.locator('#onair-group').selectOption('');await page.locator('#onair-search').fill('five nine');await page.screenshot({path:path.join(screenshots,'signal-report-phone.png'),fullPage:true});await page.locator('#onair-search').fill('');await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(screenshots,'onair-section-phone.png')});
  });
  await check('authored entries render as plain text, reference links are safe, and offline content makes no external requests',async()=>{
   await page.evaluate(()=>{window.savedMeaning=MaplewaveTest.onAirGuide.entries[0].meaning;MaplewaveTest.onAirGuide.entries[0].meaning='<img src=x onerror="window.injected=true">';MaplewaveTest.navigate('onair');});await page.locator('#onair-search').fill('CQ');assert.equal(await page.locator('[data-onair-id="cq"] img').count(),0);assert.ok((await page.locator('[data-onair-id="cq"]').innerText()).includes('<img'));assert.equal(await page.evaluate(()=>window.injected),undefined);await page.evaluate(()=>{MaplewaveTest.onAirGuide.entries[0].meaning=window.savedMeaning;});
   for(const link of await page.locator('.onair-references a').evaluateAll(els=>els.map(a=>({href:a.href,target:a.target,rel:a.rel})))){assert.ok(link.href.startsWith('https://'));assert.equal(link.target,'_blank');assert.ok(link.rel.includes('noopener'));}assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  });
  const report={passed:checks,on_air_terms:61,glossary_terms:223,groups:6,errors,external_requests:external,layouts:['320×740','393×852','852×393','800×1280'],checked_at:new Date().toISOString()};fs.writeFileSync(path.resolve(__dirname,'../onair-ui-test-report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
