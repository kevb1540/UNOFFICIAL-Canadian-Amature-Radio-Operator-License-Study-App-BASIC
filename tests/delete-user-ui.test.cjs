// ©️ Kevin W. Brown 2026
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const root=path.resolve(__dirname,'../app/src/main/assets'),errors=[];let checks=0;
const screenshotDir=process.env.DELETE_USER_SCREENSHOTS||path.resolve(__dirname,'../../research/delete-user');
fs.mkdirSync(screenshotDir,{recursive:true});
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}try{res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.json')?'application/json':file.endsWith('.png')?'image/png':'text/html');res.end(fs.readFileSync(file));}catch(e){res.writeHead(404);res.end();}});
const pass='Canadian radio test password';
async function check(name,fn){await fn();checks++;console.log('PASS',name);}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||path.resolve(__dirname,'../../toolchain/chromium/chrome-headless-shell-linux64/chrome-headless-shell'),args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:393,height:852}}),p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
 const ready=()=>p.waitForFunction(()=>window.MaplewaveTest);
 const row=name=>p.locator('.profile-row').filter({hasText:name});
 async function create(name){await p.locator('[data-action="profile-new"]').click();await p.locator('#new-name').fill(name);await p.locator('#new-password').fill(pass);await p.locator('#new-confirm').fill(pass);await p.locator('#new-email').fill(name.toLowerCase()+'@example.org');await p.locator('[data-profile-form="create"] button[type="submit"]').click();await p.locator('#login-password').waitFor();await p.locator('[data-action="profile-login"]').click();}
 async function login(name){await row(name).click();await p.locator('#login-password').fill(pass);await p.locator('[data-profile-form="login"] button[type="submit"]').click();await p.waitForFunction(()=>MaplewaveTest.signedIn);}
 async function logout(){await p.locator('[data-action="profile-logout"]').click();await p.locator('h1').filter({hasText:'Choose your user profile'}).waitFor();}
 const vault=()=>p.evaluate(()=>localStorage.getItem('maplewave-profiles-v1'));
 try{
  await p.goto(url);await ready();await create('Kevin');await create('Casey');
  await login('Kevin');await p.evaluate(async()=>{MaplewaveTest.state.notes.safety='Kevin private work';await MaplewaveTest.save();});await logout();
  await login('Casey');await p.evaluate(async()=>{MaplewaveTest.state.notes.safety='Casey work stays';await MaplewaveTest.save();});await logout();
  let before,kevinId,caseyRecord;
  await check('deletion before login names the selected user, needs no password, and Cancel and Android Back keep the vault',async()=>{
   before=await vault();const saved=JSON.parse(before);kevinId=saved.profiles.find(x=>x.name==='Kevin').id;caseyRecord=saved.profiles.find(x=>x.name==='Casey');
   await row('Kevin').click();await p.locator('[data-action="profile-delete"]').click();assert.ok((await p.locator('.profile-identity').innerText()).includes('Kevin'));assert.ok((await p.locator('#profile-delete-warning').innerText()).includes('Kevin'));assert.equal(await p.locator('input[type="password"]').count(),0);assert.equal(await p.evaluate(()=>MaplewaveTest.signedIn),false);
   await p.locator('[data-action="profile-delete-cancel"]').click();await p.locator('#login-password').waitFor();assert.equal(await vault(),before);
   await p.locator('[data-action="profile-delete"]').click();await p.evaluate(()=>window.appBack());await p.locator('#login-password').waitFor();assert.equal(await vault(),before);
  });
  await check('the delete confirmation fits small phones, landscape and tablets and keeps glossary lookup in place',async()=>{
   await p.locator('[data-action="profile-delete"]').click();for(const size of [{width:320,height:740},{width:393,height:852},{width:852,height:393},{width:800,height:1280}]){await p.setViewportSize(size);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.ok(await p.locator('[data-action="profile-confirm-delete"]').isVisible());}
   await p.setViewportSize({width:393,height:852});await p.locator('.glossary-shortcut').click();await p.locator('#quick-glossary-search').fill('Ohm');await p.locator('[data-action="close-glossary"]').click();assert.equal(await p.locator('h1').innerText(),'Delete this user?');assert.equal(await vault(),before);await p.screenshot({path:path.join(screenshotDir,'delete-confirmation-phone.png'),fullPage:true});
  });
  await check('confirming deletion removes only the selected locked user and stays deleted after reload',async()=>{
   await p.locator('[data-action="profile-confirm-delete"]').click();await p.locator('h1').filter({hasText:'Choose your user profile'}).waitFor();assert.equal(await row('Kevin').count(),0);assert.equal(await row('Casey').count(),1);assert.equal(await p.locator('.tabs').isVisible(),false);assert.equal(await p.evaluate(()=>MaplewaveTest.signedIn),false);
   const saved=JSON.parse(await vault());assert.ok(!saved.profiles.some(x=>x.id===kevinId));assert.deepEqual(saved.profiles,[caseyRecord]);await p.reload();await ready();assert.equal(await row('Kevin').count(),0);await login('Casey');assert.equal(await p.evaluate(()=>MaplewaveTest.state.notes.safety),'Casey work stays');
  });
  await check('failed signed-in deletion keeps the user, current progress and session and allows cancellation',async()=>{
   await p.locator('[data-action="profile-account"]').click();await p.locator('[data-action="profile-delete"]').click();assert.equal(await p.locator('input[type="password"]').count(),0);before=await vault();
   await p.evaluate(()=>{window.originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='maplewave-profiles-v1')throw Error('Test: storage unavailable');return window.originalSetItem.call(this,key,value);};});
   await p.locator('[data-action="profile-confirm-delete"]').click();await p.locator('#profile-error').filter({hasText:'storage unavailable'}).waitFor();assert.equal(await vault(),before);assert.equal(await p.evaluate(()=>MaplewaveTest.signedIn),true);assert.equal(await p.evaluate(()=>MaplewaveTest.state.notes.safety),'Casey work stays');
   await p.evaluate(()=>{Storage.prototype.setItem=window.originalSetItem;delete window.originalSetItem;});await p.locator('[data-action="profile-delete-cancel"]').click();assert.equal(await p.locator('h1').innerText(),'Profile settings');
   await p.locator('[data-action="profile-delete"]').click();await p.evaluate(()=>window.appBack());assert.equal(await p.locator('h1').innerText(),'Profile settings');assert.equal(await vault(),before);
  });
  await check('deleting the signed-in last user clears private state and returns to an empty login screen',async()=>{
   await p.locator('[data-action="profile-delete"]').click();await p.locator('[data-action="profile-confirm-delete"]').click();await p.locator('h1').filter({hasText:'Choose your user profile'}).waitFor();assert.equal(await p.evaluate(()=>MaplewaveTest.signedIn),false);assert.equal(await p.evaluate(()=>MaplewaveTest.state.notes.safety),undefined);assert.equal(await p.locator('.profile-row').count(),0);assert.equal(await p.locator('.tabs').isVisible(),false);assert.ok((await p.locator('main').innerText()).includes('Create the first user'));
   await p.evaluate(()=>{window.flushProgress();window.dispatchEvent(new Event('pagehide'));});await p.reload();await ready();assert.deepEqual(JSON.parse(await vault()).profiles,[]);await create('NewUser');await login('NewUser');assert.equal(await p.evaluate(()=>MaplewaveTest.state.notes.safety),undefined);
  });
  assert.deepEqual(errors,[]);checks++;console.log('PASS no deletion UI JavaScript errors');
  const report={passed:checks,errors,physical_device_tested:false,time:new Date().toISOString()};fs.writeFileSync(path.resolve(__dirname,'../delete-user-ui-test-report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
