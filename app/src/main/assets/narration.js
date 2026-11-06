// ©️ Kevin W. Brown 2026
// Speech offsets map back to original lesson text, independently of saved marks.
(function(root){'use strict';
const excluded='button,input,textarea,select,script,style';
function textNodes(lesson){
 const result=[],walker=document.createTreeWalker(lesson,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement&&!n.parentElement.closest(excluded)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT});
 while(walker.nextNode())result.push(walker.currentNode);return result;
}
function visible(node,lesson,includeExamAnswers=false){
 const parent=node.parentElement;if(!parent)return false;
 // Only the exam answer's own collapsed wrapper is included in speech.
 // Other hidden content and closed details retain their normal visibility rules.
 const answer=includeExamAnswers?parent.closest('.exam-facts .teaching-example > .lesson-answer'):null;
 for(let hidden=parent.closest('[hidden]');hidden;hidden=hidden.parentElement?.closest('[hidden]'))if(hidden!==answer)return false;
 for(let element=parent;element;element=element.parentElement){
  if(element.matches('details:not([open])')&&!element.querySelector(':scope > summary')?.contains(node))return false;
  const style=getComputedStyle(element);if((style.display==='none'&&element!==answer)||style.visibility==='hidden'||style.visibility==='collapse')return false;if(element===lesson)break;
 }
 return true;
}
function words(text){
 const result=[],parts=[];
 if(root.Intl?.Segmenter)parts.push(...[...new Intl.Segmenter('en',{granularity:'word'}).segment(String(text))].filter(part=>part.isWordLike).map(part=>({start:part.index,end:part.index+part.segment.length,text:part.segment})));
 else{const expression=/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+|[.,]\p{N}+)*/gu;for(const match of String(text).matchAll(expression))parts.push({start:match.index,end:match.index+match[0].length,text:match[0]});}
 for(const word of parts){const previous=result[result.length-1];if(previous&&/^[-/]+$/.test(text.slice(previous.end,word.start))){previous.end=word.end;previous.text=text.slice(previous.start,word.end);}else result.push(word);}
 return result;
}
function wordAt(tokens,index,end=Infinity){
 return tokens.find(word=>word.end>index&&word.start<end)||null;
}
function wordPlans(text,start=0){
 const tokens=words(text).filter(word=>word.end>start);
 return tokens.map((word,i)=>{const end=tokens[i+1]?.start??text.length;return {text:text.slice(word.start,end).trimEnd(),start:word.start,end,word:true};});
}
function chunkPlans(text,start=0,limit=700){
 const result=[];let cursor=start;
 while(cursor<text.length){
  while(cursor<text.length&&/\s/.test(text[cursor]))cursor++;
  if(cursor===text.length)break;
  let end=Math.min(cursor+limit,text.length);
  if(end<text.length){
   const part=text.slice(cursor,end),boundary=Math.max(part.lastIndexOf('\n'),part.lastIndexOf('. ')+1,part.lastIndexOf('? ')+1,part.lastIndexOf('! ')+1);
   let cut=boundary>limit/3?boundary:part.lastIndexOf(' ');if(cut<limit/3)cut=limit;
   end=cursor+cut;const code=text.charCodeAt(end-1);if(code>=0xd800&&code<=0xdbff)end--;
  }
  const part=text.slice(cursor,end).trimEnd();if(part)result.push({text:part,start:cursor,end:cursor+part.length,word:false});cursor=end;
 }
 return result;
}
class Model{
 constructor(lesson){
  this.lesson=lesson;this.text='';this.sourceStarts=[];this.sourceEnds=[];
  let source=0,lastBlock=null;const spokenAnswers=new Set();
  const emit=(text,start,end)=>{for(let i=0;i<text.length;i++){this.text+=text[i];this.sourceStarts.push(start);this.sourceEnds.push(end);}};
  for(const node of textNodes(lesson)){
   const base=source;source+=node.data.length;if(!visible(node,lesson,true)||!node.data.length)continue;
   const block=node.parentElement.closest('p,h1,h2,h3,h4,h5,h6,li,td,th,figcaption,blockquote,summary')||lesson;
   if(this.text&&lastBlock!==block&&!/\s$/.test(this.text))emit('\n',base,base);
   lastBlock=block;
   const answer=node.parentElement.closest('.exam-facts .teaching-example .teaching-answer');
   if(answer){
    if(!spokenAnswers.has(answer)){emit('Answer. ',base,base);spokenAnswers.add(answer);}
    // Replace the ordinary visual label in speech; retain false-statement warnings.
    const label=answer.firstElementChild;
    if(label?.matches('strong')&&/^Correct answer:\s*$/i.test(label.textContent.trim())&&label.contains(node))continue;
   }
   for(let i=0;i<node.data.length;i++){
    const c=node.data[i],at=base+i;
    if(/\s/.test(c)){if(this.text&&!/\s$/.test(this.text))emit(' ',at,at+1);continue;}
    if(c==='Ω')emit('ohms',at,at+1);else if(c==='µ')emit('micro',at,at+1);else emit(c,at,at+1);
   }
  }
  const end=this.text.trimEnd().length;this.text=this.text.slice(0,end);this.sourceStarts.length=end;this.sourceEnds.length=end;
  this.words=words(this.text);
 }
 wordAt(start,end=Infinity){return wordAt(this.words,start,end);}
 wordFromSource(start,end){
  const index=this.sourceEnds.findIndex((sourceEnd,i)=>sourceEnd>start&&this.sourceStarts[i]<end);
  if(index<0)return null;const word=this.wordAt(index);
  if(!word||this.sourceStarts[word.start]>=end||this.sourceEnds[word.end-1]<=start)return null;
  return word;
 }
 wordAtPoint(x,y){
  if(!Number.isFinite(x)||!Number.isFinite(y)||!this.lesson.isConnected)return null;
  const caret=document.caretPositionFromPoint?.(x,y),range=caret?null:document.caretRangeFromPoint?.(x,y);
  const node=caret?.offsetNode||range?.startContainer,offset=caret?.offset??range?.startOffset;
  if(!node||node.nodeType!==Node.TEXT_NODE||!this.lesson.contains(node)||node.parentElement.closest(excluded)||!visible(node,this.lesson))return null;
  let base=0;for(const text of textNodes(this.lesson)){if(text===node)break;base+=text.length;}
  // A caret can land after the tapped glyph. Check both neighbouring characters,
  // then require the point to fall on that word rather than nearby blank space.
  for(const at of new Set([Math.min(offset,node.length-1),Math.max(0,offset-1)])){
   if(at<0)continue;const word=this.wordFromSource(base+at,base+at+1),wordRange=this.range(word);
   if(wordRange&&[...wordRange.getClientRects()].some(r=>r.width>0&&r.height>0&&x>=r.left-1&&x<=r.right+1&&y>=r.top-1&&y<=r.bottom+1))return word;
  }
  return null;
 }
 range(word){
  if(!word||!this.lesson.isConnected)return null;
  const start=this.sourceStarts[word.start],end=this.sourceEnds[word.end-1];if(start===undefined||end===undefined||end<=start)return null;
  const nodes=textNodes(this.lesson);let offset=0,first=null,last=null;
  for(const node of nodes){const next=offset+node.data.length;if(!first&&start<next)first={node,at:Math.max(0,start-offset)};if(first&&end<=next){last={node,at:end-offset};break;}offset=next;}
  if(!first||!last||!visible(first.node,this.lesson)||!visible(last.node,this.lesson))return null;
  const range=document.createRange();range.setStart(first.node,first.at);range.setEnd(last.node,last.at);return range;
 }
}
class WordMarker{
 constructor(){
  this.layer=document.createElement('div');this.layer.id='speech-word-overlay';this.layer.setAttribute('aria-hidden','true');document.body.append(this.layer);this.model=null;this.word=null;
  document.addEventListener('scroll',()=>this.draw(),true);root.addEventListener('resize',()=>this.draw());
  document.addEventListener('lesson-highlights-rendered',()=>{if(this.model&&this.word)this.show(this.model,this.word,false);});
 }
 show(model,word,follow=true){
  this.model=model;this.word=word;const range=model.range(word);if(!range){this.clear();return;}
  this.range=range;this.layer.dataset.word=word.text;
  if(root.CSS?.highlights&&root.Highlight)CSS.highlights.set('spoken-word',new Highlight(range));
  if(follow)this.follow(range);this.draw();
 }
 follow(range){
  if(root.getSelection()?.isCollapsed===false||document.querySelector('dialog[open]'))return;
  const rect=range.getBoundingClientRect(),top=(document.querySelector('.appbar')?.getBoundingClientRect().bottom||0)+14;
  const nav=document.querySelector('.tabs'),bottom=innerHeight-(nav&&!nav.hidden?nav.getBoundingClientRect().height+14:16);
  if(rect.height&&(rect.top<top||rect.bottom>bottom))root.scrollBy(0,rect.top-top-Math.max(0,(bottom-top)/3));
 }
 draw(){
  this.layer.replaceChildren();if(!this.range||root.CSS?.highlights&&root.Highlight)return;
  // Older WebViews cannot style a Range. Draw only red glyphs on a transparent
  // layer, keeping the original background, lesson DOM and saved marks untouched.
  for(const node of textNodes(this.model.lesson)){
   if(!this.range.intersectsNode(node))continue;
   const start=this.range.startContainer===node?this.range.startOffset:0,end=this.range.endContainer===node?this.range.endOffset:node.length;
   if(end<=start||this.range.comparePoint(node,end)<0||this.range.comparePoint(node,start)>0)continue;
   const text=node.data.slice(start,end),runs=[];
   const segments=root.Intl?.Segmenter?[...new Intl.Segmenter('en',{granularity:'grapheme'}).segment(text)].map(s=>({index:s.index,text:s.segment})):(()=>{let at=0;return Array.from(text,c=>{const segment={index:at,text:c};at+=c.length;return segment;});})();
   for(const segment of segments){
    const part=document.createRange();part.setStart(node,start+segment.index);part.setEnd(node,start+segment.index+segment.text.length);const rect=part.getBoundingClientRect();if(!rect.width||!rect.height)continue;
    const last=runs[runs.length-1];if(last&&Math.abs(last.top-rect.top)<1&&Math.abs(last.height-rect.height)<1){last.text+=segment.text;last.left=Math.min(last.left,rect.left);last.right=Math.max(last.right,rect.right);}else runs.push({text:segment.text,left:rect.left,right:rect.right,top:rect.top,height:rect.height});
   }
   const style=getComputedStyle(node.parentElement);
   for(const run of runs){const glyphs=document.createElement('span');glyphs.className='speech-word-text';glyphs.textContent=run.text;for(const name of ['fontFamily','fontSize','fontStyle','fontWeight','fontStretch','fontVariant','fontFeatureSettings','fontVariationSettings','letterSpacing','wordSpacing','textTransform','direction'])glyphs.style[name]=style[name];Object.assign(glyphs.style,{left:run.left+'px',top:run.top+'px',height:run.height+'px',lineHeight:run.height+'px'});this.layer.append(glyphs);}
  }
 }
 clear(){if(root.CSS?.highlights)CSS.highlights.delete('spoken-word');this.layer.replaceChildren();delete this.layer.dataset.word;this.range=null;this.model=null;this.word=null;}
}
root.RadioNarration={Model,WordMarker,words,wordAt,wordPlans,chunkPlans};
if(typeof module!=='undefined')module.exports=root.RadioNarration;
})(typeof window!=='undefined'?window:globalThis);
