// © Kevin W. Brown 2026 — optional, per-profile feature discovery hints.
(function(root){'use strict';
const hints={
 home:['Welcome to your study guide','Start with Chapters to learn one topic at a time. Your progress is saved to your profile.'],
 chapters:['Learn at your pace','Open a chapter, read the lessons, then mark it complete. Each chapter has exercises and a test.'],
 chapter:['Listen to lessons','Use the Read Aloud controls in a lesson. You can pause, change your voice in Settings, and return to any word.'],
 tts:['Jump to a word while listening','Double-tap a word in the lesson text to jump the reading to that word. When paused, double-tap the word, then press Play to resume there.'],
 highlights:['Highlight what matters','Long-press lesson text to highlight it. Choose from eight colours; your highlights stay saved to your profile.'],
 practice:['Practice with real questions','Try a chapter test or a full practice exam. You can review wrong answers and track your results.'],
 bank:['Check your answers','Tap the answer you think is correct. The question bank shows a green check or red X and reveals the correct answer.'],
 labs:['Try the interactive labs','Experiment with radio formulas and antenna concepts. Change values to see how the calculations respond.'],
 reference:['Explore formulas','Tap a formula for an explanation of its symbols, units and rearrangements.'],
 glossary:['Find radio terms','Search for an abbreviation, Q-code or radio term to see its meaning.'],
 notes:['Save personal notes','Write your own study notes. They are saved to your profile and included in backups.'],
 progress:['Watch your progress','Review test history, best scores and questions you missed to decide what to study next.'],
 settings:['Customize your app','Choose a voice, reading speed and theme. You can switch feature hints off here at any time.'],
 phonetics:['Learn the ITU alphabet','Use the Play controls to hear the phonetic alphabet, or choose Alphabet ONLY for the shorter version.']
};
class Hints{
 constructor(io){this.io=io;this.active=null;this.tour=[];this.timer=null;document.addEventListener('click',e=>{const b=e.target.closest('[data-hint-action]');if(!b)return;const action=b.dataset.hintAction;if(action==='next')this.dismiss();if(action==='tour')this.startTour();if(action==='close')this.dismiss();});document.addEventListener('change',e=>{if(e.target.id==='hint-disable-all'&&e.target.checked)this.disable();if(e.target.id==='hints-enabled')this.toggle(e.target.checked);});}
 get settings(){return this.io.state()?.settings;}
 ensure(){const s=this.settings;if(!s)return false;if(!Array.isArray(s.hintsSeen))s.hintsSeen=[];if(typeof s.hintsEnabled!=='boolean')s.hintsEnabled=true;return true;}
 async toggle(value){if(!this.ensure())return;this.settings.hintsEnabled=value;await this.io.save();if(!value)this.clear();}
 async disable(){await this.toggle(false);}
 clear(){clearTimeout(this.timer);document.getElementById('feature-hint-bubble')?.remove();this.active=null;this.tour=[];}
 seen(id){return this.settings?.hintsSeen?.includes(id);}
 show(id,force=false){if(!this.ensure()||!this.settings.hintsEnabled||!hints[id]||this.active||(!force&&this.seen(id)))return false;const [title,message]=hints[id];this.active=id;const el=document.createElement('aside');el.id='feature-hint-bubble';el.className='feature-hint-bubble';el.setAttribute('role','status');el.setAttribute('aria-label','Feature hint');const safe=t=>t.replace(/&/g,'&amp;').replace(/</g,'&lt;');el.innerHTML=`<div class="hint-title">💡 ${safe(title)}</div><p>${safe(message)}</p><div class="hint-actions"><label class="hint-disable"><input id="hint-disable-all" type="checkbox"> Don't show hints again</label><button type="button" data-hint-action="next">${this.tour.length?'Next ›':'Got it'}</button></div>`;document.body.appendChild(el);return true;}
 async dismiss(){if(!this.active)return;const id=this.active;document.getElementById('feature-hint-bubble')?.remove();this.active=null;if(!this.seen(id)){this.settings.hintsSeen.push(id);await this.io.save();}if(this.tour.length&&this.settings.hintsEnabled){const next=this.tour.shift();this.show(next,true);}}
 visit(page){if(this.active||this.tour.length)return;clearTimeout(this.timer);this.timer=setTimeout(()=>this.show(page),650);}
 tts(){if(this.active)return;this.show('tts');}
 startTour(){if(!this.ensure()||!this.settings.hintsEnabled)return;this.clear();this.tour=['chapters','tts','highlights','practice','bank','labs','reference','glossary','notes','progress','settings','phonetics'];this.show('home',true);}
 settingsHTML(){return `<div class="card"><h2>Feature hints</h2><label class="hint-setting"><input id="hints-enabled" type="checkbox" ${this.settings?.hintsEnabled!==false?'checked':''}> Show helpful feature hints</label><p class="helper">Hints appear once per feature for each profile. Each bubble has a checkbox to turn off all hints.</p><button type="button" data-hint-action="tour" ${this.settings?.hintsEnabled===false?'disabled':''}>Take the feature hints tour</button></div>`;}
}
root.RadioHints={Hints};
})(window);
