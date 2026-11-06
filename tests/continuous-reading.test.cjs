const test=require('node:test'),assert=require('node:assert/strict');
global.RadioCore=require('../app/src/main/assets/core.js');
global.RadioNarration=require('../app/src/main/assets/narration.js');
const {Controller}=require('../app/src/main/assets/preferences.js');
function fixture({browser=false}={}){
 const calls=[],marks=[],settings={...RadioCore.defaultPreferences(),readingVoice:'local',speechRate:1.25};let stops=0;
 global.document={querySelectorAll:()=>[]};
 global.AndroidApp=browser?null:{speakLessonChunk:(text,voice,rate,id)=>calls.push({text,voice,rate,id}),stopLessonSpeech:()=>stops++};
 global.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
 global.speechSynthesis={getVoices:()=>[{voiceURI:'local',lang:'en-CA',localService:true}],speak:u=>calls.push(u),cancel:()=>stops++};
 const c=Object.create(Controller.prototype);
 Object.assign(c,{io:{identity:()=> 'reader',state:()=>({settings}),notice(){},navigate(){}},catalog:{ready:true,voices:[{id:'local'}]},session:null,request:'',sequence:0,wordMarker:{clear:()=>marks.push(null),show:(model,word)=>marks.push(word.text)},updateReadingUI(){}});
 const model=text=>({text,words:RadioNarration.words(text),wordAt(start,end=Infinity){return RadioNarration.wordAt(this.words,start,end);}});
 return {c,calls,marks,settings,model,stops:()=>stops};
}
test('a voice with no word timing reads bounded multiword passages without a one-word probe or per-word restarts',()=>{
 const f=fixture(),text=('Voltage and current are related by resistance. Read this sentence smoothly.\n').repeat(65);
 f.c.start(text,'lesson',f.model(text));
 assert.ok(RadioNarration.words(f.calls[0].text).length>1);
 for(let n=0;f.c.session&&n<30;n++){
  const call=f.calls.at(-1);f.c.event(call.id,'start','');f.c.event(call.id,'done','');
 }
 assert.equal(f.c.session,null);assert.ok(f.calls.length>1&&f.calls.length<15);
 assert.ok(f.calls.every(call=>call.text.length<=700&&RadioNarration.words(call.text).length>1));
 assert.equal(f.calls.map(call=>call.text).join(' ').replace(/\s+/g,' ').trim(),text.replace(/\s+/g,' ').trim());
 assert.ok(f.calls.every(call=>call.voice==='local'&&call.rate===1.25));
});
test('a later lesson using the same no-timing voice still starts with a full passage',()=>{
 const f=fixture(),text='Read these words together in one continuous sentence.';
 for(let n=0;n<2;n++){f.c.start(text,'lesson',f.model(text));const id=f.calls.at(-1).id;assert.equal(f.calls.at(-1).text,text);f.c.event(id,'start','');f.c.event(id,'done','');assert.equal(f.c.session,null);}
 assert.equal(f.calls.length,2);
});
test('phrase-wide timing never interrupts speech or replaces it with separate words',()=>{
 const f=fixture(),text='Read this complete sentence without breaking it apart.';f.c.start(text,'lesson',f.model(text));
 const call=f.calls[0],stops=f.stops();f.c.event(call.id,'start','');f.c.boundary(call.id,0,text.length);
 assert.equal(f.calls.length,1);assert.equal(f.stops(),stops);assert.equal(f.c.request,call.id);assert.equal(f.marks.at(-1),null);
 f.c.boundary(call.id,text.indexOf('complete'),text.indexOf('complete')+8);assert.equal(f.marks.at(-1),'complete');
 assert.equal(f.calls.length,1);f.c.event(call.id,'done','');assert.equal(f.c.session,null);
});
test('without precise timing the reader does not leave an inaccurate word highlighted',()=>{
 const f=fixture(),text='A full sentence can play without word callbacks.';f.c.start(text,'lesson',f.model(text));
 f.c.event(f.calls[0].id,'start','');assert.ok(f.marks.every(mark=>mark===null));
});
test('precise callbacks still highlight the selected occurrence and resume with its remaining passage',()=>{
 const f=fixture(),text='Current follows current through the circuit.';f.c.start(text,'lesson',f.model(text));
 const first=f.calls[0].id,at=text.indexOf('current');f.c.boundary(first,at,at+7);assert.equal(f.marks.at(-1),'current');
 f.c.pause('lesson');f.c.event(first,'done','');assert.equal(f.calls.length,1);f.c.pause('lesson');
 assert.equal(f.calls[1].text,text.slice(at));assert.equal(f.calls[1].rate,1.25);
 f.c.boundary(first,0,7);assert.equal(f.c.request,f.calls[1].id);f.c.stop();f.c.event(f.calls[1].id,'done','');assert.equal(f.calls.length,2);
});
test('browser voices without word timing receive one full sentence and finish normally',()=>{
 const f=fixture({browser:true}),text='Browser lesson reading should stay smooth too.';f.c.start(text,'lesson',f.model(text));
 assert.equal(f.calls.length,1);assert.equal(f.calls[0].text,text);assert.equal(f.calls[0].voice.voiceURI,'local');
 f.calls[0].onstart();f.calls[0].onend();assert.equal(f.c.session,null);assert.equal(f.calls.length,1);
});
test('browser phrase callbacks do not cancel or restart the active utterance',()=>{
 const f=fixture({browser:true}),text='Keep this whole phrase playing continuously.';f.c.start(text,'lesson',f.model(text));
 const stops=f.stops();f.calls[0].onstart();f.calls[0].onboundary({name:'word',charIndex:0,charLength:text.length});
 assert.equal(f.calls.length,1);assert.equal(f.stops(),stops);assert.equal(f.marks.at(-1),null);
});
test('phonetic alphabet retains complete letter phrases and its fixed 0.8 speed after resume',()=>{
 const f=fixture();f.c.start('A is for Alfa. B is for Bravo.','itu-alphabet');
 assert.equal(f.calls[0].text,'A is for Alfa.');assert.equal(f.calls[0].rate,0.8);
 f.c.pause('itu-alphabet');f.c.pause('itu-alphabet');assert.equal(f.calls[1].text,'A is for Alfa.');assert.equal(f.calls[1].rate,0.8);
 f.c.event(f.calls[1].id,'done','');assert.equal(f.calls[2].text,'B is for Bravo.');assert.equal(f.calls[2].rate,0.8);
});
