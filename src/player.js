// Web Audio is the clock for both sound and picture. Audio is loaded after the first user gesture.
export function attachPlayer({runtime,tracks=[],width=1080,height=1920}) {
 const button=document.querySelector('#play'),slider=document.querySelector('#seek'),clock=document.querySelector('#clock'),status=document.querySelector('#status');
 const exported=new URLSearchParams(location.search).get('export')==='1';
 if(exported)document.body.dataset.export='1';
 let context,buffers,sources=[],playing=false,position=0,epoch=0,frame=0,loading;
 const format=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
 slider.max=runtime.duration;
 function display(t){runtime.renderAt(t);slider.value=t;clock.value=`${format(t)} / ${format(runtime.duration)}`;}
 function fit(){const scale=Math.min(1,innerWidth/width,Math.max(120,innerHeight-Math.max(112,document.querySelector("#controls").getBoundingClientRect().height+16))/height);const viewport=document.querySelector('#viewport');viewport.style.width=`${width*scale}px`;viewport.style.height=`${height*scale}px`;document.querySelector('#canvas-wrap').style.transform=`scale(${scale})`;}
 addEventListener('resize',fit);fit();display(0);status.textContent='点击播放后载入音频，可拖动进度查看8场内容';
 const current=()=>playing?Math.max(0,Math.min(runtime.duration,context.currentTime-epoch)):position;
 async function load(){
  context??=new AudioContext();await context.resume();
  if(!buffers){loading??=Promise.all(tracks.map(async track=>{const response=await fetch(track.url);if(!response.ok)throw new Error(`Audio fetch failed: ${response.status}`);return context.decodeAudioData(await response.arrayBuffer());})).catch(error=>{loading=undefined;throw error});buffers=await loading;}
 }
 function stopSources(){for(const source of sources){try{source.stop()}catch{}source.disconnect()}sources=[];cancelAnimationFrame(frame);}
 function tick(){const t=current();display(t);if(t>=runtime.duration){playing=false;position=runtime.duration;stopSources();button.textContent='重播';return}frame=requestAnimationFrame(tick);}
 function schedule(){
  stopSources();const now=context.currentTime+.025;epoch=now-position;
  tracks.forEach((track,index)=>{const offset=Math.max(0,position-track.start),delay=Math.max(0,track.start-position);if(offset>=buffers[index].duration)return;const source=context.createBufferSource();source.buffer=buffers[index];source.connect(context.destination);source.start(now+delay,offset);sources.push(source);});
  playing=true;button.textContent='暂停';frame=requestAnimationFrame(tick);
 }
 async function play(){button.disabled=true;status.textContent='正在载入音频…';try{await load();if(position>=runtime.duration)position=0;schedule();status.textContent='音频与画面使用同一播放时钟';}finally{button.disabled=false}}
 function pause(){position=current();playing=false;stopSources();button.textContent='播放';display(position);}
 function seek(t){position=Math.max(0,Math.min(runtime.duration,Number(t)||0));if(playing)schedule();display(position);}
 button.addEventListener('click',()=>{if(playing)pause();else play().catch(error=>{status.textContent=`播放失败：${error.message}`;console.error(error)})});
 slider.addEventListener('input',()=>seek(slider.value));
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)pause()});
 return {play,pause,seek,get currentTime(){return current()},get playing(){return playing},get audioDurations(){return buffers?.map(buffer=>buffer.duration)}};
}
