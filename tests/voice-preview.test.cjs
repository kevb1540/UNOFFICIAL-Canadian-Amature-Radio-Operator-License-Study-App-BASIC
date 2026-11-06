const test=require('node:test'),assert=require('node:assert/strict');
global.RadioCore=require('../app/src/main/assets/core.js');
global.RadioNarration=require('../app/src/main/assets/narration.js');
const {Controller}=require('../app/src/main/assets/preferences.js');
function fixture({browser=false}={}){
 const settings={...RadioCore.defaultPreferences(),readingVoice:'local-one',speechRate:1.1,soundEffects:false};
 const controls={'reading-voice':{value:'local-two'},'reading-speed':{value:'1.6'}},calls=[],notices=[];
 global.document={getElementById:id=>controls[id]||null,querySelectorAll:()=>[]};
 const voices=[{id:'local-one',name:'Voice one',language:'en-CA',offline:true},{id:'local-two',name:'Voice two',language:'en-US',offline:true}];
 global.AndroidApp=browser?null:{speakLessonChunk:(text,voice,rate,id)=>calls.push({text,voice,rate,id}),stopLessonSpeech(){}};
 const localVoices=voices.map(v=>({voiceURI:v.id,name:v.name,lang:v.language,localService:true}));
 global.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
 global.speechSynthesis={getVoices:()=>localVoices,speak:u=>calls.push(u),cancel(){}};
 let effectsStopped=0,phoneticsStopped=0;
 global.stopSoundEffects=()=>effectsStopped++;
 global.RadioPhonetics={stop:()=>phoneticsStopped++};
 const c=Object.create(Controller.prototype);
 Object.assign(c,{io:{identity:()=> 'reader',state:()=>({settings}),notice:m=>notices.push(m),navigate(){}},catalog:{ready:true,voices},session:null,request:'',sequence:0,pending:false,wordMarker:{clear(){}},updateReadingUI(){}});
 const click=()=>c.click({target:{closest:()=>({dataset:{action:'preview-reading-voice'}})}});
 return {c,settings,controls,calls,notices,click,effectsStopped:()=>effectsStopped,phoneticsStopped:()=>phoneticsStopped};
}
test('Preview plays a sample using the displayed voice and speed even before a slider change is saved',()=>{
 const f=fixture(),before=JSON.stringify(f.settings);f.click();
 assert.equal(f.calls.length,1);assert.equal(f.calls[0].voice,'local-two');assert.equal(f.calls[0].rate,1.6);
 assert.ok(f.calls[0].text.includes('reading voice'));assert.ok(f.calls[0].text.length>50);
 assert.equal(JSON.stringify(f.settings),before);assert.equal(f.effectsStopped(),1);assert.equal(f.phoneticsStopped(),1);
});
test('each preview takes a fresh selection and ignores callbacks from a previous sample',()=>{
 const f=fixture();f.click();const old=f.calls[0].id;
 f.controls['reading-voice'].value='local-one';f.controls['reading-speed'].value='0.5';f.c.stop();f.click();
 assert.equal(f.calls[1].voice,'local-one');assert.equal(f.calls[1].rate,0.5);
 f.c.event(old,'done','');assert.equal(f.c.session.voiceId,'local-one');
 f.c.event(f.calls[1].id,'done','');assert.equal(f.c.session,null);
});
test('Default previews the first available voice rather than a previously saved explicit choice',()=>{
 const f=fixture();f.settings.readingVoice='local-two';f.controls['reading-voice'].value='';f.click();
 assert.equal(f.calls[0].voice,'local-one');assert.equal(f.settings.readingVoice,'local-two');
});
test('an unavailable selected voice is explained without substituting a different voice',()=>{
 const f=fixture();f.controls['reading-voice'].value='removed-voice';f.click();
 assert.equal(f.calls.length,0);assert.match(f.c.message,/Choose an available voice/);
});
test('browser preview uses the selected local synthesis voice and current rate with sound effects disabled',()=>{
 const f=fixture({browser:true});f.click();
 assert.equal(f.calls.length,1);assert.equal(f.calls[0].voice.voiceURI,'local-two');assert.equal(f.calls[0].lang,'en-US');assert.equal(f.calls[0].rate,1.6);
 f.calls[0].onend();assert.equal(f.c.session,null);
});
test('preview falls back to saved preferences when the Settings controls are absent',()=>{
 const f=fixture();delete f.controls['reading-voice'];delete f.controls['reading-speed'];f.click();
 assert.equal(f.calls[0].voice,'local-one');assert.equal(f.calls[0].rate,1.1);
});
test('preview waits while profile settings are being saved and does not play after sign-out',()=>{
 const f=fixture();f.c.pending=true;f.click();assert.equal(f.calls.length,0);
 f.c.pending=false;f.c.io.identity=()=>null;f.click();assert.equal(f.calls.length,0);
});
