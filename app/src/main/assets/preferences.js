// ©️ Kevin W. Brown 2026
// Per-profile appearance and installed-voice lesson reading. No remote speech API.
(function(root){'use strict';
const C=root.RadioCore;
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function chunks(text,limit=700){
 let remaining=String(text).replace(/\r/g,'').trim();const result=[];
 while(remaining.length){
  let end=Math.min(limit,remaining.length);
  if(end<remaining.length){
   const part=remaining.slice(0,end),candidates=[part.lastIndexOf('\n'),part.lastIndexOf('. ')+1,part.lastIndexOf('? ')+1,part.lastIndexOf('! ')+1];
   const boundary=Math.max(...candidates);end=boundary>limit/3?boundary:part.lastIndexOf(' ');
   if(end<limit/3)end=limit;
   const code=remaining.charCodeAt(end-1);if(code>=0xd800&&code<=0xdbff)end--;
  }
  const part=remaining.slice(0,end).trim();if(part)result.push(part);remaining=remaining.slice(end).trimStart();
 }
 return result;
}
class Controller{
 constructor(io){
  this.io=io;this.owner=null;this.catalog={ready:false,voices:[],error:''};this.session=null;this.request='';this.sequence=0;this.pending=false;this.message='';this.voiceRefreshNeeded=false;this.wordMarker=new RadioNarration.WordMarker();
  this.installFloatingToggle();
  root.onLessonSpeechEvent=(id,event,message)=>this.event(id,event,message);
  root.onLessonSpeechBoundary=(id,start,end)=>this.boundary(id,start,end);
  root.onLessonVoicesChanged=()=>this.refreshVoices();
  root.stopLessonReading=()=>this.stop();
  root.suspendLessonReadingForHelp=()=>{const s=this.session;if(!s)return null;const paused=s.paused,anchor=s.resumeAnchor?{...s.resumeAnchor}:null;if(!paused)this.pause(s.lessonId);return()=>{if(this.session!==s||s.owner!==this.io.identity())return;s.resumeAnchor=anchor;if(!paused&&s.paused)this.pause(s.lessonId);};};
  if(root.speechSynthesis)root.speechSynthesis.addEventListener('voiceschanged',()=>this.refreshVoices());
  document.addEventListener('click',event=>this.click(event));
  document.addEventListener('change',event=>this.change(event));
  document.addEventListener('input',event=>{if(event.target.id==='reading-speed')this.speedLabel(event.target.value);});
  document.addEventListener('dblclick',event=>this.doubleClick(event));
  document.addEventListener('pointerdown',event=>this.tapDown(event),{passive:true});
  document.addEventListener('pointermove',event=>{if(this.tap&&Math.hypot(event.clientX-this.tap.x,event.clientY-this.tap.y)>12)this.resetTaps();},{passive:true});
  document.addEventListener('pointerup',event=>this.tapUp(event),{passive:false});
  document.addEventListener('pointercancel',()=>this.resetTaps(),{passive:true});
  document.addEventListener('scroll',()=>this.resetTaps(),{capture:true,passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)this.stop();});
  root.addEventListener('pagehide',()=>this.stop());
  this.refreshVoices();
 }
 installFloatingToggle(){
  const button=document.createElement('button');button.type='button';button.id='floating-reading-toggle';button.hidden=true;button.dataset.action='toggle-floating-reading';button.dataset.state='playing';button.dataset.overText='false';button.setAttribute('aria-label','Pause reading');button.title='Pause reading';
  button.innerHTML='<svg class="floating-reading-pause" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg><svg class="floating-reading-play" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 4v16l13-8z"/></svg>';
  document.body.append(button);this.floatingToggle=button;
  const schedule=()=>this.scheduleFloatingOverlap();
  document.addEventListener('scroll',schedule,{capture:true,passive:true});root.addEventListener('resize',schedule,{passive:true});
  root.visualViewport?.addEventListener('resize',schedule,{passive:true});root.visualViewport?.addEventListener('scroll',schedule,{passive:true});
  const main=document.querySelector('main');
  if(main){this.floatingMutations=new MutationObserver(schedule);this.floatingMutations.observe(main,{subtree:true,childList:true,characterData:true,attributes:true});}
  if(root.ResizeObserver){this.floatingResize=new ResizeObserver(schedule);for(const element of [main,document.querySelector('.appbar')])if(element)this.floatingResize.observe(element);}
  document.fonts?.addEventListener('loadingdone',schedule);
 }
 syncFloatingToggle(){
  const button=this.floatingToggle,active=this.session&&this.session.owner===this.io.identity();button.hidden=!active;
  if(!active){button.dataset.overText='false';return;}
  const paused=this.session.paused,label=paused?'Play reading':'Pause reading';button.dataset.state=paused?'paused':'playing';button.setAttribute('aria-label',label);button.title=label;this.scheduleFloatingOverlap();
 }
 scheduleFloatingOverlap(){
  if(this.floatingToggle.hidden||this.floatingFrame)return;
  this.floatingFrame=root.requestAnimationFrame(()=>{this.floatingFrame=0;this.updateFloatingOverlap();});
 }
 updateFloatingOverlap(){
  const button=this.floatingToggle,main=document.querySelector('main');if(button.hidden||!main)return;
  const box=button.getBoundingClientRect(),candidates=new Set(),intersects=r=>r.width>0&&r.height>0&&r.left<box.right&&r.right>box.left&&r.top<box.bottom&&r.bottom>box.top;
  // Hit-test nearby content, then check actual text-line rectangles. Card padding
  // and empty margins do not make the control translucent. Work stays local to
  // the button instead of walking every lesson on every scroll.
  for(const x of [box.left+1,(box.left+box.right)/2,box.right-1])for(let i=0;i<5;i++){
   const y=box.top+1+(box.height-2)*i/4;
   const element=document.elementsFromPoint(x,y).find(e=>e!==main&&main.contains(e));
   if(element)candidates.add(element.closest('p,h1,h2,h3,h4,h5,h6,li,td,th,summary,label,button')||element);
  }
  let overlap=false;
  for(const element of candidates){
   const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.data.trim()&&n.parentElement&&!n.parentElement.closest('[hidden],script,style')?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT});
   while(walker.nextNode()){
    const node=walker.currentNode,style=getComputedStyle(node.parentElement);if(style.visibility==='hidden'||style.visibility==='collapse')continue;
    const range=document.createRange();range.selectNodeContents(node);if([...range.getClientRects()].some(intersects)){overlap=true;break;}
   }
   if(overlap)break;
  }
  const value=String(overlap);if(button.dataset.overText!==value)button.dataset.overText=value;
 }
 get settings(){return this.io.identity()?this.io.state().settings:C.defaultPreferences();}
 apply(){
  const owner=this.io.identity();if(owner!==this.owner){this.voiceRefreshNeeded=false;this.stop();this.owner=owner;this.message='';}
  const theme=C.themes.find(t=>t.id===this.settings.theme)||C.themes[0];
  document.documentElement.dataset.theme=theme.id;
  document.documentElement.style.colorScheme=theme.light?'light':'dark';
  const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=theme.background;
  if(root.AndroidApp?.applyColourTheme)root.AndroidApp.applyColourTheme(theme.background,theme.light);
 }
 async refreshVoices(){
  try{
   if(root.AndroidApp?.lessonVoices){this.catalog=JSON.parse(root.AndroidApp.lessonVoices());}
   else if(root.speechSynthesis){this.catalog={ready:true,error:'',voices:root.speechSynthesis.getVoices().filter(v=>/^en(?:-|_)/i.test(v.lang)&&v.localService).map(v=>({id:v.voiceURI,name:v.name,language:v.lang,offline:true}))};}
   else this.catalog={ready:true,voices:[],error:'Lesson reading is unavailable in this browser. Use the Android app with an installed speech engine.'};
   this.catalog.voices=(this.catalog.voices||[]).filter(v=>v&&typeof v.id==='string'&&v.id.length<=512&&v.offline===true&&/^en(?:-|_)/i.test(v.language||''));
  }catch(e){this.catalog={ready:true,voices:[],error:'Could not load the installed reading voices. Open phone voice settings and try Refresh voices.'};}
  this.refreshVoiceControls();
 }
 selectedVoice(saved=this.settings.readingVoice){
  return this.catalog.voices.find(v=>v.id===saved)||(!saved?this.catalog.voices[0]:null)||null;
 }
 voiceOptions(){
  const selected=this.settings.readingVoice,chosen=this.selectedVoice();
  let options=`<option value="">${!selected&&chosen?'Default: '+escape(chosen.name):'Default available voice'}</option>`;
  if(selected&&!this.catalog.voices.some(v=>v.id===selected))options+=`<option value="${escape(selected)}" selected>Saved voice unavailable on this device</option>`;
  return options+this.catalog.voices.map(v=>`<option value="${escape(v.id)}"${v.id===(selected||'')?' selected':''}>${escape(v.name)} · ${escape(v.language)}</option>`).join('');
 }
 settingsHTML(){
  const s=this.settings;return `<section class="card profile-options"><h2>Sound effects</h2><fieldset><legend>App sounds</legend><label class="inline-check" for="sound-effects"><input id="sound-effects" type="checkbox" ${s.soundEffects?'checked':''}>Enable sound effects</label><p class="helper">Welcome on sign-in, correct and incorrect answer sounds, and a celebration when you pass a test. Saved separately for this profile.</p></fieldset><p class="preferences-save-status" role="status">${escape(this.message)}</p></section><section class="card profile-options" aria-labelledby="reading-settings-heading"><h2 id="reading-settings-heading">Read lessons aloud</h2><p class="small-text muted">Voice and colour choices save separately for each user profile and travel with encrypted User backups.</p><fieldset id="reading-preferences"><legend>Reading voice</legend><label for="reading-voice">Voice</label><div class="voice-picker"><select id="reading-voice" aria-describedby="voice-guidance">${this.voiceOptions()}</select><button type="button" id="reading-voice-preview" class="btn" data-action="${this.previewPlaying()?'stop-reading':'preview-reading-voice'}">${this.previewPlaying()?'Stop reading':'Preview voice'}</button></div><p class="helper" id="voice-guidance">Choose an available voice and use Preview to hear it. Only on-device English voices are listed.</p><div class="reading-speed-control"><label for="reading-speed">Speech speed <output id="reading-speed-value" for="reading-speed">${Number(s.speechRate.toFixed(2))}×</output></label><input id="reading-speed" type="range" min="0.5" max="2" step="0.05" value="${s.speechRate}" aria-describedby="reading-speed-help" aria-valuetext="${Number(s.speechRate.toFixed(2))} times normal speed"><p class="helper" id="reading-speed-help">0.5× slower · 1× normal · 2× faster</p></div></fieldset><div class="actions"><button type="button" class="btn voice-refresh" data-action="refresh-reading-voices"${this.voiceRefreshNeeded?'':' hidden'}>Refresh voices</button>${root.AndroidApp?.openSpeechSettings?'<button class="btn ghost" data-action="phone-voice-settings">Phone voice settings</button>':''}</div><p class="helper" id="voice-availability">${escape(this.availability())}</p><p class="small-text preferences-save-status" role="status" aria-live="polite">${escape(this.message)}</p></section><section class="card profile-options" aria-labelledby="theme-settings-heading"><h2 id="theme-settings-heading">Colour theme</h2><p class="small-text muted">Choose a theme for this profile. The preview applies as soon as the choice is saved.</p><fieldset id="theme-preferences"><legend>Eight colour themes</legend><div class="theme-options">${C.themes.map(t=>`<button class="theme-choice${s.theme===t.id?' selected':''}" data-action="choose-colour-theme" data-theme="${t.id}" aria-pressed="${s.theme===t.id}"><span class="theme-swatch" style="--swatch-bg:${t.background};--swatch-panel:${t.panel};--swatch-accent:${t.accent}" aria-hidden="true"><i></i><b></b></span><span>${escape(t.name)}</span><small>${t.light?'Light':'Dark'}</small></button>`).join('')}</div></fieldset></section>`;
 }
 availability(){
  if(!this.catalog.ready)return 'Preparing the phone’s speech engine…';
  if(this.catalog.error)return this.catalog.error;
  return this.catalog.voices.length?`${this.catalog.voices.length} installed English voices available. Download additional voices in your phone’s speech settings if needed.`:'No on-device English voices are available. Install English voice data in the phone’s speech settings, then choose Refresh voices.';
 }
 refreshVoiceControls(){
  const select=document.getElementById('reading-voice');if(select)select.innerHTML=this.voiceOptions();
  const availability=document.getElementById('voice-availability');if(availability)availability.textContent=this.availability();
  this.syncVoiceActions();
 }
 previewPlaying(){return !!this.session&&this.session.lessonId===null&&!this.session.paused&&this.session.owner===this.io.identity();}
 syncVoiceActions(){
  // Reuse one fixed-size button so playback never moves the preview control or its focus.
  const preview=document.getElementById('reading-voice-preview'),playing=this.previewPlaying();
  if(preview){preview.dataset.action=playing?'stop-reading':'preview-reading-voice';preview.textContent=playing?'Stop reading':'Preview voice';}
  const refresh=document.querySelector('[data-action="refresh-reading-voices"]');if(refresh)refresh.hidden=!this.voiceRefreshNeeded;
 }
 speedLabel(value){
  const number=Number(Number(value).toFixed(2)),output=document.getElementById('reading-speed-value'),slider=document.getElementById('reading-speed');
  if(output)output.value=number+'×';
  if(slider)slider.setAttribute('aria-valuetext',number+' times normal speed');
 }
 announce(message){this.message=message;document.querySelectorAll('.preferences-save-status').forEach(e=>e.textContent=message);}
 async update(key,value){
  if(this.pending||!this.io.identity())return;
  const owner=this.io.identity(),state=this.io.state(),previous={...state.settings};
  try{state.settings=C.validatePreferences({...previous,[key]:value});}catch(e){this.io.notice(e.message);return;}
  this.pending=true;this.stop();this.announce('Saving settings…');
  document.querySelectorAll('.profile-options fieldset').forEach(f=>f.disabled=true);
  const ok=await this.io.save();this.pending=false;
  if(owner!==this.io.identity())return;
  if(!ok){state.settings=previous;this.io.notice('Settings could not be saved. Your previous choices are still in use.');}
  if(ok&&(key==='readingVoice'||key==='speechRate')&&previous[key]!==state.settings[key])this.voiceRefreshNeeded=true;
  this.apply();this.announce(ok?'Settings saved for this profile.':'Settings could not be saved.');
  document.querySelectorAll('.profile-options fieldset').forEach(f=>f.disabled=false);
  const effects=document.getElementById('sound-effects');if(effects)effects.checked=this.settings.soundEffects;
  const speed=document.getElementById('reading-speed');if(speed){speed.value=String(this.settings.speechRate);this.speedLabel(speed.value);}
  document.querySelectorAll('.theme-choice').forEach(b=>{const selected=b.dataset.theme===this.settings.theme;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});
  this.refreshVoiceControls();
 }
 controls(lessonId){return `<div class="lesson-audio-tools" data-audio-lesson="${escape(lessonId)}"><div class="actions"><button class="btn" data-action="read-lesson" data-lesson="${escape(lessonId)}">▶ Read lesson</button><button class="btn ghost" data-action="pause-reading" data-lesson="${escape(lessonId)}" disabled>Pause</button><button class="btn ghost" data-action="stop-reading" data-lesson="${escape(lessonId)}" disabled>Stop</button></div><p class="helper lesson-audio-status" role="status" aria-live="polite"></p></div>`;}
 updateReadingUI(message=''){
  this.syncVoiceActions();
  const touchLesson=this.session?.owner===this.io.identity()?this.session?.model?.lesson:null;
  if(this.touchLesson!==touchLesson){this.touchLesson?.removeAttribute('data-reading-active');if(touchLesson?.isConnected)touchLesson.setAttribute('data-reading-active','true');this.touchLesson=touchLesson;}
  const pausedLesson=this.session?.paused&&this.session.owner===this.io.identity()?this.session.model?.lesson:null;
  if(this.pausedTouchLesson!==pausedLesson){this.pausedTouchLesson?.removeAttribute('data-reading-paused');if(pausedLesson?.isConnected)pausedLesson.setAttribute('data-reading-paused','true');this.pausedTouchLesson=pausedLesson;}
  const alphabetActive=this.session?.lessonId==='itu-alphabet',alphabetPaused=alphabetActive&&this.session.paused;
  const alphabetPlay=document.getElementById('itu-tts-play'),alphabetStop=document.getElementById('itu-tts-stop');
  if(alphabetPlay){alphabetPlay.textContent=alphabetActive&&!alphabetPaused?'Ⅱ Pause':'▶ Play';alphabetPlay.setAttribute('aria-label',alphabetActive&&!alphabetPaused?'Pause phonetic alphabet':alphabetPaused?'Resume phonetic alphabet':'Play phonetic alphabet');}
  if(alphabetStop)alphabetStop.disabled=!alphabetActive;

  document.querySelectorAll('[data-audio-lesson]').forEach(box=>{
   const active=this.session?.lessonId===box.dataset.audioLesson;
   const pause=box.querySelector('[data-action="pause-reading"]'),stop=box.querySelector('[data-action="stop-reading"]');
   pause.disabled=!active;pause.textContent=active&&this.session.paused?'Resume':'Pause';stop.disabled=!active;
   box.querySelector('.lesson-audio-status').textContent=active?(message||`${this.session.paused?'Paused':'Reading'} · part ${this.session.index+1} of ${this.session.chunks.length}`):'';
  });
  this.syncFloatingToggle();
 }
 read(lessonId){
  const lesson=document.getElementById('lesson-'+lessonId);if(!lesson)return false;
  const model=new RadioNarration.Model(lesson);return this.start(model.text,lessonId,model);
 }
 readFromAnchor(target){
  if(!target||target.identity!==this.io.identity()||!target.lesson?.isConnected)return false;
  const model=new RadioNarration.Model(target.lesson),selected=target.ranges?.[0];
  const word=selected&&model.wordFromSource(selected.start,selected.end);if(!word)return false;
  root.getSelection()?.removeAllRanges();return this.start(model.text,target.lessonId,model,word.start);
 }
 selectPausedAnchor(target){
  const s=this.session;
  if(!s?.paused||!s.model||s.owner!==this.io.identity()||target?.identity!==s.owner||target.lesson!==s.model.lesson||!target.lesson.isConnected||root.RadioHelp?.restoring||document.querySelector('dialog[open]'))return false;
  const selected=target.ranges?.[0];if(!selected)return false;
  const model=new RadioNarration.Model(target.lesson),word=model.wordFromSource(selected.start,selected.end);if(!word)return false;
  // Keep source offsets when Android dismisses selection or saving a mark rebuilds text nodes.
  s.resumeAnchor={start:selected.start,end:selected.end};return true;
 }
 readingLessonAt(target){
  const s=this.session,element=target?.nodeType===3?target.parentElement:target;
  if(!s?.model||s.owner!==this.io.identity()||!s.model.lesson.isConnected||root.RadioHelp?.restoring||document.querySelector('dialog[open]')||!element?.closest)return null;
  if(element.closest('button,a,input,textarea,select,summary,[contenteditable],[hidden]'))return null;
  return element.closest('.lesson')===s.model.lesson?s.model.lesson:null;
 }
 seekPoint(x,y,target){
  const lesson=this.readingLessonAt(target);if(!lesson)return false;
  const model=new RadioNarration.Model(lesson),word=model.wordAtPoint(x,y);if(!word)return false;
  const s=this.session;
  if(s.paused){s.resumeAnchor={start:model.sourceStarts[word.start],end:model.sourceEnds[word.end-1]};this.resetTaps();this.updateReadingUI('Paused · Play will start at “'+word.text+'”.');}
  else{
   // Keep this session's voice and rate, and invalidate callbacks from the old passage.
   this.cancelAudio();this.wordMarker.clear();s.model=model;s.text=model.text;s.lastWord=null;s.resumeAnchor=null;
   s.chunks=this.plan(s.text,word.start,s.mode);s.index=0;root.getSelection()?.removeAllRanges();this.speakChunk();
  }
  return true;
 }
 doubleClick(event){
  if(event.button!==0)return;
  const touch=this.lastTouchSeek;
  // Some WebViews emit a mouse double-click after the touch gesture was handled.
  if(touch&&touch.session===this.session&&event.timeStamp>=touch.at&&event.timeStamp-touch.at<=700&&Math.hypot(event.clientX-touch.x,event.clientY-touch.y)<=24){this.lastTouchSeek=null;event.preventDefault();return;}
  if(this.seekPoint(event.clientX,event.clientY,event.target))event.preventDefault();
 }
 resetTaps(){this.tap=null;this.lastTap=null;}
 tapDown(event){
  if(event.pointerType!=='touch')this.lastTouchSeek=null;
  if(event.pointerType!=='touch'||event.isPrimary===false||!this.readingLessonAt(event.target)){this.resetTaps();return;}
  this.tap={id:event.pointerId,x:event.clientX,y:event.clientY,at:event.timeStamp,session:this.session};
 }
 tapUp(event){
  const tap=this.tap;this.tap=null;
  if(!tap||event.pointerType!=='touch'||event.pointerId!==tap.id||tap.session!==this.session||!this.readingLessonAt(event.target)||event.timeStamp-tap.at>350||Math.hypot(event.clientX-tap.x,event.clientY-tap.y)>12){this.lastTap=null;return;}
  const previous=this.lastTap;
  if(previous&&previous.session===this.session&&event.timeStamp-previous.at<=450&&Math.hypot(event.clientX-previous.x,event.clientY-previous.y)<=24){
   this.lastTap=null;if(this.seekPoint(event.clientX,event.clientY,event.target)){this.lastTouchSeek={at:event.timeStamp,x:event.clientX,y:event.clientY,session:this.session};event.preventDefault();}
  }else this.lastTap={x:event.clientX,y:event.clientY,at:event.timeStamp,session:this.session};
 }
 visibleText(lesson){return new RadioNarration.Model(lesson).text;}
 plan(text,start,mode){
  if(mode==='alphabet'){const result=[];for(const match of text.matchAll(/[^.]+\./g)){const offset=match.index+match[0].search(/\S/);if(offset+match[0].trim().length>start)result.push({text:match[0].trim(),start:offset,end:match.index+match[0].length,word:false});}return result;}

  // Keep natural phrasing even when the voice supplies no word timing.
  return RadioNarration.chunkPlans(text,start);
 }
 previewVoice(){
  if(this.pending||!this.io.identity())return false;
  // Capture the controls on every press, including a slider's live input value.
  // Previewing never changes this profile's saved preferences.
  const voice=document.getElementById('reading-voice'),speed=document.getElementById('reading-speed');
  const settings=C.validatePreferences({...this.settings,readingVoice:voice?.value??this.settings.readingVoice,speechRate:speed?Number(speed.value):this.settings.speechRate});
  root.RadioPhonetics?.stop();root.stopSoundEffects?.();
  return this.start('This is a sample of your reading voice and speech speed. Voltage, current and resistance are related by Ohm’s law.',null,null,0,settings);
 }
 start(text,lessonId,model=null,startOffset=0,settings=this.settings){
  if(!this.io.identity())return false;
  const voice=this.selectedVoice(settings.readingVoice);
  if(!voice){this.io.navigate('settings');this.announce('Choose an available voice in Settings. The phone may need English voice data installed.');return false;}
  this.stop();const mode=lessonId==='itu-alphabet'?'alphabet':'boundary';
  const parts=this.plan(text,startOffset,mode);if(!parts.length){this.io.notice('There is no visible lesson text to read.');return false;}
  this.session={lessonId,model,text,mode,lastWord:null,voiceId:voice.id,rate:lessonId==='itu-alphabet'?0.8:settings.speechRate,chunks:parts,index:0,paused:false,owner:this.io.identity()};this.speakChunk();return true;
 }
 boundary(id,start,end){
  const s=this.session;if(id!==this.request||!s||s.paused||s.owner!==this.io.identity()||!s.model||!Number.isInteger(start)||!Number.isInteger(end))return;
  const part=s.chunks[s.index];if(start<0||end<=start||start>=part.text.length||end>part.text.length)return;
  const word=s.model.wordAt(part.start+start,part.start+end);if(!word)return;
  s.lastWord=word;
  if(s.model.words.some(next=>next.start>=word.end&&next.start<part.start+end)){
   // A phrase callback is a resume position, not an exact spoken word.
   // Leave the current utterance playing instead of restarting word by word.
   this.wordMarker.clear();return;
  }
  this.wordMarker.show(s.model,word);
 }
 speakChunk(){
  const s=this.session;if(!s||s.paused||s.owner!==this.io.identity())return;
  const part=s.chunks[s.index];if(!part)return;
  const id='lesson-'+Date.now()+'-'+(++this.sequence);this.request=id;s.lastWord=null;this.updateReadingUI();
  if(root.AndroidApp?.speakLessonChunk){root.AndroidApp.speakLessonChunk(part.text,s.voiceId,s.rate,id);return;}
  const voice=root.speechSynthesis?.getVoices().find(v=>v.voiceURI===s.voiceId&&v.localService);
  if(!voice){this.event(id,'error','This voice is no longer available. Choose an installed voice in Settings.');return;}
  const utterance=new SpeechSynthesisUtterance(part.text);utterance.voice=voice;utterance.lang=voice.lang;utterance.rate=s.rate;
  utterance.onstart=()=>this.event(id,'start','');
  utterance.onboundary=e=>{if(!e.name||e.name==='word')this.boundary(id,e.charIndex,Math.min(part.text.length,e.charIndex+(e.charLength>0?e.charLength:1)));};
  utterance.onend=()=>this.event(id,'done','');utterance.onerror=e=>this.event(id,'error',e.error==='interrupted'?'Reading stopped.':'The speech engine could not read this passage.');
  root.speechSynthesis.speak(utterance);
 }
 event(id,event,message){
  if(!id&&event==='error'){this.io.notice(message||'Check the phone’s speech settings.');this.announce(message||'Check the phone’s speech settings.');return;}
  if(id!==this.request||!this.session||this.session.owner!==this.io.identity())return;
  // Only actual word-boundary events move the spoken-word highlight.
  if(event==='start')return;
  if(event==='error'){this.stop();this.io.notice(message||'The speech engine could not read this passage.');this.announce(message||'Reading could not start.');return;}
  if(event==='done'){
   this.request='';if(this.session.paused)return;this.wordMarker.clear();
   this.session.index++;
   if(this.session.index<this.session.chunks.length)this.speakChunk();else{this.stop();this.io.notice('Reading finished.');}
  }
 }
 cancelAudio(){this.resetTaps();this.lastTouchSeek=null;this.request='';if(root.AndroidApp?.stopLessonSpeech)root.AndroidApp.stopLessonSpeech();else root.speechSynthesis?.cancel();}
 pause(lessonId){
  const s=this.session;if(!s||s.lessonId!==lessonId)return;s.paused=!s.paused;
  if(s.paused){s.resumeAnchor=null;this.cancelAudio();this.wordMarker.clear();}
  else{
   let at=s.lastWord?.start??s.chunks[s.index].start;
   if(s.resumeAnchor&&s.model?.lesson.isConnected&&s.owner===this.io.identity()){
    const model=new RadioNarration.Model(s.model.lesson),word=model.wordFromSource(s.resumeAnchor.start,s.resumeAnchor.end);
    if(word){s.model=model;s.text=model.text;s.lastWord=null;at=word.start;root.getSelection()?.removeAllRanges();}
   }
   s.resumeAnchor=null;s.chunks=this.plan(s.text,at,s.mode);s.index=0;this.speakChunk();
  }
  this.updateReadingUI();
 }
 stop(){this.cancelAudio();this.session=null;this.wordMarker.clear();this.updateReadingUI();}
 click(event){
  const b=event.target.closest('[data-action]');if(!b)return;
  switch(b.dataset.action){
   case 'itu-tts-play':if(this.session?.lessonId==='itu-alphabet')this.pause('itu-alphabet');else{root.RadioPhonetics.stop();root.stopSoundEffects?.();this.start(root.RadioPhonetics.speechText(),'itu-alphabet');}break;
   case 'itu-tts-only':root.RadioPhonetics.stop();root.stopSoundEffects?.();this.start(root.RadioPhonetics.speechText(true),'itu-alphabet');break;
   case 'itu-tts-stop':if(this.session?.lessonId==='itu-alphabet')this.stop();break;
   case 'read-lesson':this.read(b.dataset.lesson);break;
   case 'pause-reading':this.pause(b.dataset.lesson);break;
   case 'toggle-floating-reading':if(this.session)this.pause(this.session.lessonId);break;
   case 'stop-reading':this.stop();break;
   case 'preview-reading-voice':this.previewVoice();break;
   case 'choose-colour-theme':this.update('theme',b.dataset.theme);break;
   case 'refresh-reading-voices':this.voiceRefreshNeeded=false;this.syncVoiceActions();root.AndroidApp?.refreshLessonVoices();this.refreshVoices();break;
   case 'phone-voice-settings':this.voiceRefreshNeeded=true;this.stop();root.AndroidApp?.openSpeechSettings();break;
  }
 }
 change(event){const t=event.target;if(t.id==='sound-effects'){if(!t.checked)root.stopSoundEffects?.();this.update('soundEffects',t.checked);}if(t.id==='reading-voice')this.update('readingVoice',t.value);if(t.id==='reading-speed')this.update('speechRate',Number(t.value));}
}
root.RadioPreferences={Controller,chunks};
if(typeof module!=='undefined')module.exports=root.RadioPreferences;
})(typeof window!=='undefined'?window:globalThis);
