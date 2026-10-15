export function lessonEffects({scene,phase}) {
const clamp=x=>Math.max(0,Math.min(1,x));
// The single-stage example dims the other tasks without implying that they are required.
if(scene.id==='scene-3'){for(const id of ['intent','reply','intent-route','reply-route']){const e=document.getElementById(id);if(phase>=26)e.style.opacity='0';else if(phase>=23)e.style.opacity='.15';}}
// Training visibly changes an internal calculation marker, without displaying a probability.
if(scene.id==='scene-4'){const model=document.querySelector('#learn-model');if(model){model.style.filter=phase>=19&&phase<20.1?'drop-shadow(0 0 10px #ed5d42)':'';}const mark=document.querySelector('#learn-parameter-marker');if(mark)mark.setAttribute('cy',String(982-35*clamp((phase-19)/1.2)));}
// A parameter slider is a qualitative illustration, never a confidence number.
if(scene.id==='scene-5'){const stamp=document.querySelector('#confirm-stamp');if(stamp)stamp.dataset.confirmed=String(phase>=18);}
}
export function lessonProgress(t,total,timing){
const identity=timing.progressMapping;
return identity?(t<identity.new_prefix_s?t*identity.old_cut_s/identity.new_prefix_s:t-identity.delta_s)/identity.original_visual_duration_s:t/total;
}
