import test from 'node:test';
import assert from 'node:assert/strict';
import {startServer} from '../scripts/serve.mjs';
import {readFile} from 'node:fs/promises';
test('preview serves the independent lesson, scripts and byte ranges; blocks private files',async()=>{
 const app=await startServer({port:0});try{
  for(const resource of ['/','/examples/lesson-01/','/src/runtime.js','/examples/lesson-01/timing.json'])assert.equal((await fetch(app.url+resource)).status,200,resource);
  const audio=await fetch(app.url+'/examples/lesson-01/audio/narration.mp3',{headers:{Range:'bytes=0-99'}});assert.equal(audio.status,206);assert.equal((await audio.arrayBuffer()).byteLength,100);
  assert.equal((await fetch(app.url+'/examples/lesson-01/audio/narration.mp3',{headers:{Range:'bytes=999999999-'}})).status,416);
  for(const resource of ['/package.json','/.git/config','/scripts/serve.mjs','/examples/%2e%2e/package.json'])assert.equal((await fetch(app.url+resource)).status,404,resource);
 }finally{await app.close()}
});
test('lesson has eight continuous scenes and captions/cues within the real timeline',async()=>{
 const timing=JSON.parse(await readFile(new URL('../examples/lesson-01/timing.json',import.meta.url),'utf8'));
 assert.equal(timing.scenes.length,8);assert.equal(timing.duration_s,236.11);let end=0,count=0;
 for(const scene of timing.scenes){assert.equal(scene.start,end);assert.ok(scene.end>scene.start);end=scene.end;assert.ok(scene.cues.length);assert.ok(scene.captions.length);for(const cap of scene.captions){assert.ok(cap.start>=scene.start-.001&&cap.end<=scene.end+.001);assert.ok(cap.end>cap.start);count++}}
 assert.equal(end,timing.duration_s);assert.ok(count>100);
});
