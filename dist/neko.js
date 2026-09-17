/* Animated companion; cat frame coordinates follow adryd325/oneko.js. */
(() => {
  'use strict';
  if (document.getElementById('active-neko')) return;
  const characters = [
    {id:'manthan',name:'Manthan',kind:'Human',color:'#8cbdf4'},
    {id:'kritika',name:'Kritika',kind:'Female cat',color:'#e5a9bd'},
    {id:'savy',name:'Savy',kind:'Female cat',color:'#bca4e3'},
    {id:'garisha',name:'Garisha',kind:'Female cat',color:'#8cc8b2'},
    {id:'jiya',name:'Jiya',kind:'Female cat',color:'#ebbb79'},
    {id:'krish',name:'Krish',kind:'Male cat',color:'#8aafda'}
  ];
  const frames = {idle:[[-3,-3]],sleeping:[[-2,0],[-2,-1]],N:[[-1,-2],[-1,-3]],NE:[[0,-2],[0,-3]],E:[[-3,0],[-3,-1]],SE:[[-5,-1],[-5,-2]],S:[[-6,-3],[-7,-2]],SW:[[-5,-3],[-6,-1]],W:[[-4,-2],[-4,-3]],NW:[[-1,0],[-1,-1]]};
  const make = (tag, cls, text) => {const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;};
  const key='morewithmanthan-bold-neko-v1';
  let character=characters[0], paused=false;
  try {const saved=JSON.parse(localStorage.getItem(key));character=characters.find(c=>c.id===saved?.active)||character;paused=saved?.paused===true;} catch {}
  const save=()=>{try{localStorage.setItem(key,JSON.stringify({active:character.id,paused}));}catch{}};
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let x=Math.max(12,innerWidth-88),y=Math.max(12,innerHeight-150),targetX=x-120,targetY=y-60;
  let hovered=false,parked=false,dragging=false,moved=false,frame=0,idle=0,suppress=0,lastPointer=0,hold;
  let startX=0,startY=0,offsetX=0,offsetY=0;
  const pet=make('button','neko-companion');pet.id='active-neko';pet.type='button';pet.setAttribute('aria-haspopup','dialog');
  const label=make('span','neko-label');label.setAttribute('aria-hidden','true');
  let sprite;
  const svgNS='http://www.w3.org/2000/svg';
  const filters=document.createElementNS(svgNS,'svg');filters.classList.add('neko-filters');filters.setAttribute('aria-hidden','true');
  const defs=document.createElementNS(svgNS,'defs');filters.append(defs);
  for(const c of characters.slice(1)){
    const filter=document.createElementNS(svgNS,'filter');filter.id=`bold-tint-${c.id}`;filter.setAttribute('color-interpolation-filters','sRGB');
    const matrix=document.createElementNS(svgNS,'feColorMatrix');matrix.setAttribute('type','matrix');
    const rgb=[1,3,5].map(i=>parseInt(c.color.slice(i,i+2),16)/255);
    matrix.setAttribute('values',`${rgb[0]} 0 0 0 0 0 ${rgb[1]} 0 0 0 0 0 ${rgb[2]} 0 0 0 0 0 1 0`);filter.append(matrix);defs.append(filter);
  }
  document.body.append(filters);
  function spriteFor(c){const el=make('span',c.id==='manthan'?'neko-human':'neko-sprite');el.setAttribute('aria-hidden','true');if(c.id!=='manthan')el.style.filter=`url(#bold-tint-${c.id})`;return el;}
  function paint(){x=Math.max(8,Math.min(x,Math.max(8,innerWidth-60)));y=Math.max(8,Math.min(y,Math.max(8,innerHeight-84)));pet.style.left=`${x}px`;pet.style.top=`${y}px`;}
  function updateCharacter(){sprite=spriteFor(character);label.textContent=character.name;pet.replaceChildren(sprite,label);pet.dataset.character=character.id;pet.setAttribute('aria-label',`${character.name}, ${character.kind}. Click for CTF help. Right-click or long-press to choose a companion. Drag or use arrow keys to move.`);pet.title=`${character.name} · Click for help · Right-click or hold to switch`;idle=0;hovered=false;dragging=false;paint();}
  updateCharacter();document.body.append(pet);

  function dialog(title,id){
    const el=make('dialog','neko-dialog');el.setAttribute('aria-labelledby',id);
    const head=make('div','dialog-head'),heading=make('strong','',title);heading.id=id;
    const close=make('button','square','×');close.type='button';close.setAttribute('aria-label','Close');close.addEventListener('click',()=>el.close());head.append(heading,close);el.append(head);
    el.addEventListener('click',event=>{const r=el.getBoundingClientRect();if(event.target===el&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))el.close();});
    el.addEventListener('close',()=>{hovered=false;pet.focus({preventScroll:true});});
    document.body.append(el);return el;
  }
  const picker=dialog('CHOOSE A COMPANION','neko-picker-title');picker.id='neko-picker';
  const choices=make('div','neko-options');picker.append(choices);
  const settings=make('div','neko-settings');
  const pauseLabel=make('label'),pause=make('input');pause.type='checkbox';pause.checked=paused;pauseLabel.append(pause,document.createTextNode(' Pause movement'));
  pause.addEventListener('change',()=>{paused=pause.checked;save();});
  const resume=make('button','button yellow','Resume roaming ↗');resume.type='button';
  function roam(){paused=false;parked=false;hovered=false;pause.checked=false;targetX=innerWidth/2;targetY=innerHeight/2;lastPointer=0;save();}
  resume.addEventListener('click',()=>{roam();picker.close();});
  settings.append(pauseLabel,resume,make('p','neko-instructions','Drag to move · Click for CTF help. Reduced-motion preferences are respected.'));picker.append(settings);
  function showPicker(){
    clearTimeout(hold);dragging=false;suppress=performance.now()+700;
    choices.replaceChildren();
    for(const c of characters){
      const option=make('button','neko-option');option.type='button';option.dataset.character=c.id;option.setAttribute('aria-pressed',String(c.id===character.id));
      const text=make('span');text.append(make('strong','',c.name),make('small','',c.kind));option.append(spriteFor(c),text);
      option.addEventListener('click',()=>{character=c;parked=false;updateCharacter();syncChatIdentity();save();picker.close();});choices.append(option);
    }
    if(!picker.open)picker.showModal();
  }
  document.getElementById('companion-settings').addEventListener('click',showPicker);
  pet.addEventListener('contextmenu',event=>{event.preventDefault();showPicker();});
  const assistant=dialog('YOUR CTF COMPANION','neko-help-title');assistant.id='neko-help';
  const helpBody=make('div','neko-help-body');
  const log=make('div','neko-chat');log.setAttribute('role','log');log.setAttribute('aria-label','Companion conversation');
  const say=(text,who='companion')=>{const line=make('p',`chat-${who}`,text);log.append(line);log.scrollTop=log.scrollHeight;};
  const quick=make('div','neko-quick');
  const hint=make('button','button cream','Give me a hint'),openCtf=make('button','button yellow','Open CTF'),switcher=make('button','button cream','Change companion');
  hint.addEventListener('click',()=>window.dispatchEvent(new Event('portfolio-request-hint')));
  openCtf.addEventListener('click',()=>{assistant.close();window.dispatchEvent(new Event('portfolio-open-ctf'));});
  switcher.addEventListener('click',()=>{assistant.close();showPicker();});quick.append(hint,openCtf,switcher);
  const form=make('form','tool-form');const inputLabel=make('label','','Ask about the CTF or hidden surprises');inputLabel.htmlFor='neko-question';const input=make('input');input.id='neko-question';input.placeholder='Try “hint”, “secrets”, or “roam”';input.autocomplete='off';input.maxLength=300;
  const send=make('button','button yellow','Ask companion ↗');form.append(inputLabel,input,send);
  form.addEventListener('submit',event=>{
    event.preventDefault();const raw=input.value.trim();if(!raw)return;say(raw,'visitor');input.value='';const q=raw.toLowerCase();
    if(/hint|flag|ctf|base64|decode|rot13/.test(q))window.dispatchEvent(new Event('portfolio-request-hint'));
    else if(/secret|egg|surprise/.test(q))say('Try “secrets” in the terminal, tap the Hello, world! sticker, or enter the classic ↑ ↑ ↓ ↓ ← → ← → B A sequence outside a text field.');
    else if(/roam|move|walk/.test(q)){roam();say('Ready to roam! Close this panel and move your pointer. On a phone I explore on my own.');}
    else if(/hello|hey|hi\b/.test(q))say(`Hi! I’m ${character.name}. I can give you CTF hints or help you find the portfolio’s secrets.`);
    else say('I’m a local, scripted guide. Ask for a CTF hint, secrets, or roaming help — or use the buttons above.');
  });
  helpBody.append(make('p','tool-description','A small, local guide to the puzzles and hidden surprises.'),log,quick,form);assistant.append(helpBody);
  function syncChatIdentity(){
    document.getElementById('neko-help-title').textContent=`ASK ${character.name.toUpperCase()}`;
    if(log.dataset.character!==character.id){
      log.dataset.character=character.id;
      log.replaceChildren();
      say(`Hi! I’m ${character.name}. Want a hint for the project CTFs?`);
    }
  }
  window.addEventListener('portfolio-ctf-hint',event=>say(event.detail));
  pet.addEventListener('click',event=>{if(performance.now()<suppress){event.preventDefault();return;}syncChatIdentity();assistant.showModal();});
  pet.addEventListener('pointerenter',()=>hovered=true);pet.addEventListener('pointerleave',()=>hovered=false);
  pet.addEventListener('pointerdown',event=>{
    if(!event.isPrimary||event.button!==0)return;dragging=true;moved=false;startX=event.clientX;startY=event.clientY;offsetX=x-startX;offsetY=y-startY;
    pet.setPointerCapture(event.pointerId);if(event.pointerType!=='mouse')hold=setTimeout(showPicker,550);
  });
  pet.addEventListener('pointermove',event=>{if(!dragging)return;if(Math.hypot(event.clientX-startX,event.clientY-startY)>7){moved=true;clearTimeout(hold);}if(moved){x=event.clientX+offsetX;y=event.clientY+offsetY;paint();}});
  function finish(event){clearTimeout(hold);if(dragging&&moved){parked=true;suppress=performance.now()+500;}dragging=false;if(event.type==='pointercancel')suppress=performance.now()+500;if(event.pointerType!=='mouse')hovered=false;if(pet.hasPointerCapture(event.pointerId))pet.releasePointerCapture(event.pointerId);}
  pet.addEventListener('pointerup',finish);pet.addEventListener('pointercancel',finish);pet.addEventListener('lostpointercapture',()=>{dragging=false;clearTimeout(hold);});
  pet.addEventListener('keydown',event=>{
    if(event.key==='ContextMenu'||(event.shiftKey&&event.key==='F10')){event.preventDefault();showPicker();return;}
    const delta={ArrowLeft:[-16,0],ArrowRight:[16,0],ArrowUp:[0,-16],ArrowDown:[0,16]}[event.key];
    if(delta){event.preventDefault();parked=true;x+=delta[0];y+=delta[1];paint();}
  });
  window.addEventListener('pointermove',event=>{if(event.pointerType==='touch'||dragging)return;targetX=Math.max(8,event.clientX-50);targetY=Math.max(8,event.clientY-50);lastPointer=performance.now();});
  window.addEventListener('resize',paint);window.addEventListener('neko-roam',roam);
  setInterval(()=>{
    if(document.hidden)return;frame++;
    const stopped=paused||parked||hovered||dragging||reduced.matches||!!document.querySelector('dialog[open]');
    if(!stopped&&frame%70===0&&(matchMedia('(pointer: coarse)').matches||performance.now()-lastPointer>6500)){
      targetX=12+Math.random()*Math.max(1,innerWidth-84);targetY=80+Math.random()*Math.max(1,innerHeight-200);
    }
    const dx=targetX-x,dy=targetY-y,distance=Math.hypot(dx,dy);const walking=!stopped&&distance>=12;
    let animation='idle';
    if(walking){idle=0;animation=(dy/distance<-.4?'N':dy/distance>.4?'S':'')+(dx/distance<-.4?'W':dx/distance>.4?'E':'');const speed=Math.min(distance,8);x+=dx/distance*speed;y+=dy/distance*speed;paint();}
    else {idle++;if(idle>50)animation='sleeping';}
    if(character.id==='manthan'){
      const row=walking?(animation.includes('E')||animation.includes('W')?1:animation==='N'?2:0):3;
      const col=reduced.matches||paused?0:walking?frame%4:idle>50?3:hovered?2:frame%40===0?1:0;
      sprite.style.backgroundPosition=`${col*-48}px ${row*-48}px`;sprite.style.transform=walking&&animation.includes('W')?'scaleX(-1)':'none';
    }else{const set=frames[animation]||frames.idle;const cell=set[(reduced.matches||paused?0:Math.floor(frame/(animation==='sleeping'?4:1)))%set.length];sprite.style.backgroundPosition=`${cell[0]*32}px ${cell[1]*32}px`;}
    sprite.dataset.motion=walking?'walk':animation;
  },100);
})();
