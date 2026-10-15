import {createMotionRuntime} from '../../src/runtime.js';
import {attachPlayer} from '../../src/player.js';
import {lessonEffects,lessonProgress} from './effects.js';
window.__ready=false;
try {
 const response=await fetch('./timing.json');
 if(!response.ok)throw new Error(`定时文件载入失败: ${response.status}`);
 const timing=await response.json();
 const runtime=await createMotionRuntime({root:document.querySelector('#scene-root'), scenes:window.COURSE_SCENES,timing,subtitle:document.querySelector('#subtitle'),progress:document.querySelector('#progress'),onRender:lessonEffects,progressAt:(t,total)=>lessonProgress(t,total,timing)});
 window.renderAt=runtime.renderAt;
 window.__duration=runtime.duration;
 window.__timing=timing;
 window.__motion=runtime;
 window.__hf={seek:runtime.renderAt,duration:runtime.duration};
 window.__player=attachPlayer({runtime,tracks:[{url:'./audio/narration.mp3',start:timing.voice_delay_s},{url:'./audio/effects.mp3',start:0}]});
 window.__ready=true;
} catch(error) {document.querySelector('#status').textContent=error.message;console.error(error);}
