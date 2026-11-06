const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../app/src/main/assets/core.js');
const P=require('../app/src/main/assets/preferences.js');

test('older profiles acquire reading and appearance defaults without losing existing preferences',()=>{
 const old=C.fresh();old.settings={language:'fr',highlighterColour:'pink'};old.notes.certificate='Keep this note';
 const restored=C.validate(old,{});
 assert.equal(restored.settings.theme,'midnight');assert.equal(restored.settings.readingVoice,'');
 assert.equal(restored.settings.speechRate,1);assert.equal(restored.settings.language,'fr');
 assert.equal(restored.settings.highlighterColour,'pink');assert.equal(restored.notes.certificate,'Keep this note');
});
test('the selected voice, speed and every theme survive a progress round trip',()=>{
 for(const theme of C.themes){const state=C.fresh();state.settings={...state.settings,theme:theme.id,readingVoice:'English local voice',speechRate:1.25};assert.deepEqual(C.validate(JSON.parse(JSON.stringify(state)),{}).settings,state.settings);}
});
test('malformed settings are rejected before an imported backup can change current progress',()=>{
 for(const patch of [{theme:'unknown'},{speechRate:0},{speechRate:3},{speechRate:'1'},{readingVoice:17},{readingVoice:'x'.repeat(513)},{readingVoice:'bad\nvoice'}]){
  const current=C.fresh(),incoming=C.fresh();current.notes.certificate='Keep';Object.assign(incoming.settings,patch);
  assert.throws(()=>C.merge(current,incoming,{}));assert.equal(current.notes.certificate,'Keep');assert.equal(current.settings.theme,'midnight');
 }
});
test('progress merges retain this profile’s voice and theme while still combining study notes',()=>{
 const current=C.fresh(),incoming=C.fresh();Object.assign(current.settings,{theme:'forest',readingVoice:'local-one'});Object.assign(incoming.settings,{theme:'paper',readingVoice:'local-two'});incoming.notes.tuning='Imported note';
 const merged=C.merge(current,incoming,{});assert.deepEqual(merged.settings,current.settings);assert.equal(merged.notes.tuning,'Imported note');
});
test('speech chunks stay under engine limits and preserve words, punctuation and surrogate pairs',()=>{
 const text=('Voltage and current 📻 stay together.\nA long explanation uses all its words. ').repeat(70)+'A'.repeat(1000);
 const parts=P.chunks(text);assert.ok(parts.length>2);assert.ok(parts.every(s=>s.length<=700));
 assert.equal(parts.join(' ').replace(/\s/g,''),text.replace(/\s/g,''));
 assert.ok(parts.every(s=>!/[\uD800-\uDBFF]$/.test(s)&&!/^[\uDC00-\uDFFF]/.test(s)));
 assert.deepEqual(P.chunks('   '),[]);
});
test('2.3.12 settings retain the previously active voice and remove the retired sex-specific fields',()=>{
 for(const gender of ['female','male']){
  const old={language:'fr',theme:'forest',voiceGender:gender,femaleVoice:'old-female-choice',maleVoice:'old-male-choice',speechRate:1.5};
  const copy=JSON.stringify(old),upgraded=C.validatePreferences(old);
  assert.equal(upgraded.readingVoice,old[gender+'Voice']);assert.equal(upgraded.theme,'forest');assert.equal(upgraded.speechRate,1.5);
  for(const field of ['voiceGender','femaleVoice','maleVoice'])assert.equal(field in upgraded,false);
  assert.equal(JSON.stringify(old),copy);
  assert.equal(C.validatePreferences({...old,readingVoice:'new-choice'}).readingVoice,'new-choice');
 }
 assert.equal(C.validatePreferences({voiceGender:'male',maleVoice:''}).readingVoice,'');
});
test('encrypted User backups restore the chosen voice and theme while a second profile starts with its own settings',async()=>{
 const P=require('../app/src/main/assets/profiles.js');
 const storage=()=>{let text='';return {read:()=>text,write:value=>{text=value;return true;},readLegacy:()=>'',clearLegacy:()=>{},validate:s=>C.validate(s,{}),fresh:C.fresh};};
 const store=await new P.Store(storage()).init(),password='Reading preferences passphrase';
 const id=await store.create({name:'Reader A',email:'reader-a@example.org',password,avatar:''});
 const state=C.fresh();Object.assign(state.settings,{theme:'paper',readingVoice:'selected-local-voice',speechRate:1.5});await store.save(state);await store.lock();
 const backup=await store.exportProfile(id,password);assert.ok(!backup.includes('selected-local-voice'));
 const other=await new P.Store(storage()).init(),restored=await other.importProfile(backup,password);assert.deepEqual((await other.login(restored,password)).settings,state.settings);
 await store.create({name:'Reader B',email:'reader-b@example.org',password,avatar:''});assert.deepEqual(store.session.payload.progress.settings,C.defaultPreferences());await store.lock();assert.deepEqual((await store.login(id,password)).settings,state.settings);
});
