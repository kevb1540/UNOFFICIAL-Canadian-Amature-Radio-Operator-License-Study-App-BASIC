// ©️ Kevin W. Brown 2026
/* Text anchors stay independent of marks, answer visibility and action-button labels. */
(function(root){'use strict';
function textNodes(lesson){
 const nodes=[],walker=document.createTreeWalker(lesson,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement&&!n.parentElement.closest('button,input,textarea,select,script,style')?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT});
 let node;while((node=walker.nextNode()))nodes.push(node);return nodes;
}
class Controller{
 constructor(hooks){
  this.h=hooks;this.pending=null;this.busy=false;this.colourBusy=false;
  this.menu=document.createElement('div');this.menu.id='lesson-highlight-menu';this.menu.hidden=true;this.menu.setAttribute('role','toolbar');this.menu.setAttribute('aria-label','Lesson text selection');
  const button=document.createElement('button');button.type='button';button.textContent='Highlight';button.id='highlight-selected-lesson';this.menu.append(button);this.highlightButton=button;
  const colours=document.createElement('button');colours.type='button';colours.textContent='Highlighter Colour';colours.id='choose-highlighter-colour';colours.setAttribute('aria-haspopup','dialog');colours.setAttribute('aria-controls','highlighter-colour-dialog');this.menu.append(colours);
  const remove=document.createElement('button');remove.type='button';remove.textContent='Remove Highlight';remove.id='remove-selected-highlight';remove.hidden=true;this.menu.append(remove);this.removeButton=remove;
  remove.addEventListener('pointerdown',e=>e.preventDefault());remove.addEventListener('mousedown',e=>e.preventDefault());remove.addEventListener('click',()=>this.removeSelection());
  const read=document.createElement('button');read.type='button';read.id='read-selected-lesson';read.textContent='Read from here';this.menu.append(read);document.body.append(this.menu);
  read.addEventListener('pointerdown',e=>e.preventDefault());read.addEventListener('mousedown',e=>e.preventDefault());read.addEventListener('click',()=>this.readSelection());
  this.palette=document.createElement('dialog');this.palette.id='highlighter-colour-dialog';this.palette.setAttribute('aria-labelledby','highlighter-colour-title');
  this.palette.innerHTML='<div class="row between"><h2 id="highlighter-colour-title">Highlighter Colour</h2><button type="button" class="btn ghost" id="close-highlighter-colours">Close ×</button></div><p>Choose the colour for the next text you highlight.</p><div class="highlighter-colour-grid" role="group" aria-label="Eight highlighter colours"></div><p class="helper">Your colour choice is saved with your user profile.</p>';
  for(const colour of RadioCore.highlightColours){const swatch=document.createElement('button');swatch.type='button';swatch.className='highlighter-colour-option';swatch.dataset.colour=colour.id;swatch.setAttribute('aria-label',colour.name);const dot=document.createElement('span');dot.className='highlighter-colour-dot';dot.style.backgroundColor=colour.hex;dot.setAttribute('aria-hidden','true');swatch.append(dot,document.createTextNode(colour.name));swatch.addEventListener('click',()=>this.chooseColour(colour.id));this.palette.querySelector('.highlighter-colour-grid').append(swatch);}
  document.body.append(this.palette);this.palette.querySelector('#close-highlighter-colours').addEventListener('click',()=>this.closeColours());
  this.palette.addEventListener('close',()=>{if(!this.palette.open){this.colourTarget=null;this.colourIdentity=null;}});
  button.addEventListener('pointerdown',e=>e.preventDefault());button.addEventListener('mousedown',e=>e.preventDefault());button.addEventListener('click',()=>this.saveSelection());
  colours.addEventListener('pointerdown',e=>e.preventDefault());colours.addEventListener('mousedown',e=>e.preventDefault());colours.addEventListener('click',()=>this.openColours());
  document.addEventListener('selectionchange',()=>this.updateMenu());
  document.addEventListener('scroll',()=>this.updateMenu(),true);root.addEventListener('resize',()=>this.updateMenu());
  root.lessonHighlightSelection=()=>this.capture();
  root.lessonHighlightSelectionState=()=>{const available=this.capture();return {available,highlighted:available&&this.hasHighlights(this.pending)};};
  root.clearLessonHighlightSelection=()=>this.reset();
  root.highlightLessonSelection=()=>{const target=this.snapshot()||this.pending;if(!this.usable(target)||this.busy||this.colourBusy||document.querySelector('dialog[open]'))return false;this.saveSelection(target);return true;};
  root.openLessonHighlighterColours=()=>this.openColours();
  root.removeLessonHighlightSelection=()=>this.removeSelection();
  root.readLessonFromSelection=()=>this.readSelection();
 }
 readSelection(){if(document.querySelector('dialog[open]'))return false;const target=this.snapshot()||this.pending;if(!this.usable(target)||this.busy)return false;const read=!!this.h.readFromHere?.(target);if(read)this.reset();return read;}
 currentColour(){return RadioCore.highlightColour(this.h.state().settings?.highlighterColour);}
 editTarget(target){return {...target,text:textNodes(target.lesson).map(n=>n.data).join('')};}
 hasHighlights(target){return this.usable(target)&&RadioCore.highlightedRanges(this.h.state().highlights||[],this.editTarget(target)).length>0;}
 updateColours(){const current=this.currentColour();for(const button of this.palette.querySelectorAll('[data-colour]')){button.setAttribute('aria-pressed',String(button.dataset.colour===current.id));button.disabled=this.colourBusy;}this.highlightButton.style.backgroundColor=current.hex;this.highlightButton.title='Highlight in '+current.name;}
 openColours(){const target=this.snapshot()||this.pending;if(!this.usable(target)||this.busy||this.colourBusy)return false;this.colourIdentity=target.identity;this.colourTarget=target;this.menu.hidden=true;this.palette.querySelector(':scope > p').textContent=this.hasHighlights(target)?'Choose a colour for the selected highlighted text and future highlights.':'Choose the colour for the next text you highlight.';this.updateColours();if(!this.palette.open)this.palette.showModal();this.palette.querySelector('[aria-pressed="true"]').focus();return true;}
 closeColours(){if(!this.palette.open)return false;this.palette.close();this.colourIdentity=null;this.colourTarget=null;return true;}
 async chooseColour(id){
  if(this.colourBusy||!RadioCore.highlightColours.some(c=>c.id===id)||!this.h.identity()||this.colourIdentity!==this.h.identity())return false;
  const progress=this.h.state(),identity=this.h.identity(),previous=progress.settings.highlighterColour,marks=progress.highlights||[],target=this.colourTarget,recolour=this.hasHighlights(target);
  if(this.currentColour().id===id&&!recolour){this.closeColours();return true;}
  let next=marks;try{if(recolour)next=RadioCore.editHighlights(marks,this.editTarget(target),id);}catch(e){this.h.notice('Could not change this highlight. Select a shorter passage or export your progress.');return false;}
  this.colourBusy=true;progress.settings.highlighterColour=id;progress.highlights=next;this.updateColours();
  try{if(!await this.h.save())throw Error('Colour could not be saved.');if(this.h.state()===progress&&this.h.identity()===identity){this.closeColours();if(recolour){this.renderAll();root.getSelection()?.removeAllRanges();}this.h.notice(recolour?'Highlight colour changed to '+this.currentColour().name+'.':'Highlighter colour: '+this.currentColour().name+'. Select text and choose Highlight.');}return true;}
  catch(e){progress.highlights=marks;if(previous===undefined)delete progress.settings.highlighterColour;else progress.settings.highlighterColour=previous;if(this.h.state()===progress&&this.h.identity()===identity)this.h.notice('Highlighter colour could not be saved. Try again.');return false;}
  finally{this.colourBusy=false;this.updateColours();}
 }
 reset(){this.pending=null;this.menu.hidden=true;this.notifyNative(false);}
 notifyNative(valid){const highlighted=valid&&this.hasHighlights(this.pending),key=valid+':'+highlighted;if(this.nativeAvailable===key)return;this.nativeAvailable=key;if(typeof root.AndroidApp?.lessonHighlightSelectionStateChanged==='function')root.AndroidApp.lessonHighlightSelectionStateChanged(valid,highlighted);else if(typeof root.AndroidApp?.lessonHighlightSelectionChanged==='function')root.AndroidApp.lessonHighlightSelectionChanged(valid);}
 usable(target){return !!target&&!!this.h.identity()&&target.identity===this.h.identity()&&target.lesson.isConnected&&target.lesson.dataset.chapterId===target.chapterId&&target.lesson.dataset.lessonId===target.lessonId;}
 snapshot(){
  const identity=this.h.identity(),selection=root.getSelection();if(!identity||!selection||selection.isCollapsed||selection.rangeCount!==1||document.querySelector('dialog[open]'))return null;
  const range=selection.getRangeAt(0),element=n=>n.nodeType===Node.ELEMENT_NODE?n:n.parentElement,lesson=element(range.startContainer)?.closest('.lesson');
  if(!lesson||lesson!==element(range.endContainer)?.closest('.lesson')||!lesson.dataset.chapterId||!lesson.dataset.lessonId)return null;
  const chunks=[];let offset=0;
  for(const node of textNodes(lesson)){
   const size=node.data.length,base=offset;offset+=size;
   if(!size||node.parentElement.closest('[hidden]')||!range.intersectsNode(node)||range.comparePoint(node,size)<0||range.comparePoint(node,0)>0)continue;
   const start=range.startContainer===node?range.startOffset:0,end=range.endContainer===node?range.endOffset:size;
   if(end<=start||!node.data.slice(start,end).trim())continue;
   const last=chunks[chunks.length-1],text=node.data.slice(start,end);
   if(last&&last.end===base+start){last.end=base+end;last.text+=text;}else chunks.push({start:base+start,end:base+end,text});
  }
  if(!chunks.length)return null;
  return {identity,lesson,chapterId:lesson.dataset.chapterId,lessonId:lesson.dataset.lessonId,ranges:chunks,rect:range.getBoundingClientRect()};
 }
 capture(){this.pending=this.busy||this.colourBusy?null:this.snapshot();if(this.pending)this.h.selectionChanged?.(this.pending);return !!this.pending;}
 updateMenu(){
  this.updateColours();
  const valid=this.capture();this.removeButton.hidden=!valid||!this.hasHighlights(this.pending);this.notifyNative(valid);if(!valid||typeof root.AndroidApp?.lessonHighlightMenu==='function'){this.menu.hidden=true;return;}
  const rect=this.pending.rect;if(rect.bottom<78||rect.top>innerHeight-65){this.menu.hidden=true;return;}
  this.menu.hidden=false;const box=this.menu.getBoundingClientRect();
  this.menu.style.left=Math.max(8,Math.min(innerWidth-box.width-8,rect.left))+'px';
  this.menu.style.top=Math.max(82,Math.min(innerHeight-box.height-85,rect.bottom+8))+'px';
 }
 async saveSelection(target=this.snapshot()||this.pending){
  if(this.busy||this.colourBusy||!this.usable(target)||document.querySelector('dialog[open]'))return false;
  const progress=this.h.state(),previous=progress.highlights||[],now=new Date().toISOString(),colour=this.currentColour().id;
  const key=h=>JSON.stringify([h.chapterId,h.lessonId,h.start,h.end,h.text]);
  const previousByAnchor=new Map(previous.map(h=>[key(h),h]));
  const added=target.ranges.map(h=>({id:RadioCore.uuid(),chapterId:target.chapterId,lessonId:target.lessonId,start:h.start,end:h.end,text:h.text,createdAt:now,colour})).filter(h=>{const old=previousByAnchor.get(key(h));return !old||RadioCore.highlightColour(old.colour).id!==colour;});
  if(!added.length){this.reset();root.getSelection()?.removeAllRanges();this.h.notice('Already highlighted');return true;}
  const replacing=new Set(added.map(key));
  let next;try{next=RadioCore.mergeHighlights(added,previous.filter(h=>!replacing.has(key(h))));}catch(e){this.h.notice('Could not save this highlight. Select a shorter passage or export your progress.');return false;}
  this.busy=true;progress.highlights=next;this.menu.hidden=true;
  try{
   if(!await this.h.save())throw Error('Highlight could not be saved.');
   if(this.h.state()===progress&&this.h.identity()===target.identity){this.renderAll();root.getSelection()?.removeAllRanges();this.h.notice('Highlight saved');}
   return true;
  }catch(e){
   progress.highlights=previous;
   if(this.h.state()===progress&&this.h.identity()===target.identity)this.h.notice('Highlight could not be saved. Your previous highlights are unchanged.');
   return false;
  }finally{this.busy=false;this.reset();}
 }
 removeSelection(){
  if(document.querySelector('dialog[open]'))return false;
  const target=this.snapshot()||this.pending;if(this.busy||this.colourBusy||!this.hasHighlights(target))return false;
  this.removeSavedSelection(target);return true;
 }
 async removeSavedSelection(target){
  const progress=this.h.state(),previous=progress.highlights||[];let next;
  try{next=RadioCore.editHighlights(previous,this.editTarget(target));}catch(e){this.h.notice('Could not remove this highlight. Select a shorter passage or export your progress.');return false;}
  this.busy=true;progress.highlights=next;this.menu.hidden=true;
  try{if(!await this.h.save())throw Error('Highlight could not be saved.');if(this.h.state()===progress&&this.h.identity()===target.identity){this.renderAll();root.getSelection()?.removeAllRanges();this.h.notice('Highlight removed');}return true;}
  catch(e){progress.highlights=previous;if(this.h.state()===progress&&this.h.identity()===target.identity)this.h.notice('Highlight could not be removed. Your previous highlights are unchanged.');return false;}
  finally{this.busy=false;this.reset();}
 }
 renderAll(){
  this.reset();this.closeColours();if(!this.h.identity())return;
  for(const lesson of document.querySelectorAll('main .lesson'))this.paint(lesson);
  document.dispatchEvent(new Event('lesson-highlights-rendered'));
 }
 paint(lesson){
  for(const mark of lesson.querySelectorAll('mark.lesson-highlight'))mark.replaceWith(...mark.childNodes);
  lesson.normalize();const nodes=textNodes(lesson),text=nodes.map(n=>n.data).join(''),ranges=[];
  let order=0;for(const h of this.h.state().highlights||[]){
   if(h.chapterId!==lesson.dataset.chapterId||h.lessonId!==lesson.dataset.lessonId)continue;
   const anchor=RadioCore.resolveHighlight(h,text);if(!anchor)continue;const {start,end}=anchor;
   ranges.push({start,end,colour:RadioCore.highlightColour(h.colour),when:Date.parse(h.createdAt),order:order++});
  }
  // Sweep text boundaries. The most recent saved mark wins only where ranges overlap.
  const events=ranges.flatMap(h=>[h.start,h.end]).sort((a,b)=>a-b),points=[...new Set(events)],starts=ranges.slice().sort((a,b)=>a.start-b.start),heap=[],merged=[];
  const newer=(a,b)=>a.when>b.when||(a.when===b.when&&a.order>b.order);
  const push=h=>{heap.push(h);let i=heap.length-1;while(i>0){const parent=(i-1)>>1;if(!newer(heap[i],heap[parent]))break;[heap[i],heap[parent]]=[heap[parent],heap[i]];i=parent;}};
  const pop=()=>{const last=heap.pop();if(!heap.length)return;heap[0]=last;let i=0;while(true){const left=2*i+1,right=left+1;let best=i;if(left<heap.length&&newer(heap[left],heap[best]))best=left;if(right<heap.length&&newer(heap[right],heap[best]))best=right;if(best===i)break;[heap[i],heap[best]]=[heap[best],heap[i]];i=best;}};
  let next=0;for(let i=0;i<points.length-1;i++){const start=points[i],end=points[i+1];while(next<starts.length&&starts[next].start<=start)push(starts[next++]);while(heap.length&&heap[0].end<=start)pop();if(!heap.length)continue;const colour=heap[0].colour,last=merged[merged.length-1];if(last&&last.end===start&&last.colour.id===colour.id)last.end=end;else merged.push({start,end,colour});}
  let offset=0;
  for(const node of nodes){
   const base=offset;offset+=node.data.length;
   const portions=merged.filter(h=>h.start<offset&&h.end>base).map(h=>({start:Math.max(0,h.start-base),end:Math.min(node.data.length,h.end-base),colour:h.colour})).reverse();
   for(const h of portions){node.splitText(h.end);const selected=node.splitText(h.start),mark=document.createElement('mark');mark.className='lesson-highlight';mark.dataset.colour=h.colour.id;mark.style.backgroundColor=h.colour.hex;mark.title=h.colour.name+' highlight';selected.replaceWith(mark);mark.append(selected);}
  }
 }
}
root.RadioHighlights={Controller};
})(window);
