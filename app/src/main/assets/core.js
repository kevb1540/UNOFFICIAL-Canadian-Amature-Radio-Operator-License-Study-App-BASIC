// ©️ Kevin W. Brown 2026
/* Pure course, quiz and RF calculations. No UI or network dependencies. */
(function(root){'use strict';
const C={};
C.highlightColours=Object.freeze([
 {id:'yellow',name:'Yellow',hex:'#fff176'}, {id:'green',name:'Green',hex:'#a5d6a7'},
 {id:'cyan',name:'Cyan',hex:'#80deea'}, {id:'blue',name:'Blue',hex:'#90caf9'},
 {id:'purple',name:'Purple',hex:'#ce93d8'}, {id:'pink',name:'Pink',hex:'#f48fb1'},
 {id:'orange',name:'Orange',hex:'#ffcc80'}, {id:'red',name:'Red',hex:'#ef9a9a'}
].map(c=>Object.freeze(c)));
C.highlightColour=id=>C.highlightColours.find(c=>c.id===id)||C.highlightColours[0];
C.themes=Object.freeze([
 {id:'midnight',name:'Midnight',background:'#0b121f',panel:'#131e30',accent:'#69ead2',light:false},
 {id:'ocean',name:'Ocean',background:'#071c2c',panel:'#102d43',accent:'#73d7ff',light:false},
 {id:'forest',name:'Forest',background:'#0c1d16',panel:'#172e22',accent:'#9ce2af',light:false},
 {id:'amethyst',name:'Amethyst',background:'#1a1229',panel:'#2a2040',accent:'#d2b0ff',light:false},
 {id:'burgundy',name:'Burgundy',background:'#25131d',panel:'#3b2230',accent:'#ffb4ca',light:false},
 {id:'slate',name:'Slate',background:'#161c24',panel:'#252f3b',accent:'#b4d3f4',light:false},
 {id:'daylight',name:'Daylight',background:'#f3f6fa',panel:'#ffffff',accent:'#076b62',light:true},
 {id:'paper',name:'Warm paper',background:'#f8f2e7',panel:'#fffdf7',accent:'#77501b',light:true}
].map(t=>Object.freeze(t)));
C.defaultPreferences=()=>({language:'en',highlighterColour:'yellow',theme:'midnight',readingVoice:'',speechRate:1,soundEffects:true});
C.validatePreferences=value=>{
 if(value!==undefined&&(!value||typeof value!=='object'||Array.isArray(value)))throw Error('Invalid profile settings.');
 const s={...C.defaultPreferences(),...value};
 // Retain the previously active voice when upgrading a 2.3.12 profile or backup.
 if(value&&value.readingVoice===undefined)s.readingVoice=value.voiceGender==='male'?(value.maleVoice??''):(value.femaleVoice??'');
 delete s.voiceGender;delete s.femaleVoice;delete s.maleVoice;
 if(!C.themes.some(t=>t.id===s.theme))throw Error('Invalid colour theme.');
 if(!C.highlightColours.some(c=>c.id===s.highlighterColour))throw Error('Invalid highlighter colour.');
 if(typeof s.readingVoice!=='string'||s.readingVoice.length>512||/[\u0000-\u001f]/.test(s.readingVoice))throw Error('Invalid saved reading voice.');
 if(typeof s.speechRate!=='number'||!Number.isFinite(s.speechRate)||s.speechRate<0.5||s.speechRate>2)throw Error('Reading speed must be between 0.5 and 2.0.');
 if(typeof s.soundEffects!=='boolean')throw Error('Invalid sound effects setting.');
 return s;
};
C.fresh=()=>({schema:2,app:'Maplewave',bank:'ISED Basic 2025-07-15',attempts:[],completed:[],notes:{},personalNotes:[],personalNoteDraft:null,exercises:{},labs:{},labChecks:{},highlights:[],active:null,settings:C.defaultPreferences()});
C.shuffle=(items,rng=Math.random)=>{const a=items.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
C.exam=(bank,rng=Math.random)=>{const groups={};bank.forEach(q=>(groups[q.topic]||(groups[q.topic]=[])).push(q));const keys=Object.keys(groups).sort();if(keys.length!==100)throw Error('The Basic bank must contain 100 topic groups.');return C.shuffle(keys.map(k=>groups[k][Math.floor(rng()*groups[k].length)]),rng);};
C.pool=(bank,chapter)=>chapter==='exam-ready'?bank:bank.filter(q=>q.chapter===chapter);
C.completedTest=(bank,completed,rng=Math.random)=>{
 const ids=[...new Set(completed)];if(!ids.length)throw Error('Mark a chapter complete in Learn before starting this test.');
 const selected=[],used=new Set();
 // Core chapter pools are disjoint. Draw cumulative review last to avoid duplicates.
 for(const id of [...ids.filter(id=>id!=='exam-ready'),...ids.filter(id=>id==='exam-ready')]){
  const available=C.pool(bank,id).filter(q=>!used.has(q.id));
  if(available.length<8)throw Error('There are not enough questions for eight per completed chapter.');
  for(const q of C.shuffle(available,rng).slice(0,8)){selected.push(q);used.add(q.id);}
 }
 return C.shuffle(selected,rng);
};
C.teachingFor=(course,q)=>{const guide=course.questionGuides&&course.questionGuides[q.id];if(!guide)return null;const chapter=course.chapters.find(c=>c.id===guide.chapterId),lesson=chapter&&chapter.lessons.find(l=>l.id===guide.lessonId);if(!lesson||!Array.isArray(lesson.questionIds)||!lesson.questionIds.includes(q.id))return null;return {chapter,lesson,selectionKind:guide.selectionKind,explanation:guide.explanation||lesson.teachingSummary};};
C.uuid=()=>Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,11);
C.noteContent=(title,body)=>{if(typeof title!=='string'||!title.trim())throw Error('Enter a title before saving your note.');if(title.length>200)throw Error('A note title can have up to 200 characters.');if(typeof body!=='string'||body.length>100000)throw Error('A note can have up to 100,000 characters.');return {title:title.trim(),body};};
C.personalNote=(title,body,previous=null)=>{const content=C.noteContent(title,body),now=new Date().toISOString();return {id:previous?previous.id:C.uuid(),...content,createdAt:previous?previous.createdAt:now,updatedAt:now};};
C.session=(questions,scope,title,mode='test',rng=Math.random)=>({id:C.uuid(),scope,title,mode,startedAt:new Date().toISOString(),questions:questions.map(q=>({id:q.id,order:C.shuffle([0,1,2,3],rng)})),answers:questions.map(()=>null),flags:questions.map(()=>false),checked:questions.map(()=>false),current:0});
C.grade=(s,byId)=>{const answers=s.questions.map((q,i)=>({id:q.id,order:q.order.slice(),selected:s.answers[i],correct:s.answers[i]!==null&&q.order[s.answers[i]]===0}));const score=answers.filter(a=>a.correct).length;return {id:s.id,scope:s.scope,title:s.title,mode:s.mode,startedAt:s.startedAt,finishedAt:new Date().toISOString(),score,total:answers.length,percent:score/answers.length*100,answers};};
C.latestAnswers=attempts=>{const answers={};attempts.slice().sort((a,b)=>a.finishedAt.localeCompare(b.finishedAt)).forEach(a=>a.answers.forEach(q=>answers[q.id]=q));return answers;};
C.weak=(bank,attempts)=>{const latest=C.latestAnswers(attempts);return bank.filter(q=>latest[q.id]&&!latest[q.id].correct);};
C.summary=(attempts,scope)=>{const a=attempts.filter(x=>!scope||x.scope===scope).slice().sort((a,b)=>a.finishedAt.localeCompare(b.finishedAt));return {count:a.length,best:a.length?Math.max(...a.map(x=>x.percent)):null,last:a.length?a[a.length-1]:null,previous:a.length>1?a[a.length-2]:null,attempts:a};};
C.validateHighlights=(value=[])=>{
 if(!Array.isArray(value)||value.length>5000)throw Error('Invalid lesson highlights.');
 const ids=new Set();
 for(const h of value){
  if(!h||typeof h.id!=='string'||!h.id||h.id.length>100||ids.has(h.id)||typeof h.chapterId!=='string'||!h.chapterId||h.chapterId.length>100||typeof h.lessonId!=='string'||!h.lessonId||h.lessonId.length>100||!Number.isInteger(h.start)||!Number.isInteger(h.end)||h.start<0||h.end<=h.start||h.end>2000000||typeof h.text!=='string'||!h.text.trim()||h.text.length!==h.end-h.start||h.text.length>100000||!Number.isFinite(Date.parse(h.createdAt)))throw Error('Invalid lesson highlight.');
  ids.add(h.id);
  if(h.colour!==undefined&&!C.highlightColours.some(c=>c.id===h.colour))throw Error('Invalid lesson highlight colour.');
 }
 return value;
};
C.mergeHighlights=(current=[],incoming=[])=>{
 C.validateHighlights(current);C.validateHighlights(incoming);
 const ids=new Map([...incoming,...current].map(h=>[h.id,h])),anchors=new Map();
 for(const h of ids.values())anchors.set(JSON.stringify([h.chapterId,h.lessonId,h.start,h.end,h.text]),h);
 return C.validateHighlights([...anchors.values()]);
};
// Use the same checked anchors for drawing, recolouring and removing marks.
C.resolveHighlight=(h,text)=>{
 let start=h.start,end=h.end;
 if(text.slice(start,end)!==h.text){start=text.indexOf(h.text);if(start<0||text.indexOf(h.text,start+1)>=0)return null;end=start+h.text.length;}
 return {start,end};
};
C.highlightedRanges=(highlights,target)=>{
 const ranges=[];
 for(const h of highlights){
  if(h.chapterId!==target.chapterId||h.lessonId!==target.lessonId)continue;
  const anchor=C.resolveHighlight(h,target.text);if(!anchor)continue;
  for(const r of target.ranges){const start=Math.max(r.start,anchor.start),end=Math.min(r.end,anchor.end);if(end>start)ranges.push({start,end});}
 }
 ranges.sort((a,b)=>a.start-b.start||a.end-b.end);const merged=[];
 for(const r of ranges){const last=merged[merged.length-1];if(last&&r.start<=last.end)last.end=Math.max(last.end,r.end);else merged.push({...r});}
 return merged.filter(r=>target.text.slice(r.start,r.end).trim());
};
C.editHighlights=(previous,target,colour=null)=>{
 C.validateHighlights(previous);
 if(colour!==null&&!C.highlightColours.some(c=>c.id===colour))throw Error('Invalid lesson highlight colour.');
 const selected=C.highlightedRanges(previous,target);if(!selected.length)return previous;
 const next=[];
 for(const h of previous){
  if(h.chapterId!==target.chapterId||h.lessonId!==target.lessonId){next.push(h);continue;}
  const anchor=C.resolveHighlight(h,target.text);
  if(!anchor||!selected.some(r=>r.start<anchor.end&&r.end>anchor.start)){next.push(h);continue;}
  let pieces=[anchor];
  // Subtract from every saved layer so an older colour cannot reappear underneath.
  for(const r of selected)pieces=pieces.flatMap(p=>r.end<=p.start||r.start>=p.end?[p]:[{start:p.start,end:Math.min(r.start,p.end)},{start:Math.max(r.end,p.start),end:p.end}].filter(x=>x.end>x.start));
  let first=true;
  for(const p of pieces){const text=target.text.slice(p.start,p.end);if(!text.trim())continue;next.push({...h,...p,text,id:first?h.id:C.uuid()});first=false;}
 }
 if(colour!==null){const createdAt=new Date().toISOString();for(const r of selected)next.push({id:C.uuid(),chapterId:target.chapterId,lessonId:target.lessonId,...r,text:target.text.slice(r.start,r.end),createdAt,colour});}
 return C.validateHighlights(next);
};
C.validate=(d,byId)=>{
 if(!d||d.schema!==2||d.app!=='Maplewave'||d.bank!=='ISED Basic 2025-07-15'||!Array.isArray(d.attempts)||!Array.isArray(d.completed)||!d.notes||typeof d.notes!=='object'||Array.isArray(d.notes)||!d.labs||typeof d.labs!=='object')throw Error('This is not a compatible Maplewave 2 backup.');
 const ids=new Set();
 for(const a of d.attempts){
  if(!a||typeof a.id!=='string'||a.id.length>100||ids.has(a.id)||typeof a.scope!=='string'||typeof a.title!=='string'||a.title.length>200||!Number.isFinite(Date.parse(a.startedAt))||!Number.isFinite(Date.parse(a.finishedAt))||!Array.isArray(a.answers)||a.answers.length<1||a.answers.length>984)throw Error('The backup contains an invalid attempt.');
  ids.add(a.id);let score=0;const seen=new Set();
  for(const q of a.answers){C.checkAnswer(q,byId);if(seen.has(q.id))throw Error('Duplicate question in attempt.');seen.add(q.id);q.correct=q.selected!==null&&q.order[q.selected]===0;if(q.correct)score++;}
  a.score=score;a.total=a.answers.length;a.percent=100*score/a.total;
 }
 if(d.completed.some(x=>typeof x!=='string'||x.length>100))throw Error('Invalid chapter progress.');
 for(const [key,value]of Object.entries(d.notes)){if(typeof value!=='string'||value.length>100000||key.length>100)throw Error('Invalid notes.');}
 const personalNotes=d.personalNotes===undefined?[]:d.personalNotes,noteIds=new Set();
 if(!Array.isArray(personalNotes))throw Error('Invalid personal notes.');
 for(const n of personalNotes){if(!n||typeof n.id!=='string'||!n.id||n.id.length>100||noteIds.has(n.id)||!Number.isFinite(Date.parse(n.createdAt))||!Number.isFinite(Date.parse(n.updatedAt)))throw Error('Invalid personal note.');C.noteContent(n.title,n.body);noteIds.add(n.id);}
 const draft=d.personalNoteDraft===undefined?null:d.personalNoteDraft;
 if(draft!==null&&(!draft||typeof draft!=='object'||Array.isArray(draft)||(draft.id!==null&&!noteIds.has(draft.id))||typeof draft.title!=='string'||draft.title.length>200||typeof draft.body!=='string'||draft.body.length>100000))throw Error('Invalid personal note draft.');
 if(d.active){const a=d.active;if(!Array.isArray(a.questions)||!Array.isArray(a.answers)||!Array.isArray(a.checked)||!Array.isArray(a.flags)||a.questions.length<1||a.questions.length>100||a.answers.length!==a.questions.length||a.checked.length!==a.questions.length||a.flags.length!==a.questions.length||!Number.isInteger(a.current)||a.current<0||a.current>=a.questions.length||typeof a.scope!=='string'||typeof a.title!=='string'||!['test','study'].includes(a.mode))throw Error('Invalid unfinished test.');a.questions.forEach((q,i)=>C.checkAnswer({...q,selected:a.answers[i]},byId));}
 const highlights=C.validateHighlights(d.highlights===undefined?[]:d.highlights);const base=C.fresh(),settings=C.validatePreferences(d.settings);return {...base,...d,personalNotes,personalNoteDraft:draft,highlights,settings,exercises:d.exercises&&typeof d.exercises==='object'?d.exercises:{},labChecks:d.labChecks&&typeof d.labChecks==='object'?d.labChecks:{}};
};
C.checkAnswer=(q,byId)=>{if(!q||!byId[q.id]||!Array.isArray(q.order)||q.order.length!==4||new Set(q.order).size!==4||q.order.some(i=>!Number.isInteger(i)||i<0||i>3)||(q.selected!==null&&(!Number.isInteger(q.selected)||q.selected<0||q.selected>3)))throw Error('Invalid saved question or answer.');};
C.merge=(current,incoming,byId)=>{const data=C.validate(incoming,byId);const merged={...current,highlights:C.mergeHighlights(current.highlights||[],data.highlights),attempts:Array.from(new Map([...data.attempts,...current.attempts].map(a=>[a.id,a])).values()).sort((a,b)=>a.finishedAt.localeCompare(b.finishedAt)),completed:[...new Set([...current.completed,...data.completed])],notes:{...data.notes,...current.notes},personalNotes:Array.from(new Map([...data.personalNotes,...(current.personalNotes||[])].map(n=>[n.id,n])).values()),personalNoteDraft:current.personalNoteDraft||data.personalNoteDraft,exercises:{...data.exercises,...current.exercises},labChecks:{...data.labChecks,...current.labChecks},active:current.active||data.active};return C.validate(merged,byId);};
// Complex impedance: real/imaginary parts, ohms. All external lab units are MHz, m, µH and pF.
C.add=(a,b)=>[a[0]+b[0],a[1]+b[1]];
C.inv=a=>{const d=a[0]*a[0]+a[1]*a[1];return d<1e-24?[1e15,0]:[a[0]/d,-a[1]/d];};
C.parallel=(a,b)=>C.inv(C.add(C.inv(a),C.inv(b)));
C.swr=(z,z0=50)=>{const g2=((z[0]-z0)**2+z[1]**2)/((z[0]+z0)**2+z[1]**2);const g=Math.min(.999999999,Math.sqrt(Math.max(0,g2)));return (1+g)/(1-g);};
C.antenna=(f,length,r=50)=>{const f0=143/length;return [r,6*r*(f/f0-f0/f)];};
C.network=(f,z,L,Cp,kind)=>{const w=2*Math.PI*f*1e6;const zl=[0,w*L*1e-6],zc=[0,Cp>0?-1/(w*Cp*1e-12):-1e15];if(kind==='bypass')return z;
 if(kind==='series-l')return C.add(z,zl);if(kind==='series-c')return C.add(z,zc);
 if(kind==='lowpass-load')return C.add(zl,Cp>0?C.parallel(z,zc):z);
 if(kind==='lowpass-source')return Cp>0?C.parallel(C.add(z,zl),zc):C.add(z,zl);
 if(kind==='highpass-load')return C.add(zc,C.parallel(z,zl));
 if(kind==='highpass-source')return C.parallel(C.add(z,zc),zl);
 return z;
};
C.match=(f,z)=>{
 // Solve both L-network placements and both signs of reactance; choose a realizable L/C pair.
 const r=z[0],x=z[1],w=2*Math.PI*f*1e6,candidates=[];
 const add=(xs,b,side)=>{if(xs>0&&b>0)candidates.push({kind:'lowpass-'+side,L:xs/w*1e6,C:b/w*1e12});if(xs<0&&b<0)candidates.push({kind:'highpass-'+side,L:-1/(w*b)*1e6,C:-1/(w*xs)*1e12});};
 if(r<=50){const k=Math.sqrt(Math.max(0,50*r-r*r));for(const v of [k,-k])add(v-x,v/(50*r),'source');}
 const y=C.inv(z),g=y[0];if(g>0&&1/g>=50){const k=Math.sqrt(Math.max(0,g/50-g*g));for(const v of [k,-k])add(v*50/g,v-y[1],'load');}
 candidates.sort((a,b)=>a.L-b.L);return candidates.find(a=>a.L>=0&&a.L<=30&&a.C>0&&a.C<=10000)||null;
};
C.lcFrequency=(L,Cp)=>1/(2*Math.PI*Math.sqrt(L*1e-6*Cp*1e-12))/1e6;
root.RadioCore=C;if(typeof module!=='undefined')module.exports=C;
})(typeof window!=='undefined'?window:globalThis);
