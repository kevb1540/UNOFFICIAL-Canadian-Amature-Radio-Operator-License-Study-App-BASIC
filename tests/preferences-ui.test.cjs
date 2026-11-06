// Shipped UI and profile storage, with a controllable on-device speech bridge.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const project=path.resolve(__dirname,'..'),root=path.join(project,'app/src/main/assets');
const screenshotDir=path.resolve(__dirname,'../../research/preferences');fs.mkdirSync(screenshotDir,{recursive:true});
const checks=[],errors=[];
const server=http.createServer((req,res)=>{const name=new URL(req.url,'http://localhost').pathname,file=path.resolve(root,'.'+(name==='/'?'/index.html':name));if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}try{res.setHeader('Content-Type',file.endsWith('.json')?'application/json':file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.png')?'image/png':'text/html');res.end(fs.readFileSync(file));}catch(e){res.writeHead(404);res.end();}});
const password='Settings and reading passphrase';
async function check(name,fn){await fn();checks.push(name);console.log('PASS',name);}
function luminance(colour){const rgb=colour.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
(async()=>{let browser;try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:393,height:852}});page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  window.__catalog={ready:true,error:'',voices:[{id:'local-one',name:'English voice 1',language:'en-CA',offline:true},{id:'local-two',name:'English voice 2',language:'en-CA',offline:true},{id:'local-three',name:'English voice 3',language:'en-US',offline:true},{id:'network',name:'Cloud voice',language:'en-CA',offline:false}]};
  window.__speechCalls=[];window.__stops=0;window.__writeFail=false;window.__themes=[];window.__refreshCalls=0;window.__phoneSettings=0;
  window.AndroidApp={version:()=>JSON.stringify({name:'2.3.42',code:272}),loadProfiles:()=>localStorage.getItem('maplewave-profiles-v1')||'',saveProfiles:text=>{if(window.__writeFail)return false;localStorage.setItem('maplewave-profiles-v1',text);return true;},lessonVoices:()=>JSON.stringify(window.__catalog),speakLessonChunk:(text,voice,rate,id)=>{window.__speechCalls.push({text,voice,rate,id});queueMicrotask(()=>{onLessonSpeechEvent(id,'start','');const word=[...new Intl.Segmenter('en',{granularity:'word'}).segment(text)].find(p=>p.isWordLike);if(word)onLessonSpeechBoundary(id,word.index,word.index+word.segment.length);});},stopLessonSpeech:()=>window.__stops++,applyColourTheme:(colour,light)=>window.__themes.push({colour,light}),openSpeechSettings:()=>window.__phoneSettings++,refreshLessonVoices:()=>window.__refreshCalls++};
 });
 await page.goto(url);await page.waitForFunction(()=>window.MaplewaveTest);
 async function create(name){await page.locator('[data-action="profile-new"]').click();await page.locator('#new-name').fill(name);await page.locator('#new-password').fill(password);await page.locator('#new-confirm').fill(password);await page.locator('#new-email').fill(name.toLowerCase().replace(/ /g,'-')+'@example.org');await page.locator('[data-profile-form="create"] button[type="submit"]').click();await page.locator('#login-password').fill(password);await page.locator('[data-profile-form="login"] button[type="submit"]').click();await page.waitForFunction(()=>MaplewaveTest.signedIn);}
 async function login(name){await page.locator('.profile-row').filter({hasText:name}).click();await page.locator('#login-password').fill(password);await page.locator('[data-profile-form="login"] button[type="submit"]').click();await page.waitForFunction(()=>MaplewaveTest.signedIn);}
 async function logout(){if(!await page.locator('.profile-banner').count())await page.evaluate(()=>MaplewaveTest.navigate('home'));await page.locator('.footer-signout [data-action="profile-logout"]').click();await page.waitForFunction(()=>!MaplewaveTest.signedIn);}
 async function settings(){await page.evaluate(()=>MaplewaveTest.navigate('settings'));await page.locator('#reading-preferences').waitFor();}
 async function saved(){await page.waitForFunction(()=>document.querySelector('.preferences-save-status')?.textContent==='Settings saved for this profile.');await page.evaluate(()=>MaplewaveTest.flush());}
 await create('Reader Alpha');
 await check('Settings offers one available-voice list, one preview and eight themes, with no sex selection',async()=>{
  await page.locator('.profile-banner [data-to="settings"]').click();assert.equal(await page.locator('main h1').innerText(),'Settings');assert.equal(await page.locator('.theme-choice').count(),8);assert.equal(await page.locator('[name="voice-gender"],#female-voice,#male-voice').count(),0);assert.equal(await page.locator('#reading-voice').count(),1);assert.equal(await page.locator('[data-action="preview-reading-voice"]').count(),1);assert.equal(await page.locator('#reading-voice option').count(),4);assert.ok(!(await page.locator('#reading-voice').innerText()).includes('Cloud'));assert.equal(await page.locator('[data-action="stop-reading"]').count(),0);assert.equal(await page.locator('[data-action="refresh-reading-voices"]').isVisible(),false);await page.screenshot({path:path.join(screenshotDir,'options-page-phone.png')});
 });
 await check('The speech slider shows a live value, saves on release, and previews each selected voice at that speed',async()=>{
  const slider=page.locator('#reading-speed');assert.equal(await slider.getAttribute('type'),'range');assert.equal(await slider.getAttribute('min'),'0.5');assert.equal(await slider.getAttribute('max'),'2');
  await slider.evaluate(el=>{el.value='1.25';el.dispatchEvent(new Event('input',{bubbles:true}));});
  assert.equal(await page.locator('#reading-speed-value').innerText(),'1.25×');assert.equal(await page.evaluate(()=>MaplewaveTest.state.settings.speechRate),1);
  await slider.evaluate(el=>el.dispatchEvent(new Event('change',{bubbles:true})));await saved();assert.equal(await page.evaluate(()=>MaplewaveTest.state.settings.speechRate),1.25);
  for(const voice of ['local-one','local-two']){await page.locator('#reading-voice').selectOption(voice);await saved();await page.locator('[data-action="preview-reading-voice"]').click();const call=await page.evaluate(()=>window.__speechCalls.at(-1));assert.equal(call.voice,voice);assert.equal(call.rate,1.25);assert.equal(await page.evaluate(()=>MaplewaveTest.state.settings.readingVoice),voice);}
  await page.locator('[data-action="stop-reading"]').click();
 });
 await check('Preview captures the live speed without waiting for a slider change event or altering saved preferences',async()=>{
  const slider=page.locator('#reading-speed');
  await slider.evaluate(el=>{el.value='1.6';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.locator('#reading-voice-preview').click();
  const call=await page.evaluate(()=>window.__speechCalls.at(-1));
  assert.equal(call.voice,'local-two');assert.equal(call.rate,1.6);assert.ok(call.text.includes('sample of your reading voice'));
  assert.equal(await page.evaluate(()=>MaplewaveTest.state.settings.speechRate),1.25);
  await page.locator('#reading-voice-preview').click();
  await slider.evaluate(el=>{el.value='1.25';el.dispatchEvent(new Event('input',{bubbles:true}));});
 });
 await check('Preview and Stop share one button without moving or losing keyboard focus; pause, end, errors and cancellation restore Preview',async()=>{
  const button=page.locator('#reading-voice-preview'),preview='preview-reading-voice',stop='stop-reading';
  assert.equal(await button.getAttribute('data-action'),preview);assert.equal(await page.locator('[data-action="stop-reading"]').count(),0);
  await button.scrollIntoViewIfNeeded();const box=await button.boundingBox();await button.focus();await page.keyboard.press('Enter');
  assert.equal(await button.getAttribute('data-action'),stop);assert.equal(await button.innerText(),'Stop reading');assert.equal(await page.locator('[data-action="preview-reading-voice"]').count(),0);
  assert.deepEqual(await button.boundingBox(),box);assert.equal(await button.evaluate(e=>e===document.activeElement),true);
  await page.keyboard.press('Enter');assert.equal(await button.getAttribute('data-action'),preview);assert.deepEqual(await button.boundingBox(),box);
  await button.click();const old=await page.evaluate(()=>window.__speechCalls.at(-1).id);await page.locator('#floating-reading-toggle').click();assert.equal(await button.getAttribute('data-action'),preview);
  await page.locator('#floating-reading-toggle').click();assert.equal(await button.getAttribute('data-action'),stop);
  await page.evaluate(id=>onLessonSpeechEvent(id,'done',''),old);assert.equal(await button.getAttribute('data-action'),stop);
  await page.evaluate(()=>onLessonSpeechEvent(window.__speechCalls.at(-1).id,'done',''));assert.equal(await button.getAttribute('data-action'),preview);
  await button.click();await page.evaluate(()=>onLessonSpeechEvent(window.__speechCalls.at(-1).id,'error','Simulated preview error'));assert.equal(await button.getAttribute('data-action'),preview);
  await button.click();await page.evaluate(()=>dispatchEvent(new Event('pagehide')));assert.equal(await button.getAttribute('data-action'),preview);
  await button.click();await page.evaluate(()=>MaplewaveTest.navigate('home'));await settings();assert.equal(await button.getAttribute('data-action'),preview);
 });
 await check('Refresh is hidden initially, appears only for voice edits or phone settings, and hides immediately when clicked',async()=>{
  const refresh=page.locator('[data-action="refresh-reading-voices"]');
  // The preceding saved voice/speed edits need one refresh.
  assert.equal(await refresh.isVisible(),true);const count=await page.evaluate(()=>window.__refreshCalls);await refresh.click();assert.equal(await refresh.isVisible(),false);assert.equal(await page.evaluate(()=>window.__refreshCalls),count+1);
  await page.evaluate(()=>onLessonVoicesChanged());assert.equal(await refresh.isVisible(),false);
  await page.locator('[data-theme="ocean"].theme-choice').click();await saved();assert.equal(await refresh.isVisible(),false);
  await page.locator('#sound-effects').uncheck();await saved();assert.equal(await refresh.isVisible(),false);
  await page.locator('#reading-voice').selectOption('local-three');await saved();assert.equal(await refresh.isVisible(),true);
  await page.evaluate(()=>MaplewaveTest.navigate('home'));await settings();assert.equal(await refresh.isVisible(),true);await refresh.click();assert.equal(await refresh.isVisible(),false);
  await page.locator('#reading-voice').evaluate(e=>e.dispatchEvent(new Event('change',{bubbles:true})));await saved();assert.equal(await refresh.isVisible(),false);
  await page.evaluate(()=>window.__writeFail=true);await page.locator('#reading-voice').selectOption('local-one');await page.waitForFunction(()=>document.querySelector('.preferences-save-status').textContent==='Settings could not be saved.');assert.equal(await refresh.isVisible(),false);assert.equal(await page.locator('#reading-voice').inputValue(),'local-three');await page.evaluate(()=>window.__writeFail=false);
  await page.locator('#reading-speed').evaluate(e=>{e.value='1.3';e.dispatchEvent(new Event('change',{bubbles:true}));});await saved();assert.equal(await refresh.isVisible(),true);await refresh.click();assert.equal(await refresh.isVisible(),false);
  await page.locator('[data-action="phone-voice-settings"]').click();assert.equal(await page.evaluate(()=>window.__phoneSettings),1);assert.equal(await refresh.isVisible(),true);await page.evaluate(()=>onLessonVoicesChanged());assert.equal(await refresh.isVisible(),true);await refresh.click();assert.equal(await refresh.isVisible(),false);
  await page.locator('#reading-voice').selectOption('local-two');await saved();await page.locator('#reading-speed').evaluate(e=>{e.value='1.25';e.dispatchEvent(new Event('change',{bubbles:true}));});await saved();await refresh.click();
  await page.locator('#sound-effects').check();await saved();
 });
 await check('The highlighted Refresh button is readable and distinct in all eight themes; Preview and Stop occupy identical rectangles at phone and tablet sizes',async()=>{
  await page.locator('[data-action="phone-voice-settings"]').click();const refresh=page.locator('[data-action="refresh-reading-voices"]'),button=page.locator('#reading-voice-preview');
  for(const id of await page.locator('.theme-choice').evaluateAll(xs=>xs.map(x=>x.dataset.theme))){
   await page.locator(`[data-theme="${id}"].theme-choice`).click();await saved();const colours=await refresh.evaluate(e=>{const s=getComputedStyle(e),root=getComputedStyle(document.documentElement);return {text:s.color,bg:s.backgroundColor,accent:root.getPropertyValue('--accent').trim()};});assert.ok(contrast(colours.text,colours.bg)>=4.5,id+' refresh text');assert.equal(colours.bg,'rgb(255, 196, 0)');
  }
  for(const theme of ['midnight','daylight']){await page.locator(`[data-theme="${theme}"].theme-choice`).click();await saved();for(const size of [{width:320,height:740},{width:393,height:852},{width:852,height:393},{width:800,height:1280}]){
   await page.setViewportSize(size);await button.scrollIntoViewIfNeeded();const before=await button.boundingBox();await button.click();assert.deepEqual(await button.boundingBox(),before);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);await page.screenshot({path:path.join(screenshotDir,`voice-playing-${theme}-${size.width}.png`)});await button.click();assert.deepEqual(await button.boundingBox(),before);
  }}
  await page.setViewportSize({width:393,height:852});await refresh.scrollIntoViewIfNeeded();await page.screenshot({path:path.join(screenshotDir,'voice-edited-refresh.png')});await refresh.click();
 });
 await check('Every theme applies immediately and gives readable body, secondary and button text',async()=>{
  const ids=await page.locator('.theme-choice').evaluateAll(xs=>xs.map(x=>x.dataset.theme));
  for(const id of ids){await page.locator(`[data-theme="${id}"].theme-choice`).click();await saved();assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),id);const colours=await page.evaluate(()=>{const body=getComputedStyle(document.body),button=getComputedStyle(document.querySelector('.btn.primary')),helper=getComputedStyle(document.querySelector('.profile-options .muted')),card=getComputedStyle(document.querySelector('.profile-options'));return {text:body.color,bg:body.backgroundColor,helper:helper.color,card:card.backgroundColor,buttonText:button.color,buttonBg:button.backgroundColor};});assert.ok(contrast(colours.text,colours.bg)>=4.5,id+' body');assert.ok(contrast(colours.helper,colours.card)>=4.5,id+' secondary');assert.ok(contrast(colours.buttonText,colours.buttonBg)>=4.5,id+' button');}
  await page.screenshot({path:path.join(screenshotDir,'settings-paper-phone.png'),fullPage:true});await page.locator('[data-theme="forest"].theme-choice').click();await saved();
 });
 await check('A failed settings write rolls back the theme and retains the last saved profile choices',async()=>{
  await page.evaluate(()=>window.__writeFail=true);await page.locator('[data-theme="daylight"].theme-choice').click();await page.waitForFunction(()=>document.querySelector('.preferences-save-status').textContent==='Settings could not be saved.');assert.equal(await page.evaluate(()=>MaplewaveTest.state.settings.theme),'forest');assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'forest');await page.evaluate(()=>window.__writeFail=false);
 });
 await check('Voice and theme choices survive a locked reload; a second profile keeps independent settings',async()=>{
  await page.reload();await page.waitForFunction(()=>window.MaplewaveTest);assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'midnight');await login('Reader Alpha');assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'forest');assert.equal(await page.evaluate(()=>MaplewaveTest.state.settings.readingVoice),'local-two');
  await settings();assert.equal(await page.locator('[data-action="refresh-reading-voices"]').isVisible(),false);
  await logout();assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'midnight');await create('Reader Beta');assert.equal(await page.evaluate(()=>MaplewaveTest.state.settings.theme),'midnight');assert.equal(await page.evaluate(()=>MaplewaveTest.state.settings.readingVoice),'');await settings();assert.equal(await page.locator('[data-action="refresh-reading-voices"]').isVisible(),false);await page.locator('#reading-voice').selectOption('local-one');await saved();assert.equal(await page.locator('[data-action="refresh-reading-voices"]').isVisible(),true);await page.locator('[data-theme="amethyst"].theme-choice').click();await saved();await logout();await login('Reader Alpha');assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'forest');await settings();assert.equal(await page.locator('[data-action="refresh-reading-voices"]').isVisible(),false);
 });
 let lessonId;
 await check('Read lesson uses the saved voice and speed while leaving lesson text and highlights untouched',async()=>{
  await page.evaluate(()=>MaplewaveTest.navigate('chapters'));await page.locator('[data-action="chapter"][data-id="certificate"]').click();lessonId=await page.locator('.lesson').first().getAttribute('data-lesson-id');const before=await page.locator('.lesson').first().innerHTML();await page.locator(`[data-action="read-lesson"][data-lesson="${lessonId}"]`).click();const call=await page.evaluate(()=>window.__speechCalls.at(-1));assert.equal(call.voice,'local-two');assert.equal(call.rate,1.25);assert.equal(await page.locator('.lesson').first().innerHTML(),before);assert.ok((await page.locator(`[data-audio-lesson="${lessonId}"]`).innerText()).includes('Reading'));
 });
 await check('Pause, resume and stop ignore stale engine completions and never continue a cancelled passage',async()=>{
  const old=await page.evaluate(()=>window.__speechCalls.at(-1).id),before=await page.evaluate(()=>window.__speechCalls.length);const pause=page.locator(`[data-action="pause-reading"][data-lesson="${lessonId}"]`);await pause.click();assert.equal(await pause.innerText(),'Resume');await page.evaluate(id=>onLessonSpeechEvent(id,'done',''),old);assert.equal(await page.evaluate(()=>window.__speechCalls.length),before);await pause.click();assert.equal(await page.evaluate(()=>window.__speechCalls.length),before+1);const latest=await page.evaluate(()=>window.__speechCalls.at(-1).id);await page.locator(`[data-action="stop-reading"][data-lesson="${lessonId}"]`).click();await page.evaluate(id=>onLessonSpeechEvent(id,'done',''),latest);assert.equal(await page.evaluate(()=>window.__speechCalls.length),before+1);assert.equal(await pause.isDisabled(),true);
 });
 await check('Long lessons advance through bounded chunks and exclude unrelated hidden text, collapsed details and button labels',async()=>{
  const start=await page.evaluate(()=>window.__speechCalls.length);await page.locator('.lesson').first().evaluate(el=>{const p=document.createElement('p');p.textContent=('Visible narration marker. Voltage and current are related. ').repeat(60);el.append(p);const hidden=document.createElement('p');hidden.hidden=true;hidden.textContent='HIDDEN_SENTINEL';el.append(hidden);const details=document.createElement('details');details.innerHTML='<summary>Optional summary</summary><p>CLOSED_SENTINEL</p>';el.append(details);const button=document.createElement('button');button.textContent='BUTTON_SENTINEL';el.append(button);});
  await page.locator(`[data-action="read-lesson"][data-lesson="${lessonId}"]`).click();
  for(let i=0;i<100;i++){if(await page.locator(`[data-action="pause-reading"][data-lesson="${lessonId}"]`).isDisabled())break;await page.evaluate(()=>onLessonSpeechEvent(window.__speechCalls.at(-1).id,'done',''));}
  const calls=await page.evaluate(n=>window.__speechCalls.slice(n),start),text=calls.map(c=>c.text).join(' ');assert.ok(calls.length>2);assert.ok(calls.every(c=>c.text.length<=700));assert.ok(text.includes('Visible narration marker'));for(const marker of ['HIDDEN_SENTINEL','CLOSED_SENTINEL','BUTTON_SENTINEL'])assert.ok(!text.includes(marker));assert.equal(await page.locator(`[data-action="pause-reading"][data-lesson="${lessonId}"]`).isDisabled(),true);
 });
 await check('Navigation and signing out stop narration; another profile cannot inherit pending speech',async()=>{
  await page.locator(`[data-action="read-lesson"][data-lesson="${lessonId}"]`).click();const id=await page.evaluate(()=>window.__speechCalls.at(-1).id),count=await page.evaluate(()=>window.__speechCalls.length);await page.evaluate(()=>MaplewaveTest.navigate('reference'));await page.evaluate(id=>onLessonSpeechEvent(id,'done',''),id);assert.equal(await page.evaluate(()=>window.__speechCalls.length),count);await logout();await login('Reader Beta');assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'amethyst');await page.evaluate(id=>onLessonSpeechEvent(id,'done',''),id);assert.equal(await page.evaluate(()=>window.__speechCalls.length),count);
 });
 await check('Unavailable saved voices are explained and retained until another available voice is chosen',async()=>{
  await settings();await page.evaluate(()=>onLessonSpeechEvent('','error','Open phone voice settings to install English voices.'));assert.ok((await page.locator('.preferences-save-status').first().innerText()).includes('install English voices'));
  await settings();await page.evaluate(()=>{window.__catalog.voices=[];onLessonVoicesChanged();});await page.waitForFunction(()=>document.querySelector('#voice-availability').textContent.includes('No on-device'));await page.locator('[data-action="preview-reading-voice"]').click();assert.ok((await page.locator('.preferences-save-status').first().innerText()).includes('Choose an available voice'));assert.equal(await page.locator('#reading-voice option').count(),2);assert.equal(await page.evaluate(()=>MaplewaveTest.state.settings.readingVoice),'local-one');await page.evaluate(()=>{window.__catalog.voices=[{id:'local-one',name:'English voice 1',language:'en-CA',offline:true},{id:'local-two',name:'English voice 2',language:'en-CA',offline:true}];onLessonVoicesChanged();});
 });
 await check('Settings and reading controls fit small phones, landscape and tablets in light and dark themes',async()=>{
  for(const theme of ['daylight','midnight']){await settings();await page.locator(`[data-theme="${theme}"].theme-choice`).click();await saved();for(const size of [{width:320,height:740},{width:393,height:852},{width:852,height:393},{width:800,height:1280}]){await page.setViewportSize(size);for(const view of ['settings','reference','chapters','attribution']){await page.evaluate(v=>MaplewaveTest.navigate(v),view);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,theme+' '+view+' '+JSON.stringify(size));}await page.evaluate(()=>MaplewaveTest.navigate('chapters'));await page.locator('[data-action="chapter"][data-id="electricity"]').click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,theme+' lesson');}}
  await page.setViewportSize({width:393,height:852});await page.screenshot({path:path.join(screenshotDir,'lesson-reader-phone.png')});
 });
 assert.deepEqual(errors,[]);checks.push('No JavaScript errors.');
 fs.writeFileSync(path.join(project,'preferences-ui-test-report.json'),JSON.stringify({passed:checks.length,checks,errors,physical_audio_tested:false,time:new Date().toISOString()},null,2)+'\n');
 }finally{if(browser)await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
