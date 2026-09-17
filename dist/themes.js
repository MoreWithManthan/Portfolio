/* Apply validated device-local preferences before the page is painted. */
(() => {
  'use strict';
  const key = 'morewithmanthan-bold-appearance-v1';
  const palettes = [
    {id:'sunshine',name:'Sunshine',colors:['#ffca05','#f14384','#8856ec']},
    {id:'bubblegum',name:'Bubblegum',colors:['#ffb6d2','#d7f565','#735de0']},
    {id:'mint',name:'Mint chip',colors:['#bbefda','#ffbd58','#f16c99']},
    {id:'blue',name:'Electric blue',colors:['#a6ccff','#ffda42','#ed80b2']},
    {id:'lilac',name:'Lilac pop',colors:['#d1bcff','#b8ed5b','#ff947c']},
    {id:'peach',name:'Peach club',colors:['#ffc099','#8bcaee','#ce9ce9']},
    {id:'lime',name:'Acid lime',colors:['#d4ed64','#b593fa','#ff8aab']},
    {id:'paper',name:'Ink & paper',colors:['#f2f1ea','#d5d5cc','#aeb7b7']}
  ];
  const defaults = {palette:'sunshine',corners:'rounded',shadow:'bold',outline:'bold'};
  const valid = {palette:palettes.map(p=>p.id),corners:['square','rounded','soft'],shadow:['flat','crisp','bold'],outline:['fine','bold','heavy']};
  let state = {...defaults};
  try {const saved=JSON.parse(localStorage.getItem(key));for(const field of Object.keys(valid))if(valid[field].includes(saved?.[field]))state[field]=saved[field];} catch {}
  function apply(persist=true) {
    const root=document.documentElement;
    root.dataset.palette=state.palette;root.dataset.corners=state.corners;root.dataset.shadow=state.shadow;root.dataset.outline=state.outline;
    const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=palettes.find(p=>p.id===state.palette).colors[0];
    if(persist)try{localStorage.setItem(key,JSON.stringify(state));}catch{}
  }
  apply(false);
  function init() {
    const make=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;};
    const toggle=document.getElementById('theme-toggle');
    const dialog=make('dialog','theme-dialog');dialog.id='theme-dialog';dialog.setAttribute('aria-labelledby','theme-title');
    const head=make('div','dialog-head'),title=make('strong','','MAKE IT YOURS');title.id='theme-title';
    const close=make('button','square','×');close.type='button';close.setAttribute('aria-label','Close theme settings');head.append(title,close);
    const body=make('div','theme-body');body.append(make('p','theme-intro','Pick a palette. Shape the edges. Make it feel like you.'));
    const paletteGroup=make('fieldset','theme-fieldset');paletteGroup.append(make('legend','','Color palette'));
    const grid=make('div','palette-grid');const controls=[];
    const status=make('p','theme-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
    function sync(){
      controls.forEach(button=>button.setAttribute('aria-pressed',String(state[button.dataset.field]===button.dataset.value)));
      toggle.title=`Theme: ${palettes.find(p=>p.id===state.palette).name}`;
    }
    function choose(field,value){
      state[field]=value;document.body.classList.remove('party-mode');apply();sync();
      status.textContent='Saved on this device.';
    }
    for(const palette of palettes){
      const button=make('button','palette-option');button.type='button';button.dataset.field='palette';button.dataset.value=palette.id;button.setAttribute('aria-label',palette.name);
      const swatches=make('span','palette-swatches');swatches.setAttribute('aria-hidden','true');
      palette.colors.forEach(color=>{const swatch=make('span');swatch.style.backgroundColor=color;swatches.append(swatch);});
      button.append(swatches,make('span','palette-name',palette.name));button.addEventListener('click',()=>choose('palette',palette.id));grid.append(button);controls.push(button);
    }
    paletteGroup.append(grid);body.append(paletteGroup);
    for(const [field,label,options] of [
      ['corners','Corners',[['square','Square'],['rounded','Rounded'],['soft','Extra round']]],
      ['outline','Outline',[['fine','Fine'],['bold','Bold'],['heavy','Heavy']]],
      ['shadow','Shadow',[['flat','Flat'],['crisp','Crisp'],['bold','Bold']]]
    ]){
      const group=make('fieldset','theme-fieldset');group.append(make('legend','',label));const row=make('div','theme-choices');
      for(const [value,name] of options){const button=make('button','theme-choice',name);button.type='button';button.dataset.field=field;button.dataset.value=value;button.addEventListener('click',()=>choose(field,value));row.append(button);controls.push(button);}
      group.append(row);body.append(group);
    }
    const footer=make('div','theme-footer');const reset=make('button','theme-reset','Reset to original');reset.type='button';reset.addEventListener('click',()=>{state={...defaults};document.body.classList.remove('party-mode');apply();sync();status.textContent='Original theme restored.';});
    const done=make('button','button black','Done');done.type='button';done.addEventListener('click',()=>dialog.close());footer.append(reset,done);body.append(status);dialog.append(head,body,footer);document.body.append(dialog);sync();
    toggle.addEventListener('click',()=>{status.textContent='Changes preview instantly.';dialog.showModal();});close.addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>toggle.focus({preventScroll:true}));
    dialog.addEventListener('click',event=>{const rect=dialog.getBoundingClientRect();if(event.target===dialog&&(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom))dialog.close();});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
