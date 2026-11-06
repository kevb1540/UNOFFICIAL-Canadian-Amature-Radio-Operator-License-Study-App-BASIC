// ©️ Kevin W. Brown 2026
(function(root){'use strict';
class Effects{
 constructor(enabled){this.enabled=enabled;this.current=null;this.complete=null;document.addEventListener('visibilitychange',()=>{if(document.hidden)this.stop();});root.addEventListener('pagehide',()=>this.stop());}
 stop(){if(this.current){this.current.pause();this.current.currentTime=0;this.current=null;}if(this.complete)this.complete();}
 // Resolve on completion, interruption or failure so logout/quit never gets stuck.
 play(name,enabled=this.enabled()){this.stop();if(!enabled||document.hidden||!['first-welcome','welcome','correct','incorrect','test-pass','farewell','oops'].includes(name))return Promise.resolve();return new Promise(resolve=>{let timer;const done=()=>{clearTimeout(timer);if(this.complete===done){this.current=null;this.complete=null;}resolve();};try{const sound=new Audio('sounds/'+name+'.mp3');this.current=sound;this.complete=done;sound.addEventListener('ended',done,{once:true});sound.addEventListener('error',done,{once:true});timer=setTimeout(()=>{if(this.current===sound)this.stop();else done();},15000);sound.play()?.catch(done);}catch(e){done();}});}
}
root.RadioSoundEffects={Effects};
})(window);
