// Generic seekable SVG runtime. No lesson text, scenes, audio or lesson-specific effects.
export async function createMotionRuntime({root, scenes, timing, subtitle, progress, width=1080, phaseLength=30, onRender=()=>{}, progressAt=(t,total)=>t/total}) {
if(!root || !subtitle || !Array.isArray(scenes) || !Array.isArray(timing?.scenes) || !timing.scenes.length)throw new Error('Root, scenes, subtitle and real timing are required');
root.innerHTML=scenes.join('');
const clamp=x=>Math.max(0,Math.min(1,x));
// Standard back ease polynomial, overshoot 1.35; implemented without a vendor library.
const ease=p=>{const q=p-1;return 1+2.35*q*q*q+1.35*q*q};
const sceneDefs=timing.scenes.map((s,i)=>({...s,cues:Array.isArray(s.cues)?s.cues:Object.entries(s.cues||{}).map(([id,v])=>typeof v==='number'?{id,start:v,end:v+.6}:{id,...v}),id:String(s.id??s.scene??i+1),start:Number(s.start??s.start_sec??i*30),end:Number(s.end??s.end_sec??(i+1)*30)}));
const total=Number(timing.duration??timing.duration_s??timing.totalDuration??Math.max(...sceneDefs.map(s=>s.end)));
let captions=[...(timing.captions||[])];for(const s of sceneDefs){for(const cap of s.captions||[]){const local=cap.relative===true||s.captionsRelative===true;captions.push({...cap,start:Number(cap.start??cap.start_sec)+(local?s.start:0),end:Number(cap.end??cap.end_sec)+(local?s.start:0)});}}
captions=captions.map(c=>({...c,start:Number(c.start??c.start_sec),end:Number(c.end??c.end_sec),text:c.text??c.caption??''})).filter(c=>Number.isFinite(c.start)&&Number.isFinite(c.end)).sort((a,b)=>a.start-b.start);
await document.fonts.ready;const data=sceneDefs.map((def,i)=>{const el=root.ownerDocument.getElementById(def.elementId || `scene-${def.id}`);if(!el)throw new Error(`Missing scene element: ${def.id}`);el.style.display='block';const items=[...el.querySelectorAll('[data-in]')].map(item=>{const box=item.getBBox();return{el:item,base:item.getAttribute('transform')||'',cx:box.x+box.width/2,cy:box.y+box.height/2,beat:Number(item.dataset.in),end:Number(item.dataset.out ?? Infinity),kind:item.dataset.kind||'pop'}});const paths=[...el.querySelectorAll('[data-draw]')].map(p=>({el:p,len:p.getTotalLength()}));el.style.display='none';return{def,el,items,paths}});
function cueTime(scene,item){const cue=(scene.cues||[]).find(c=>String(c.id)===item.el.id);if(!cue)return null;const rel=cue.relative===true||scene.cuesRelative===true;return{start:Number(cue.start??cue.start_sec)+(rel?scene.start:0),end:Number(cue.end??cue.end_sec??(Number(cue.start??cue.start_sec)+.6))+(rel?scene.start:0)}}
function splitCaption(text){if(text.includes('\n'))return text;const chars=[...text];if(chars.length<=21)return text;let split=Math.min(21,Math.ceil(chars.length/2));for(let d=0;d<5;d++){let k=split-d;if(/[，。；：？！、]/.test(chars[k-1])){split=k;break}}return chars.slice(0,split).join('')+'\n'+chars.slice(split).join('')}
function renderAt(seconds){const t=Math.max(0,Math.min(total-.00001,Number(seconds)||0));let active=data.find(s=>t>=s.def.start&&t<s.def.end)||data[data.length-1];for(const s of data)s.el.style.display=s===active?'block':'none';const d=active.def,duration=d.end-d.start,local=t-d.start;let u=local/duration*phaseLength;let anchors=[{time:d.start,phase:0},...active.items.map(item=>{const c=cueTime(d,item);return c?{time:c.start,phase:item.beat}:null}).filter(Boolean),{time:d.end,phase:phaseLength}].sort((a,b)=>a.time-b.time);anchors=anchors.filter((a,i,arr)=>i===0||a.phase>=Math.max(...arr.slice(0,i).map(x=>x.phase)));if(anchors.length>2){let a=anchors[0],b=anchors[anchors.length-1];for(let i=0;i<anchors.length-1;i++){if(t>=anchors[i].time&&t<anchors[i+1].time){a=anchors[i];b=anchors[i+1];break;}}u=a.phase+(b.phase-a.phase)*clamp((t-a.time)/Math.max(.001,b.time-a.time));}
for(const item of active.items){item.el.setAttribute('transform',item.base);item.el.style.transform='';}for(const item of active.items){const cue=cueTime(d,item);let p=cue?clamp((t-cue.start)/Math.max(.15,cue.end-cue.start)):clamp((u-item.beat)/.65);const visible=item.beat===0||p>0;const expired=u>=item.end;item.el.style.opacity=visible&&!expired?'1':'0';if(expired||!visible){item.el.style.transform='';continue;}if(item.kind!=='line'&&item.beat!==0&&p<1){const q=ease(p);const cx=item.cx,cy=item.cy;item.el.setAttribute('transform',`${item.base} translate(${cx} ${cy}) scale(${.88+.12*q}) rotate(${(1-q)*-3}) translate(${-cx} ${-cy})`);item.el.style.opacity=String(clamp(p*5));}else item.el.setAttribute('transform',item.base);
}
for(const path of active.paths){const parent=path.el.closest('[data-in]');let beat=Number(parent.dataset.in);let p=clamp((u-beat)/.9);const item=active.items.find(x=>x.el===parent);const cue=item?cueTime(d,item):null;if(cue)p=clamp((t-cue.start)/Math.max(.2,cue.end-cue.start));path.el.style.strokeDasharray=String(path.len);path.el.style.strokeDashoffset=String((1-p)*path.len);path.el.style.opacity=p>0?'1':'0';}
onRender({scene: active.el, phase: u, time: t, duration: total, timing});
const cap=captions.find(c=>t>=c.start&&t<c.end);subtitle.textContent=cap?splitCaption(cap.text):'';subtitle.style.opacity=cap?'1':'0';
if(progress){progress.style.transform='none';progress.style.width=Math.round(width*progressAt(t,total))+'px';}
currentTime=t;currentScene=active.el.id;currentPhase=u;
return {time:t,scene:currentScene,phase:u};
}
let currentTime=0,currentScene='',currentPhase=0;
renderAt(0);
return {renderAt,timing,duration:total,get currentTime(){return currentTime},get currentScene(){return currentScene},get currentPhase(){return currentPhase}};
}
