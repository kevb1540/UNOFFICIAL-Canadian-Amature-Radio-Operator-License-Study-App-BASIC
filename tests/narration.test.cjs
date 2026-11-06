const test=require('node:test'),assert=require('node:assert/strict');
const N=require('../app/src/main/assets/narration.js');
test('word offsets preserve Unicode, apostrophes and repeated words',()=>{
 const text='Ohm’s law: current, current, π and 14.2 MHz. 📻';
 const tokens=N.words(text);for(const word of tokens)assert.equal(text.slice(word.start,word.end),word.text);
 assert.ok(tokens.some(w=>w.text==='Ohm’s'));assert.ok(tokens.some(w=>w.text==='14.2'));
 assert.deepEqual(N.words('B-001-001 radio-frequency V/I').map(w=>w.text),['B-001-001','radio-frequency','V/I']);
 const second=text.indexOf('current',text.indexOf('current')+1);assert.equal(N.wordAt(tokens,second,second+7).start,second);
});
test('word-at lookup ignores punctuation-only ranges and rounds positions inside a word',()=>{
 const tokens=N.words('Read, then continue.');assert.equal(N.wordAt(tokens,2,4).text,'Read');assert.equal(N.wordAt(tokens,4,5),null);assert.equal(N.wordAt(tokens,6,10).text,'then');
});
test('fallback word plans preserve punctuation and start at the requested word',()=>{
 const text='Voltage = current × resistance. Read here, then continue.';
 const plans=N.wordPlans(text);assert.equal(plans.map(p=>p.text).join('').replace(/\s/g,''),text.replace(/\s/g,''));
 for(const part of plans)assert.equal(N.words(part.text).length,1);
 const at=text.indexOf('here');assert.equal(N.wordPlans(text,at)[0].start,at);assert.ok(N.wordPlans(text,at)[0].text.startsWith('here,'));
});
test('normal speech plans keep exact global character offsets without splitting surrogate pairs',()=>{
 const text=('Read this paragraph 📻. Current and voltage are related.\n').repeat(80);
 const plans=N.chunkPlans(text);assert.ok(plans.length>2);
 for(const part of plans){assert.equal(text.slice(part.start,part.end),part.text);assert.ok(part.text.length<=700);assert.ok(!/[\uD800-\uDBFF]$/.test(part.text));assert.ok(!/^[\uDC00-\uDFFF]/.test(part.text));}
 assert.equal(plans.map(p=>p.text).join('').replace(/\s/g,''),text.replace(/\s/g,''));
});
test('seeking a later repeated passage does not restart an earlier identical passage',()=>{
 const text='current and voltage. current and voltage.';const second=text.lastIndexOf('current');
 assert.equal(N.chunkPlans(text,second)[0].start,second);assert.equal(N.wordPlans(text,second)[0].start,second);
 assert.equal(N.chunkPlans(text,second)[0].text,'current and voltage.');
});
test('empty or completed text produces no queued speech',()=>{
 assert.deepEqual(N.wordPlans('   '),[]);assert.deepEqual(N.chunkPlans(' \n '),[]);assert.deepEqual(N.chunkPlans('Finished',8),[]);assert.deepEqual(N.wordPlans('Finished',8),[]);
});
