import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
import {startServer} from '../scripts/serve.mjs';
import {mkdir} from 'node:fs/promises';
const browserPath=process.env.BROWSER_PATH;
if(!browserPath)throw new Error('Set BROWSER_PATH to a local Chrome/Chromium executable');
const app=await startServer({port:0});let browser;
try {
 browser=await puppeteer.launch({executablePath:browserPath,headless:true});
 const page=await browser.newPage();await page.setViewport({width:1080,height:1920});const errors=[];
 page.on('pageerror',error=>errors.push(error.message));page.on('requestfailed',request=>errors.push(request.url()));page.on('response',response=>{if(response.status()>=400)errors.push(`${response.status()} ${response.url()}`)});
 await page.goto(`${app.url}/examples/lesson-01/?export=1`,{waitUntil:'networkidle0'});await page.waitForFunction(()=>window.__ready===true);
 const report=await page.evaluate(()=>{
  const runtime=window.__motion,timing=window.__timing;let checked=0;
  const state=()=>JSON.stringify({svg:document.getElementById(runtime.currentScene).outerHTML,subtitle:document.querySelector('#subtitle').outerHTML,progress:document.querySelector('#progress').outerHTML});
  for(const scene of timing.scenes){
   for(const t of [scene.start+.01,(scene.start+scene.end)/2,scene.end-.01]){
    runtime.renderAt(t);if(runtime.currentScene!==`scene-${scene.id}`)throw new Error(`Scene mismatch ${scene.id}`);
    const before=state();runtime.renderAt(0);runtime.renderAt(t);if(state()!==before)throw new Error(`Seek instability ${scene.id} @ ${t}`);checked++;
   }
   for(const caption of scene.captions){runtime.renderAt((caption.start+caption.end)/2);const text=document.querySelector('#subtitle').textContent.replace(/\n/g,'');if(text!==caption.text.replace(/\n/g,''))throw new Error('Caption mismatch');}
  }
  runtime.renderAt(0);return {duration:runtime.duration,scenes:timing.scenes.length,seekChecks:checked,captions:timing.scenes.reduce((n,s)=>n+s.captions.length,0)};
 });
 await mkdir('outputs',{recursive:true});
 for(const [name,time] of [['cover',0],['route',43],['exercise',170]]){await page.evaluate(t=>window.renderAt(t),time);await page.screenshot({path:`outputs/${name}.png`});}
 await page.evaluate(()=>{delete document.body.dataset.export});await page.click('#play');await page.waitForFunction(()=>window.__player.audioDurations?.length===2);await new Promise(resolve=>setTimeout(resolve,500));
 const audio=await page.evaluate(()=>{const player=window.__player;const result={time:player.currentTime,durations:player.audioDurations,playing:player.playing};player.pause();player.seek(100);return {...result,seek:player.currentTime}});
 assert.ok(audio.playing&&audio.time>0);assert.equal(audio.seek,100);assert.equal(audio.durations.length,2);assert.ok(Math.abs(audio.durations[0]-235.81)<.05);assert.ok(Math.abs(audio.durations[1]-236.11)<.05);assert.deepEqual(errors,[]);
 console.log(JSON.stringify({...report,audio,browserErrors:errors},null,2));
}finally{if(browser)await browser.close();await app.close()}
