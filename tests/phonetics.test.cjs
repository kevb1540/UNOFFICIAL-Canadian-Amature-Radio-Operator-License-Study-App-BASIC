const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
test('Phonetics playback interrupts audio, handles failures, spells call signs and grades ten questions once',()=>{
const nodes={},events={},audios=[];const node=id=>nodes[id]??=( {textContent:'',innerHTML:'',value:'',insertAdjacentHTML(_,html){this.innerHTML+=html;}} );
class Audio{constructor(url){this.url=url;this.currentTime=0;audios.push(this);}play(){return Promise.resolve();}pause(){this.paused=true;}}
const document={hidden:false,getElementById:node,querySelectorAll:()=>[],addEventListener:(e,f)=>events[e]=f};const window={addEventListener:()=>{},stopSoundEffects(){},stopLessonReading(){}};
vm.runInNewContext(fs.readFileSync(__dirname+'/../app/src/main/assets/phonetics.js','utf8'),{window,document,Audio});const p=window.RadioPhonetics;
assert.equal((p.page().match(/data-action="phonetic-play"/g)||[]).length,26);
p.action('play',{letter:'A'});assert.equal(audios.at(-1).url,'sounds/phonetics/A.wav');p.action('play',{letter:'Z'});assert.equal(audios[0].paused,true);audios.at(-1).onerror();assert.match(node('phonetic-status').textContent,/Could not play/);
node('phonetic-text').value='VE3 CAT';p.action('spell',{});assert.equal(node('phonetic-spelling').textContent,'Victor · Echo · 3 · Charlie · Alfa · Tango');p.stop();assert.equal(audios.at(-1).paused,true);
p.action('start',{});for(let i=0;i<10;i++){const letter=audios.at(-1).url.match(/\/([A-Z])\.wav/)[1],answer=letter.charCodeAt(0)-65;p.action('answer',{index:String(answer)});assert.match(node('phonetic-feedback').textContent,/Correct/);p.action('answer',{index:String(answer)});p.action('next',{});}assert.match(node('phonetic-quiz').innerHTML,/10\/10/);
p.action('all',{});document.hidden=true;events.visibilitychange();assert.equal(audios.at(-1).paused,true);
});
