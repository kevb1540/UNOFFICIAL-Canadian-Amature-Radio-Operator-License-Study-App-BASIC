const {test}=require('node:test'),assert=require('node:assert/strict');
const {Controller}=require('../app/src/main/assets/preferences.js');
global.document={querySelector:()=>null};
global.getSelection=()=>({removeAllRanges(){}});
const lesson={isConnected:true};
global.RadioNarration={Model:class{constructor(element){assert.equal(element,lesson);this.lesson=element;this.text='current repeat current. Contact';}wordFromSource(start,end){return start===15&&end===22?{start:15,end:22,text:'current'}:null;}}};
function fixture(){const c=Object.create(Controller.prototype);c.io={identity:()=> 'kevin'};c.session={paused:true,owner:'kevin',lessonId:'test',model:{lesson},text:'old text',mode:'boundary',lastWord:{start:0},chunks:[{start:0}],index:0};c.wordMarker={clear(){}};c.updateReadingUI=()=>{};c.cancelAudio=()=>{};c.plan=(text,at)=>[{text:text.slice(at),start:at}];c.speakChunk=()=>{c.spoken=c.session.chunks[0].text};return c;}
const target={identity:'kevin',lesson,ranges:[{start:15,end:22}]};
test('paused selection restarts at the exact source occurrence and clears the pending anchor',()=>{const c=fixture();assert.equal(c.selectPausedAnchor(target),true);assert.equal(c.spoken,undefined);c.pause('test');assert.equal(c.spoken,'current. Contact');assert.equal(c.session.resumeAnchor,null);});
test('playing, other-profile and other-lesson selections cannot change the paused resume point',()=>{const c=fixture();assert.equal(c.selectPausedAnchor({...target,identity:'other'}),false);assert.equal(c.selectPausedAnchor({...target,lesson:{isConnected:true}}),false);c.session.paused=false;assert.equal(c.selectPausedAnchor(target),false);});
test('without a selection resume keeps the paused word; invalidated anchors fall back to that word',()=>{const c=fixture();c.session.text='paused word';c.pause('test');assert.equal(c.spoken,'paused word');c.session.paused=true;c.session.resumeAnchor={start:999,end:1000};c.pause('test');assert.equal(c.spoken,'paused word');});
test('a new pause clears the previously selected starting point',()=>{const c=fixture();c.session.paused=false;c.session.resumeAnchor={start:15,end:22};c.pause('test');assert.equal(c.session.resumeAnchor,null);assert.equal(c.spoken,undefined);});
