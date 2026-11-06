// Actual lesson DOM and selection menus; controlled native and browser timing events.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const project=path.resolve(__dirname,'..'),root=path.join(project,'app/src/main/assets'),checks=[],errors=[];
const screens=path.resolve(__dirname,'../../research/narration');fs.mkdirSync(screens,{recursive:true});
const server=http.createServer((req,res)=>{const name=new URL(req.url,'http://localhost').pathname,file=path.resolve(root,'.'+(name==='/'?'/index.html':name));if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}try{res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.json')?'application/json':file.endsWith('.png')?'image/png':'text/html');res.end(fs.readFileSync(file));}catch(e){res.writeHead(404);res.end();}});
async function check(name,run){await run();checks.push(name);console.log('PASS',name);}
(async()=>{let browser;try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:393,height:852}});page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  window.__voice='local-voice';window.__autoBoundary=true;window.__calls=[];window.__stops=0;
  window.AndroidApp={version:()=>JSON.stringify({name:'2.3.15',code:245}),lessonVoices:()=>JSON.stringify({ready:true,voices:[{id:window.__voice,name:'Installed English voice',language:'en-CA',offline:true}]}),stopLessonSpeech:()=>window.__stops++,speakLessonChunk:(text,voice,rate,id)=>{
   window.__calls.push({text,voice,rate,id});queueMicrotask(()=>{onLessonSpeechEvent(id,'start','');if(window.__autoBoundary){const word=[...new Intl.Segmenter('en',{granularity:'word'}).segment(text)].find(w=>w.isWordLike);if(word)onLessonSpeechBoundary(id,word.index,word.index+word.segment.length);}});
  }};
 });
 await page.goto(url);await page.waitForFunction(()=>window.MaplewaveTest);
 async function create(name){const pass='Narration test passphrase';await page.locator('[data-action="profile-new"]').click();await page.locator('#new-name').fill(name);await page.locator('#new-password').fill(pass);await page.locator('#new-confirm').fill(pass);await page.locator('#new-email').fill(name.toLowerCase().replace(/ /g,'-')+'@example.org');await page.locator('[data-profile-form="create"] button[type="submit"]').click();await page.locator('#login-password').fill(pass);await page.locator('[data-profile-form="login"] button[type="submit"]').click();await page.waitForFunction(()=>MaplewaveTest.signedIn);}
 await create('Narration user');await page.evaluate(()=>MaplewaveTest.navigate('chapters'));await page.locator('[data-action="chapter"][data-id="certificate"]').click();
 await page.evaluate(()=>{
  const controls=document.createElement('div');controls.className='lesson-audio-tools';controls.dataset.audioLesson='reading-fixture';controls.innerHTML='<div class="actions"><button class="btn" data-action="read-lesson" data-lesson="reading-fixture">Read fixture</button><button class="btn" data-action="pause-reading" data-lesson="reading-fixture" disabled>Pause</button><button class="btn" data-action="stop-reading" data-lesson="reading-fixture" disabled>Stop</button></div><p class="lesson-audio-status"></p>';
  const lesson=document.createElement('section');lesson.id='lesson-reading-fixture';lesson.className='card lesson';lesson.dataset.chapterId='certificate';lesson.dataset.lessonId='reading-fixture';lesson.innerHTML='<h2>Reading example.</h2><p id="speech-p1">Voltage <strong>and</strong> <span>current repeat current.</span> <span>Con</span><em>tact</em> Ω at 14.2 MHz.</p><p id="speech-p2">Another paragraph follows here.</p><p hidden id="speech-hidden">HIDDEN ANSWER</p><details><summary>Optional details</summary><p>CLOSED CONTENT</p><details><summary>NESTED HIDDEN SUMMARY</summary><p>Nested body</p></details></details><button>BUTTON LABEL</button>';
  const main=document.querySelector('main');main.prepend(lesson);main.prepend(controls);
 });
 const fixture=page.locator('#lesson-reading-fixture');
 async function select(selector,text,occurrence=0){return page.evaluate(({selector,text,occurrence})=>{
  const element=document.querySelector(selector),walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  const full=nodes.map(n=>n.data).join('');let start=-1;for(let n=0;n<=occurrence;n++)start=full.indexOf(text,start+1);if(start<0)throw Error('Selection text not found');
  let offset=0,a,b;for(const node of nodes){const end=offset+node.length;if(!a&&start<end)a={node,at:start-offset};if(a&&start+text.length<=end){b={node,at:start+text.length-offset};break;}offset=end;}
  const range=document.createRange();range.setStart(a.node,a.at);range.setEnd(b.node,b.at);const selection=getSelection();selection.removeAllRanges();selection.addRange(range);document.dispatchEvent(new Event('selectionchange'));return range.toString();
 },{selector,text,occurrence});}
 async function current(){return page.evaluate(()=>{const ranges=CSS.highlights?.get('spoken-word');return ranges?[...ranges][0].toString():document.querySelector('#speech-word-overlay').dataset.word||'';});}
 async function advance(){await page.evaluate(()=>onLessonSpeechEvent(window.__calls.at(-1).id,'done',''));}
 async function nativeWord(text,occurrence=0){await page.evaluate(({text,occurrence})=>{const call=window.__calls.at(-1);let start=-1;for(let i=0;i<=occurrence;i++)start=call.text.indexOf(text,start+1);if(start<0)throw Error('Spoken word not found: '+text);onLessonSpeechBoundary(call.id,start,start+text.length);},{text,occurrence});}
 let oldId;
 await check('The spoken-word highlight follows real native timing callbacks and leaves lesson HTML unchanged',async()=>{
  const before=await fixture.innerHTML();await page.locator('[data-action="read-lesson"][data-lesson="reading-fixture"]').click();assert.equal(await current(),'Reading');await nativeWord('Voltage');assert.equal(await current(),'Voltage');assert.equal(await fixture.innerHTML(),before);oldId=await page.evaluate(()=>window.__calls.at(-1).id);
 });
 await check('Speech offsets map across inline markup, whitespace, symbols and decimal values',async()=>{
  const spoken=await page.evaluate(()=>window.__calls.at(-1).text);assert.ok(spoken.includes('and current'));assert.ok(spoken.includes('Contact'));for(const hidden of ['HIDDEN ANSWER','CLOSED CONTENT','NESTED HIDDEN SUMMARY','BUTTON LABEL'])assert.ok(!spoken.includes(hidden));
  await nativeWord('Contact');assert.equal(await current(),'Contact');await nativeWord('ohms');assert.equal(await current(),'Ω');await nativeWord('14.2');assert.equal(await current(),'14.2');
 });
 await check('Repeated words are highlighted at their own DOM positions rather than the first text match',async()=>{
  await nativeWord('current',1);assert.equal(await current(),'current');const prefix=await page.evaluate(()=>{const range=[...CSS.highlights.get('spoken-word')][0].cloneRange();range.setStart(document.querySelector('#speech-p1'),0);return range.toString();});assert.ok(prefix.endsWith('current repeat current'));
 });
 let savedMarks;
 await check('Saved highlights coexist with the temporary cursor, retain their anchors and are the only marks stored in backups',async()=>{
  await select('#speech-p1','current',1);assert.equal(await page.evaluate(()=>window.highlightLessonSelection()),true);await page.waitForFunction(()=>MaplewaveTest.state.highlights.length===1&&document.querySelector('#lesson-reading-fixture .lesson-highlight'));await page.evaluate(()=>MaplewaveTest.flush());
  assert.equal(await current(),'current');savedMarks=await page.evaluate(()=>JSON.stringify(MaplewaveTest.state.highlights));await nativeWord('Voltage');assert.equal(await current(),'Voltage');assert.equal(await page.evaluate(()=>JSON.stringify(MaplewaveTest.state.highlights)),savedMarks);assert.equal(await fixture.locator('.lesson-highlight').innerText(),'current');
 });
 await check('the spoken word is red with a transparent background and saved-highlight edits keep narration anchored',async()=>{
  const colours=await page.evaluate(()=>{const style=getComputedStyle(document.querySelector('#speech-p1'),'::highlight(spoken-word)');return {background:style.backgroundColor,text:style.color};});assert.deepEqual(colours,{background:'rgba(0, 0, 0, 0)',text:'rgb(255, 0, 0)'});
  await nativeWord('current',1);await select('#speech-p1','current',1);await page.locator('#choose-highlighter-colour').click();await page.locator('#highlighter-colour-dialog [data-colour="blue"]').click();await page.waitForFunction(()=>!!document.querySelector('#speech-p1 mark[data-colour="blue"]'));assert.equal(await current(),'current');assert.equal(await fixture.locator('mark').innerText(),'current');
  await select('#speech-p1','current',1);await page.locator('#remove-selected-highlight').click();await page.waitForFunction(()=>!document.querySelector('#speech-p1 mark'));assert.equal(await current(),'current');assert.equal(await page.evaluate(()=>MaplewaveTest.state.highlights.length),0);
  await select('#speech-p1','current',1);await page.locator('#highlight-selected-lesson').click();await page.waitForFunction(()=>!!document.querySelector('#speech-p1 mark'));savedMarks=await page.evaluate(()=>JSON.stringify(MaplewaveTest.state.highlights));
 });
 await check('Long-press selection offers Read from here and jumps ongoing narration to the selected occurrence',async()=>{
  await select('#speech-p1','current',1);const menu=page.locator('#lesson-highlight-menu');assert.equal(await menu.isVisible(),true);const stops=await page.evaluate(()=>window.__stops);await menu.getByRole('button',{name:'Read from here',exact:true}).click();
  const call=await page.evaluate(()=>window.__calls.at(-1));assert.ok(call.text.startsWith('current. Contact'),call.text);assert.ok(await page.evaluate(()=>window.__stops)>stops);assert.equal(await current(),'current');
  const count=await page.evaluate(()=>window.__calls.length);await page.evaluate(id=>{onLessonSpeechBoundary(id,0,1);onLessonSpeechEvent(id,'done','');},oldId);assert.equal(await page.evaluate(()=>window.__calls.length),count);assert.equal(await current(),'current');
 });
 await check('The native selection-menu bridge can start from an inline word while preserving normal saved highlights',async()=>{
  await page.locator('[data-action="stop-reading"][data-lesson="reading-fixture"]').click();await select('#speech-p1','Contact');const accepted=await page.evaluate(()=>{AndroidApp.lessonHighlightMenu=()=>true;const captured=window.lessonHighlightSelection();getSelection().removeAllRanges();const read=window.readLessonFromSelection();window.clearLessonHighlightSelection();return {captured,read};});assert.deepEqual(accepted,{captured:true,read:true});assert.ok((await page.evaluate(()=>window.__calls.at(-1).text)).startsWith('Contact'));assert.equal(await current(),'Contact');assert.equal(await page.evaluate(()=>JSON.stringify(MaplewaveTest.state.highlights)),savedMarks);await page.evaluate(()=>delete AndroidApp.lessonHighlightMenu);
 });
 await check('Pause clears the transient mark, resume starts at the current word, and stop removes all speech cursor state',async()=>{
  const pause=page.locator('[data-action="pause-reading"][data-lesson="reading-fixture"]');await pause.click();assert.equal(await current(),'');await pause.click();assert.equal(await current(),'Contact');await page.locator('[data-action="stop-reading"][data-lesson="reading-fixture"]').click();assert.equal(await current(),'');assert.equal(await fixture.locator('.lesson-highlight').innerText(),'current');
 });
 await check('Paused selection resumes from the exact repeated word through floating Play after selection dismissal',async()=>{
  await page.locator('[data-action="read-lesson"][data-lesson="reading-fixture"]').click();
  await page.locator('#floating-reading-toggle').click();
  const count=await page.evaluate(()=>window.__calls.length);
  await select('#speech-p1','current',1);
  assert.equal(await page.evaluate(()=>window.__calls.length),count);
  await page.evaluate(()=>{getSelection().removeAllRanges();document.dispatchEvent(new Event('selectionchange'));});
  await page.locator('#floating-reading-toggle').click();
  assert.ok((await page.evaluate(()=>window.__calls.at(-1).text)).startsWith('current. Contact'));
  assert.equal(await current(),'current');
 });
 await check('Saving a new highlight while paused keeps the latest selected word for inline Resume',async()=>{
  const pause=page.locator('[data-action="pause-reading"][data-lesson="reading-fixture"]');await pause.click();
  await select('#speech-p1','Voltage');await select('#speech-p1','Contact');
  const count=await page.evaluate(()=>window.__calls.length);
  await page.locator('#highlight-selected-lesson').click();
  await page.waitForFunction(()=>[...document.querySelectorAll('#speech-p1 mark')].map(m=>m.textContent).join('').includes('Contact'));
  assert.equal(await page.evaluate(()=>window.__calls.length),count);
  await pause.click();assert.ok((await page.evaluate(()=>window.__calls.at(-1).text)).startsWith('Contact'));assert.equal(await current(),'Contact');
  await pause.click();await pause.click();assert.equal(await current(),'Contact');
  // Restore the existing fixture mark used by the remaining checks.
  await select('#speech-p1','Contact');await page.locator('#remove-selected-highlight').click();
  await page.waitForFunction(()=>![...document.querySelectorAll('#speech-p1 mark')].map(m=>m.textContent).join('').includes('Contact'));
  await page.locator('[data-action="stop-reading"][data-lesson="reading-fixture"]').click();
 });
 await check('Voices without word timing read full passages continuously without a misleading word cursor',async()=>{
  await page.evaluate(()=>{window.__voice='no-timing';window.__autoBoundary=false;onLessonVoicesChanged();});await page.evaluate(()=>MaplewaveTest.navigate('settings'));await page.locator('#reading-voice').selectOption('no-timing');await page.waitForFunction(()=>document.querySelector('.preferences-save-status').textContent==='Settings saved for this profile.');
  await page.evaluate(()=>MaplewaveTest.navigate('chapters'));await page.locator('[data-action="chapter"][data-id="certificate"]').click();
  await page.locator('.lesson').first().evaluate(lesson=>lesson.innerHTML='<h2>Read these words in one continuous passage.</h2>');const id=await page.locator('.lesson').first().getAttribute('data-lesson-id');
  const begin=await page.evaluate(()=>window.__calls.length);await page.locator(`[data-action="read-lesson"][data-lesson="${id}"]`).click();
  assert.equal(await page.evaluate(()=>window.__calls.at(-1).text),'Read these words in one continuous passage.');assert.equal(await current(),'');
  assert.equal(await page.evaluate(n=>window.__calls.length-n,begin),1);await advance();
  assert.equal(await page.locator(`[data-action="pause-reading"][data-lesson="${id}"]`).isDisabled(),true);assert.equal(await current(),'');
 });
 await check('Phrase-only timing keeps the original utterance playing and precise later timing still highlights words',async()=>{
  await page.evaluate(()=>{window.__voice='phrase-timing';window.__autoBoundary=true;onLessonVoicesChanged();});await page.evaluate(()=>MaplewaveTest.navigate('settings'));await page.locator('#reading-voice').selectOption('phrase-timing');await page.waitForFunction(()=>document.querySelector('.preferences-save-status').textContent==='Settings saved for this profile.');await page.evaluate(()=>MaplewaveTest.navigate('chapters'));await page.locator('[data-action="chapter"][data-id="certificate"]').click();await page.locator('.lesson').first().evaluate(el=>el.innerHTML='<h2>Phrases need exact words.</h2>');const id=await page.locator('.lesson').first().getAttribute('data-lesson-id');await page.locator(`[data-action="read-lesson"][data-lesson="${id}"]`).click();
  const before=await page.evaluate(()=>({calls:window.__calls.length,stops:window.__stops}));
  await page.evaluate(()=>{const call=window.__calls.at(-1);onLessonSpeechBoundary(call.id,0,call.text.length);});
  assert.deepEqual(await page.evaluate(()=>({calls:window.__calls.length,stops:window.__stops})),before);
  assert.equal(await page.evaluate(()=>window.__calls.at(-1).text),'Phrases need exact words.');assert.equal(await current(),'');
  await nativeWord('need');assert.equal(await current(),'need');await page.locator(`[data-action="stop-reading"][data-lesson="${id}"]`).click();
 });
 await check('Browser speech boundary events also highlight the exact word and stale callbacks are harmless after cancellation',async()=>{
  await page.evaluate(()=>{window.__native={...AndroidApp};delete AndroidApp.lessonVoices;delete AndroidApp.speakLessonChunk;delete AndroidApp.stopLessonSpeech;window.__web=[];Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{getVoices:()=>[{voiceURI:'web-local',name:'Browser English',lang:'en-CA',localService:true}],speak:u=>{window.__web.push(u);queueMicrotask(()=>u.onstart?.());},cancel:()=>{},addEventListener:()=>{}}});window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};onLessonVoicesChanged();});
  await page.evaluate(()=>MaplewaveTest.navigate('settings'));await page.locator('#reading-voice').selectOption('web-local');await page.waitForFunction(()=>document.querySelector('.preferences-save-status').textContent==='Settings saved for this profile.');await page.evaluate(()=>MaplewaveTest.navigate('chapters'));await page.locator('[data-action="chapter"][data-id="certificate"]').click();await page.locator('.lesson').first().evaluate(el=>el.innerHTML='<h2>Browser reading works.</h2>');const id=await page.locator('.lesson').first().getAttribute('data-lesson-id');await page.locator(`[data-action="read-lesson"][data-lesson="${id}"]`).click();
  await page.evaluate(()=>{const first=window.__web.at(-1);first.onboundary({name:'word',charIndex:0,charLength:7});});await page.evaluate(()=>{const call=window.__web.at(-1),start=call.text.indexOf('works');call.onboundary({name:'word',charIndex:start,charLength:5});});assert.equal(await current(),'works');await page.locator(`[data-action="stop-reading"][data-lesson="${id}"]`).click();await page.evaluate(()=>window.__web.at(-1).onboundary({name:'word',charIndex:0,charLength:1}));assert.equal(await current(),'');
  await page.evaluate(()=>{window.AndroidApp=window.__native;window.__voice='local-voice';window.__autoBoundary=true;onLessonVoicesChanged();});
 });
 await check('Read from here is unavailable outside readable lessons and while a glossary dialog is open',async()=>{
  await select('.profile-banner strong','Narration');assert.equal(await page.evaluate(()=>window.lessonHighlightSelection()),false);assert.equal(await page.evaluate(()=>window.readLessonFromSelection()),false);await page.evaluate(()=>getSelection().removeAllRanges());await select('.lesson h2','Browser');await page.locator('.glossary-shortcut').click();assert.equal(await page.evaluate(()=>window.readLessonFromSelection()),false);await page.locator('[data-action="close-glossary"]').click();await page.evaluate(()=>getSelection().removeAllRanges());
 });
 await check('Speech highlighting and the selection menu fit phones and use red text without a background in light/dark themes',async()=>{
  await page.evaluate(()=>MaplewaveTest.navigate('settings'));await page.locator('#reading-voice').selectOption('local-voice');await page.waitForFunction(()=>document.querySelector('.preferences-save-status').textContent==='Settings saved for this profile.');
  for(const theme of ['midnight','daylight']){await page.locator(`[data-theme="${theme}"].theme-choice`).click();await page.waitForFunction(()=>document.querySelector('.preferences-save-status').textContent==='Settings saved for this profile.');await page.evaluate(()=>MaplewaveTest.navigate('chapters'));await page.locator('[data-action="chapter"][data-id="certificate"]').click();const id=await page.locator('.lesson').first().getAttribute('data-lesson-id');await page.locator(`[data-action="read-lesson"][data-lesson="${id}"]`).click();
   for(const size of [{width:320,height:740},{width:393,height:852},{width:852,height:393},{width:800,height:1280}]){await page.setViewportSize(size);await page.evaluate(()=>getSelection().removeAllRanges());await page.locator('.lesson h2').first().evaluate(el=>el.scrollIntoView({block:'center'}));await select('.lesson h2',(await page.locator('.lesson h2').first().innerText()).split(' ')[0]);await page.locator('#lesson-highlight-menu').waitFor({state:'visible'});const box=await page.locator('#lesson-highlight-menu').boundingBox();assert.ok(box&&box.x>=0&&box.x+box.width<=size.width+1);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);}
   const colours=await page.evaluate(()=>{const s=getComputedStyle(document.querySelector('.lesson h2'),'::highlight(spoken-word)');return [s.backgroundColor,s.color];});assert.deepEqual(colours,['rgba(0, 0, 0, 0)','rgb(255, 0, 0)']);await page.setViewportSize({width:393,height:852});await page.evaluate(()=>getSelection().removeAllRanges());await page.screenshot({path:path.join(screens,'spoken-word-'+theme+'.png')});await page.evaluate(()=>MaplewaveTest.navigate('settings'));
  }
 });
 await check('the older-WebView overlay draws only red glyphs with no background boxes while preserving inline fonts and source text',async()=>{
  await page.evaluate(()=>MaplewaveTest.navigate('chapters'));await page.locator('[data-action="chapter"][data-id="certificate"]').click();const lesson=page.locator('.lesson').first(),id=await lesson.getAttribute('data-lesson-id');await lesson.evaluate(el=>el.innerHTML='<h2>Read.</h2><p><span>Con</span><strong>tact</strong> now.</p>');const before=await lesson.innerHTML();await page.evaluate(()=>{window.__Highlight=window.Highlight;window.Highlight=undefined;});await page.locator(`[data-action="read-lesson"][data-lesson="${id}"]`).click();if(!await page.evaluate(()=>window.__calls.at(-1).text.includes('Contact')))await advance();await nativeWord('Contact');assert.equal(await current(),'Contact');assert.equal(await page.locator('.speech-word-box').count(),0);assert.equal((await page.locator('.speech-word-text').allTextContents()).join(''),'Contact');const overlay=await page.evaluate(()=>({backgrounds:[...document.querySelectorAll('.speech-word-text')].map(e=>getComputedStyle(e).backgroundColor),colours:[...document.querySelectorAll('.speech-word-text')].map(e=>getComputedStyle(e).color),weights:[...document.querySelectorAll('.speech-word-text')].map(e=>getComputedStyle(e).fontWeight)}));assert.ok(overlay.backgrounds.length>0&&overlay.backgrounds.every(c=>c==='rgba(0, 0, 0, 0)'));assert.ok(overlay.colours.length>0&&overlay.colours.every(c=>c==='rgb(255, 0, 0)'));assert.equal(await lesson.innerHTML(),before);assert.notEqual(overlay.weights[0],overlay.weights[1]);await page.screenshot({path:path.join(screens,'spoken-word-fallback.png')});await page.evaluate(()=>window.Highlight=window.__Highlight);
 });
 await check('Signing out clears the spoken word and pending selection; callbacks cannot affect another profile',async()=>{
  const id=await page.evaluate(()=>window.__calls.at(-1).id);await page.locator('.footer-signout [data-action="profile-logout"]').click();await page.waitForFunction(()=>!MaplewaveTest.signedIn);assert.equal(await current(),'');assert.equal(await page.evaluate(()=>window.readLessonFromSelection()),false);await create('Other narration user');const count=await page.evaluate(()=>window.__calls.length);await page.evaluate(id=>{onLessonSpeechEvent(id,'start','');onLessonSpeechBoundary(id,0,2);onLessonSpeechEvent(id,'done','');},id);assert.equal(await current(),'');assert.equal(await page.evaluate(()=>window.__calls.length),count);
 });
 assert.deepEqual(errors,[]);checks.push('No JavaScript errors.');
 fs.writeFileSync(path.join(project,'narration-ui-test-report.json'),JSON.stringify({passed:checks.length,checks,errors,physical_audio_tested:false,native_selection_menu:'Callback compiled and bridge exercised; physical long press needs a device check',time:new Date().toISOString()},null,2)+'\n');
 }finally{if(browser)await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
