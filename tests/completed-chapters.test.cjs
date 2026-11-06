// ©️ Kevin W. Brown 2026
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets'),C=require(assets+'/core.js');
const bank=JSON.parse(fs.readFileSync(assets+'/questions.json')),course=JSON.parse(fs.readFileSync(assets+'/course.json')),byId=Object.fromEntries(bank.map(q=>[q.id,q]));
const core=course.chapters.filter(ch=>ch.id!=='exam-ready').map(ch=>ch.id);
function random(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
function counts(questions){return Object.fromEntries(core.map(id=>[id,questions.filter(q=>q.chapter===id).length]));}
test('completed-chapter tests require at least one complete chapter',()=>assert.throws(()=>C.completedTest(bank,[]),/Mark a chapter complete/));
test('each individual completed core chapter gives eight unique questions from its own pool',()=>{
 for(const id of core){const qs=C.completedTest(bank,[id],random(14));assert.equal(qs.length,8);assert.equal(new Set(qs.map(q=>q.id)).size,8);assert.ok(qs.every(q=>q.chapter===id));}
});
test('three completed chapters give exactly 24 questions, eight per chapter, without mutating inputs',()=>{
 const ids=['certificate','electricity','signals'],snapshot=JSON.stringify({ids,bank}),qs=C.completedTest(bank,ids,random(24));
 assert.equal(qs.length,24);assert.equal(new Set(qs.map(q=>q.id)).size,24);for(const [id,n]of Object.entries(counts(qs)))assert.equal(n,ids.includes(id)?8:0);assert.equal(JSON.stringify({ids,bank}),snapshot);
});
test('all eleven core chapters give 88 questions and chapter twelve adds eight unique cumulative questions',()=>{
 const base=C.completedTest(bank,core,random(96)),all=C.completedTest(bank,['exam-ready',...core],random(96));
 assert.equal(base.length,88);assert.ok(Object.values(counts(base)).every(n=>n===8));assert.equal(all.length,96);assert.equal(new Set(all.map(q=>q.id)).size,96);assert.ok(base.every(q=>all.some(x=>x.id===q.id)));assert.equal(all.filter(q=>!base.some(x=>x.id===q.id)).length,8);
 const review=C.completedTest(bank,['exam-ready'],random(8));assert.equal(review.length,8);assert.equal(new Set(review.map(q=>q.id)).size,8);
});
test('duplicate completion entries do not multiply questions and insufficient pools never produce a short test',()=>{
 assert.deepEqual(C.completedTest(bank,['signals','signals'],random(3)),C.completedTest(bank,['signals'],random(3)));
 assert.throws(()=>C.completedTest(bank,['missing']),/not enough questions/);assert.throws(()=>C.completedTest(bank.filter(q=>q.chapter==='signals').slice(0,7),['signals']),/not enough questions/);
});
test('seeded mixes keep the exact eight-per-chapter quota with varied questions and shuffled ordering',()=>{
 const seen=new Set();for(let seed=1;seed<=100;seed++){const ids=core.filter((id,i)=>(seed+i)%3===0),qs=C.completedTest(bank,ids,random(seed));assert.equal(qs.length,ids.length*8);for(const [id,n]of Object.entries(counts(qs)))assert.equal(n,ids.includes(id)?8:0);seen.add(qs.map(q=>q.id).join(','));}
 assert.equal(seen.size,100);
});
test('a 96-question completed-chapter session survives backup validation with all answers and flags intact',()=>{
 const state=C.fresh(),ids=[...core,'exam-ready'];state.completed=ids;state.active=C.session(C.completedTest(bank,ids,random(1)),'completed:'+ids.join(','),'Completed chapters test','test',random(2));state.active.current=95;state.active.answers[95]=2;state.active.flags[95]=true;
 assert.deepEqual(C.validate(JSON.parse(JSON.stringify(state)),byId),state);const original=JSON.stringify(state.active);state.completed=[];assert.equal(JSON.stringify(state.active),original);
});
test('grading, history scopes and backup merging retain completed-chapter results without awarding chapter-test scores',()=>{
 const state=C.fresh(),scope='completed:certificate,electricity,signals',s=C.session(C.completedTest(bank,['certificate','electricity','signals'],random(4)),scope,'Completed chapters test');s.answers=s.questions.map((q,i)=>i<18?q.order.indexOf(0):null);const a=C.grade(s,byId);state.attempts=[a];assert.equal(a.score,18);assert.equal(a.total,24);assert.equal(a.percent,75);assert.equal(C.summary(state.attempts,'certificate').count,0);assert.equal(C.summary(state.attempts,scope).count,1);const copy=C.merge(C.fresh(),JSON.parse(JSON.stringify(state)),byId);assert.deepEqual(copy.attempts,[a]);assert.deepEqual(C.merge(copy,state,byId).attempts,[a]);
});
