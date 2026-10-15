// Optional local export. Chrome/Chromium and FFmpeg are supplied by the caller, never bundled.
import puppeteer from 'puppeteer-core';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {readFile,mkdir,rename,rm,access} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {startServer} from './serve.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const value=(flag,fallback)=>{const i=process.argv.indexOf(flag);return i<0?fallback:process.argv[i+1]};
if(process.argv.includes('--help')){console.log('npm run export -- --example examples/lesson-01 --browser /path/to/chrome --ffmpeg /path/to/ffmpeg [--output outputs/lesson.mp4] [--start 0] [--duration seconds] [--fps 30]');process.exit(0)}
const browserPath=value('--browser',process.env.BROWSER_PATH),ffmpeg=value('--ffmpeg',process.env.FFMPEG_PATH);
if(!browserPath||!ffmpeg)throw new Error('Supply --browser and --ffmpeg, or BROWSER_PATH and FFMPEG_PATH');
const example=path.resolve(root,value('--example','examples/lesson-01'));
if(!example.startsWith(path.join(root,'examples')+path.sep))throw new Error('Example must be inside examples/');
const config=JSON.parse(await readFile(path.join(example,'lesson.json'),'utf8'));
const timing=JSON.parse(await readFile(path.join(example,config.timing),'utf8'));
const fps=Number(value('--fps',config.fps||30)),start=Number(value('--start',0)),requested=Number(value('--duration',timing.duration_s-start));
if(!Number.isInteger(fps)||fps<1||fps>60||!Number.isFinite(start)||start<0||start>=timing.duration_s||!Number.isFinite(requested)||requested<=0)throw new Error('Invalid FPS/start/duration');
const frames=Math.ceil(Math.min(requested,timing.duration_s-start)*fps),duration=frames/fps;
const output=path.resolve(value('--output','outputs/lesson.mp4')),temporary=output.replace(/\.mp4$/i,'')+`.partial-${process.pid}.mp4`;
try{await access(output);throw new Error('Output exists; choose another --output path')}catch(error){if(error.code!=='ENOENT')throw error}
await mkdir(path.dirname(output),{recursive:true});
const app=await startServer({port:0});let browser,encoder,finished;
try{
 browser=await puppeteer.launch({executablePath:browserPath,headless:true});
 const page=await browser.newPage();await page.setViewport({width:config.width,height:config.height,deviceScaleFactor:1});const errors=[];page.on('pageerror',error=>errors.push(error.message));page.on('requestfailed',request=>errors.push(request.url()));
 const url=`${app.url}/${path.relative(root,example).split(path.sep).map(encodeURIComponent).join('/')}/?export=1`;
 await page.goto(url,{waitUntil:'networkidle0'});await page.waitForFunction(()=>window.__ready===true&&typeof window.renderAt==='function');
 const input=['-y','-hide_banner','-loglevel','error','-f','image2pipe','-vcodec','mjpeg','-framerate',String(fps),'-i','pipe:0'];
 const filters=[];config.tracks.forEach((track,i)=>{const file=path.resolve(example,track.file);if(!file.startsWith(example+path.sep))throw new Error('Track outside example');input.push('-i',file);filters.push(`[${i+1}:a]adelay=${Math.round(track.start*1000)}:all=1,apad[a${i}]`)});
 const labels=config.tracks.map((_,i)=>`[a${i}]`).join('');
 filters.push(`${labels}amix=inputs=${config.tracks.length}:duration=longest:normalize=0,alimiter=limit=0.98:level=0:latency=1,atrim=start=${start}:duration=${duration},asetpts=PTS-STARTPTS[audio]`);
 encoder=spawn(ffmpeg,[...input,'-filter_complex',filters.join(';'),'-map','0:v:0','-map','[audio]','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-t',String(duration),'-movflags','+faststart',temporary],{stdio:['pipe','ignore','pipe']});
 let stderr='';encoder.stderr.on('data',chunk=>{stderr=(stderr+chunk).slice(-6000)});encoder.stdin.on('error',()=>{});
 finished=new Promise((resolve,reject)=>{encoder.once('error',reject);encoder.once('close',code=>code===0?resolve():reject(new Error(stderr||`FFmpeg exited: ${code}`)))});finished.catch(()=>{});
 for(let frame=0;frame<frames;frame++){
  if(encoder.exitCode!==null)throw new Error(stderr||'FFmpeg exited early');
  await page.evaluate(time=>window.renderAt(time),start+frame/fps);
  if(errors.length)throw new Error(errors.join('\n'));
  const bytes=await page.screenshot({type:'jpeg',quality:96});
  if(!encoder.stdin.write(bytes))await once(encoder.stdin,'drain');
  if(frame%300===0)console.log(`Frames: ${frame}/${frames}`);
 }
 encoder.stdin.end();await finished;await rename(temporary,output);console.log(JSON.stringify({output,frames,fps,duration_s:duration,start_s:start,width:config.width,height:config.height}));
}finally{if(encoder&&encoder.exitCode===null)encoder.kill('SIGTERM');if(browser)await browser.close();await app.close();await rm(temporary,{force:true})}
