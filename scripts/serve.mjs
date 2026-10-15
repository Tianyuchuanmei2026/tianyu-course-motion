import http from 'node:http';
import {createReadStream} from 'node:fs';
import {stat,realpath} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.mp3':'audio/mpeg','.png':'image/png','.svg':'image/svg+xml'};
export async function startServer({port=4173,host='127.0.0.1'}={}){
 const server=http.createServer(async(req,res)=>{
  const fail=(code,text)=>{res.writeHead(code,{'Content-Type':'text/plain; charset=utf-8'});res.end(text)};
  if(!['GET','HEAD'].includes(req.method))return fail(405,'Method not allowed');
  try{
   let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
   if(pathname.includes('\0')||pathname.includes('\\'))return fail(400,'Invalid path');
   if(pathname.endsWith('/'))pathname+='index.html';
   if(pathname!=='/index.html'&&!/^\/(src|examples)\//.test(pathname))return fail(404,'Not found');
   if(pathname.split('/').some(segment=>segment.startsWith('.')||segment==='node_modules'))return fail(404,'Not found');
   const file=await realpath(path.join(root,pathname)),info=await stat(file);
   if(!file.startsWith(root)||!info.isFile()||!types[path.extname(file)])return fail(404,'Not found');
   const headers={'Content-Type':types[path.extname(file)],'Accept-Ranges':'bytes','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'};
   let start=0,end=info.size-1,code=200;
   if(req.headers.range){
    const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
    if(!match||(!match[1]&&!match[2])){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});return res.end()}
    if(!match[1])start=Math.max(0,info.size-Number(match[2]));else{start=Number(match[1]);if(match[2])end=Math.min(end,Number(match[2]))}
    if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=info.size){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});return res.end()}
    code=206;headers['Content-Range']=`bytes ${start}-${end}/${info.size}`;
   }
   headers['Content-Length']=end-start+1;res.writeHead(code,headers);
   if(req.method==='HEAD')return res.end();
   createReadStream(file,{start,end}).on('error',()=>res.destroy()).pipe(res);
  }catch(error){if(!res.headersSent)fail(error.code==='ENOENT'?404:400,'Not found');else res.destroy()}
 });
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,host,resolve)});
 return {server,url:`http://${host}:${server.address().port}`,close:()=>new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()))};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const get=(flag,fallback)=>{const i=process.argv.indexOf(flag);return i<0?fallback:process.argv[i+1]};
 const port=Number(get('--port',process.env.PORT||4173));
 if(!Number.isInteger(port)||port<0||port>65535)throw new Error('Port must be an integer between 0 and 65535');
 const app=await startServer({port});console.log(`Lesson preview: ${app.url}`);
 for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>app.server.close(()=>process.exit(0)));
}
