// ©️ Kevin W. Brown 2026
const test=require('node:test'),assert=require('node:assert/strict'),C=require('../app/src/main/assets/core.js');
const text='Alpha bravo charlie delta echo foxtrot golf hotel';
const target=(start,end)=>({chapterId:'certificate',lessonId:'B-001-001',text,ranges:[{start,end}]});
const mark=(id,start,end,colour='yellow')=>({id,chapterId:'certificate',lessonId:'B-001-001',start,end,text:text.slice(start,end),createdAt:'2026-10-24T10:00:00Z',colour});
test('removing the middle of a saved mark preserves both sides and their original colour',()=>{
 const original=[mark('one',0,23,'green')],copy=structuredClone(original),next=C.editHighlights(original,target(6,11));
 assert.deepEqual(next.map(h=>[h.start,h.end,h.text,h.colour]),[[0,6,'Alpha ','green'],[11,23,' charlie del','green']]);assert.equal(new Set(next.map(h=>h.id)).size,2);assert.deepEqual(original,copy);
});
test('removal subtracts every overlapping layer rather than revealing an older colour',()=>{
 const next=C.editHighlights([mark('base',0,23),mark('top',6,19,'pink')],target(8,15));assert.ok(next.every(h=>h.end<=8||h.start>=15));assert.deepEqual(C.highlightedRanges(next,target(8,15)),[]);
});
test('recolouring preserves surrounding colours and changes only covered portions of a mixed selection',()=>{
 const next=C.editHighlights([mark('left',0,5,'blue'),mark('right',12,19,'red')],target(2,16),'cyan');
 assert.deepEqual(C.highlightedRanges(next,target(0,text.length)),[{start:0,end:5},{start:12,end:19}]);assert.deepEqual(next.filter(h=>h.colour==='cyan').map(h=>[h.start,h.end]),[[2,5],[12,16]]);assert.equal(next.find(h=>h.id==='left').colour,'blue');assert.equal(next.find(h=>h.id==='right').colour,'red');
});
test('removing a full selection clears matching marks but preserves other lessons',()=>{
 const other={...mark('other',0,5,'red'),lessonId:'B-001-002'},next=C.editHighlights([mark('one',0,23),other],target(0,text.length));assert.deepEqual(next,[other]);
});
test('multiple selected ranges remove their own spans while preserving the gap',()=>{
 const t={...target(0,5),ranges:[{start:0,end:5},{start:12,end:19}]},next=C.editHighlights([mark('one',0,30,'purple')],t);assert.deepEqual(next.map(h=>[h.start,h.end,h.colour]),[[5,12,'purple'],[19,30,'purple']]);
});
test('legacy yellow marks and unique relocated quotes can be edited without changing unrelated text',()=>{
 const legacy=mark('legacy',6,11);delete legacy.colour;const t={...target(6,11),text:'Prefix '+text,ranges:[{start:13,end:18}]};assert.deepEqual(C.resolveHighlight(legacy,t.text),{start:13,end:18});assert.deepEqual(C.editHighlights([legacy],t),[]);
});
test('ambiguous or missing relocated quotes cannot be edited at an unrelated position',()=>{
 const h=mark('one',6,11),t={...target(0,5),text:'bravo X bravo'};assert.equal(C.resolveHighlight(h,t.text),null);assert.deepEqual(C.editHighlights([h],t),[h]);
});
test('edited highlights retain valid exact quotes and round-trip through saved progress',()=>{
 const next=C.editHighlights([mark('one',0,text.length,'orange')],target(6,19),'blue'),progress=C.fresh();progress.highlights=next;assert.deepEqual(C.validate(JSON.parse(JSON.stringify(progress)),{}).highlights,next);for(const h of next)assert.equal(text.slice(h.start,h.end),h.text);assert.throws(()=>C.editHighlights(next,target(0,5),'invalid'),/colour/);
});
