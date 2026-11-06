const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const C=require('../app/src/main/assets/core.js');
test('Sound setting defaults on, preserves mute through serialization, rejects invalid imports',()=>{assert.equal(C.validatePreferences({}).soundEffects,true);assert.equal(C.validatePreferences(JSON.parse(JSON.stringify({...C.defaultPreferences(),soundEffects:false}))).soundEffects,false);assert.throws(()=>C.validatePreferences({soundEffects:'false'}));});
test('Effects respect mute and visibility and stop overlapping or background audio',()=>{let enabled=true;const events={},players=[];const document={hidden:false,addEventListener:(n,f)=>events[n]=f};class Audio{constructor(url){this.url=url;this.currentTime=0;players.push(this);}addEventListener(){}play(){this.played=true;return Promise.resolve();}pause(){this.paused=true;}}
const ctx={document,Audio,setTimeout,clearTimeout,addEventListener:(n,f)=>events[n]=f};ctx.window=ctx;vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../app/src/main/assets/sounds.js'),'utf8'),ctx);const effects=new ctx.RadioSoundEffects.Effects(()=>enabled);effects.play('welcome');assert.equal(players[0].url,'sounds/welcome.mp3');effects.play('correct');assert(players[0].paused);assert(players[1].played);enabled=false;effects.play('incorrect');assert(players[1].paused);assert.equal(players.length,2);enabled=true;effects.play('test-pass');document.hidden=true;events.visibilitychange();assert(players[2].paused);effects.play('correct');assert.equal(players.length,3);document.hidden=false;effects.play('unknown');assert.equal(players.length,3);});

test('Farewell waits for completion and releases on failure or interruption',async()=>{
 const players=[];class Audio{constructor(url){this.url=url;this.events={};players.push(this);}addEventListener(n,f){this.events[n]=f;}play(){return Promise.resolve();}pause(){this.paused=true;}}
 const ctx={document:{hidden:false,addEventListener(){}},Audio,setTimeout,clearTimeout,addEventListener(){}};ctx.window=ctx;vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../app/src/main/assets/sounds.js'),'utf8'),ctx);
 const effects=new ctx.RadioSoundEffects.Effects(()=>true);let done=false;let p=effects.play('farewell').then(()=>done=true);await Promise.resolve();assert.equal(done,false);assert.equal(players[0].url,'sounds/farewell.mp3');players[0].events.ended();await p;assert(done);
 p=effects.play('farewell');players[1].events.error();await p;assert.equal(effects.current,null);
 p=effects.play('farewell');effects.stop();await p;assert(players[2].paused);
 await effects.play('farewell',false);assert.equal(players.length,3);
});

test('first-login recording uses its own file and honours mute',async()=>{
 const players=[];class Audio{constructor(url){this.url=url;this.events={};players.push(this);}addEventListener(n,f){this.events[n]=f;}play(){return Promise.resolve();}pause(){}}
 const ctx={document:{hidden:false,addEventListener(){}},Audio,setTimeout,clearTimeout,addEventListener(){}};ctx.window=ctx;vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../app/src/main/assets/sounds.js'),'utf8'),ctx);
 const effects=new ctx.RadioSoundEffects.Effects(()=>true);const p=effects.play('first-welcome');assert.equal(players[0].url,'sounds/first-welcome.mp3');players[0].events.ended();await p;await effects.play('first-welcome',false);assert.equal(players.length,1);
 assert.ok(fs.readFileSync(require.resolve('../app/src/main/assets/app.js'),'utf8').includes("soundEffects.play(profiles.session.firstLogin?'first-welcome':'welcome')"));
});
