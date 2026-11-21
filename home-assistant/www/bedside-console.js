/* Bedside Console 1.6.0 — local Home Assistant custom card, no dependencies. */
class BedsideConsole extends HTMLElement {
  setConfig(config) {
    this.config = {
      shelf: 'light.YOUR_SHELF_ENTITY',
      corner: 'light.YOUR_CORNER_MASTER_ENTITY',
      corner_color: 'light.YOUR_CORNER_COLOUR_ENTITY',
      ...config
    };
    if (this.isConnected) this.mount();
  }
  set hass(hass) { this._hass = hass; this.update(); }
  getCardSize() { return 1; }
  connectedCallback() { this.mount(); }
  disconnectedCallback() { this.unmount(); }
  mount() {
    if (!this.config || this.overlay || new URLSearchParams(location.search).has('bedside_edit')) return;
    this.overlay = document.createElement('div');
    this.overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:#080a0e;';
    this.root = this.overlay.attachShadow({mode:'open'});
    this.root.innerHTML = `
      <style>
        :host{color-scheme:dark}*{box-sizing:border-box}button,input{font:inherit}button{cursor:pointer;-webkit-tap-highlight-color:transparent}
        .screen{height:100vh;height:100dvh;width:100%;overflow:hidden;background:radial-gradient(ellipse at 100% 0%,#1d202b 0%,#0b0d12 42%,#080a0e 80%);color:#f3f1eb;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:clamp(16px,3.2vw,48px);display:grid;grid-template-columns:1fr 1.03fr;grid-template-rows:1fr auto;gap:clamp(14px,2.8vw,40px);position:relative}
        .clock-area{display:flex;flex-direction:column;justify-content:center;min-width:0;padding-bottom:2vh}
        .eyebrow{font-size:clamp(10px,1.15vw,16px);font-weight:600;letter-spacing:.3em;color:#a7a6a2;display:flex;align-items:center;gap:12px}.dot{width:6px;height:6px;border-radius:100%;background:#d9ac6e;box-shadow:0 0 18px #d9ac6e44}
        .time{font-size:clamp(64px,14.2vw,230px);font-weight:300;font-variant-numeric:tabular-nums;letter-spacing:-.075em;line-height:1.08;margin:22px 0 12px -6px;white-space:nowrap}
        .date{font-size:clamp(14px,1.9vw,28px);letter-spacing:-.02em;color:#c5c2bb}.subdate{font-size:clamp(10px,1.1vw,15px);color:#626976;margin-top:10px;letter-spacing:.14em;text-transform:uppercase}
        .lights{display:flex;flex-direction:column;justify-content:center;gap:clamp(12px,2.2vh,22px);min-width:0;padding-top:8px}
        .light{border:1px solid #ffffff0e;border-radius:22px;padding:clamp(14px,2vw,28px);background:#ffffff04}.light-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px}.light-name{font-size:clamp(15px,1.6vw,24px);font-weight:500;letter-spacing:-.02em}.brightness{font-size:clamp(12px,1.25vw,18px);color:#c3a379;font-variant-numeric:tabular-nums;margin-top:5px}
        .power{border:1px solid #ffffff15;background:#ffffff07;color:#b0b3bb;border-radius:50%;width:clamp(36px,4.5vw,54px);height:clamp(36px,4.5vw,54px);display:grid;place-items:center;flex-shrink:0}.power.on{background:#d5ac7320;border-color:#d5ac7340;color:#e8bf87}.power svg{width:20px;height:20px}
        input[type=range]{width:100%;height:28px;margin:0;appearance:none;background:transparent;touch-action:pan-y;cursor:pointer;display:block}input[type=range]::-webkit-slider-runnable-track{height:5px;border-radius:8px;background:linear-gradient(to right,#d5ac73 0%,#d5ac73 var(--fill),#ffffff15 var(--fill),#ffffff15 100%)}input[type=range]::-moz-range-track{height:5px;border-radius:8px;background:#ffffff15}input[type=range]::-moz-range-progress{height:5px;background:#d5ac73}input[type=range]::-webkit-slider-thumb{appearance:none;width:18px;height:18px;margin-top:-6.5px;background:#f1d5ae;border-radius:100%;box-shadow:0 0 0 5px #d5ac7310}input[type=range]::-moz-range-thumb{width:18px;height:18px;background:#f1d5ae;border:0;border-radius:100%}
        .lamp-details{display:flex;align-items:center;gap:8px}.lamp-mode{border:1px solid #ffffff20;border-radius:6px;padding:2px 7px;background:#ffffff08;color:#c3a379;font-size:10px;line-height:1.2}.lamp-details .brightness{margin-top:0}
        .lamp{border:1px solid #ffffff0e;border-radius:18px;padding:clamp(10px,1.5vw,20px) clamp(14px,2vw,28px);background:#ffffff04}.lamp .light-top{margin:0}.lamp .brightness{font-size:12px}
        .scenes{grid-column:1/-1;display:grid;grid-template-columns:repeat(7,1fr);gap:clamp(8px,1.2vw,18px)}.scene{border:1px solid #ffffff10;background:#ffffff04;color:#aeb3bd;border-radius:18px;min-width:0;min-height:clamp(72px,16vh,116px);padding:12px 5px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px;transition:background .15s,border-color .15s,color .15s}.scene svg{width:clamp(20px,2.4vw,30px);height:clamp(20px,2.4vw,30px);color:var(--accent,#c1ac8e)}.scene span{font-size:clamp(11px,1.2vw,16px);font-weight:500;white-space:nowrap}.scene.active{background:#d5ac7315;border-color:#d5ac7355;color:#efdbbf}.scene:active,.power:active{transform:scale(.97)}button:focus-visible,input:focus-visible{outline:2px solid #e0b87c;outline-offset:4px}button:disabled{opacity:.45;cursor:wait}
        .tools{position:absolute;top:12px;right:16px;display:flex;gap:5px}.tool{background:transparent;border:0;color:#626976;width:34px;height:30px;display:grid;place-items:center;border-radius:8px}.tool:hover{color:#e4d8c5;background:#ffffff09}.tool svg{width:16px;height:16px}.notice{position:absolute;bottom:7px;left:50%;transform:translateX(-50%);font-size:11px;color:#e9ae8e;white-space:nowrap;max-width:90%;overflow:hidden;text-overflow:ellipsis}.offline .dot{background:#d98d72}.offline .power,.offline .scene,.offline input{opacity:.45}
        .screen.dim{background:#000;cursor:pointer}.screen.dim .tools,.screen.dim .lights,.screen.dim .scenes,.screen.dim .eyebrow,.screen.dim .date,.screen.dim .subdate,.screen.dim .notice{display:none}.screen.dim .clock-area{position:absolute;left:50%;top:50%;transform:translate(calc(-50% + var(--shift-x,0px)),calc(-50% + var(--shift-y,0px)));align-items:center;padding:0;pointer-events:none}.screen.dim .time{color:#453725;font-size:min(28vw,70vh);margin:0;font-weight:300}
        @media(orientation:landscape){
          .screen{padding:clamp(10px,3vh,28px) clamp(16px,3vw,42px);column-gap:clamp(16px,3vw,40px);row-gap:10px;grid-template-rows:minmax(0,1fr) clamp(52px,17vh,100px)}
          .clock-area{min-height:0;padding:0}.time{font-size:min(14vw,35vh);margin:10px 0 8px}.date{font-size:clamp(12px,1.8vw,24px)}.subdate{margin-top:7px;font-size:clamp(9px,1vw,13px)}
          .lights{display:grid;grid-template-columns:minmax(0,1fr);width:100%;justify-self:stretch;justify-content:stretch;justify-items:stretch;margin:0;grid-template-rows:repeat(3,minmax(0,1fr));min-height:0;gap:8px;padding:26px 0 0;align-content:stretch}
          .light{width:100%;justify-self:stretch;margin:0;min-height:0;display:grid;grid-template-columns:minmax(76px,.65fr) minmax(70px,1fr) 34px;align-items:center;column-gap:12px;padding:8px 12px;border-radius:15px}
          .light-top{display:contents}.light-top>div{grid-column:1;grid-row:1;min-width:0}.light-name{font-size:clamp(12px,1.45vw,21px);line-height:1.2}.brightness{font-size:clamp(10px,1.1vw,15px);margin-top:3px}
          .power{grid-column:3;grid-row:1;width:34px;height:34px}.power svg{width:17px;height:17px}.light input{grid-column:2;grid-row:1;min-width:0;height:32px}
          .scenes{min-height:0;gap:8px}.scene{min-height:0;height:100%;padding:6px 4px;gap:5px;border-radius:13px}.scene svg{width:clamp(18px,2.3vw,28px);height:clamp(18px,2.3vw,28px)}.scene span{font-size:clamp(10px,1.15vw,15px)}.tools{top:3px;right:10px}
        }
        @media(orientation:portrait){.screen{grid-template-columns:1fr;grid-template-rows:1fr auto auto;padding:28px 22px;gap:22px}.clock-area{align-items:center;padding:0}.time{font-size:25vw;margin:12px 0}.date{font-size:19px}.lights{gap:12px}.light{padding:16px 20px}.light-name{font-size:19px}.brightness{font-size:14px}.scenes{grid-template-columns:repeat(3,1fr);gap:9px}.scene{min-height:76px}.scene span{font-size:12px}.eyebrow{font-size:11px}.subdate{font-size:11px}}
      </style>
      <main class="screen" aria-label="Bedside lighting dashboard">
        <div class="tools"><button class="tool dim-clock" aria-label="Dim clock for sleep" title="Dim clock"></button><button class="tool fullscreen" aria-label="Enter full screen" title="Full screen"></button><button class="tool exit" aria-label="Exit bedside display" title="Exit to Home Assistant"></button></div>
        <section class="clock-area"><div class="eyebrow"><span class="dot"></span> BEDSIDE</div><div class="time" aria-label="Current time"></div><div class="date"></div><div class="subdate"></div></section>
        <section class="lights" aria-label="Brightness controls"></section>
        <section class="scenes" aria-label="Lighting scenes"></section><div class="notice" role="status" aria-live="polite"></div>
      </main>`;
    const paths={
      music:'M9 18V5l12-3v13 M9 8l12-3 M9 18a3 3 0 1 1-3-3c1.7 0 3 1.3 3 3 M21 15a3 3 0 1 1-3-3c1.7 0 3 1.3 3 3',
      power:'M12 2v10 M5.64 5.64a9 9 0 1 0 12.72 0',
      sun:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M12 2v2 M12 20v2 M2 12h2 M20 12h2 M5 5l1.5 1.5 M17.5 17.5L19 19 M5 19l1.5-1.5 M17.5 6.5L19 5',
      cinema:'M3 8h18v13H3z M3 8V3h18v5 M7 3l3 5 M14 3l3 5',
      ambient:'M3 17h18 M5 21h14 M6 13a6 6 0 0 1 12 0 M12 2v2 M3 6l2 2 M21 6l-2 2',
      night:'M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11z',
      rainbow:'M3 20v-3a9 9 0 0 1 18 0v3 M7 20v-3a5 5 0 0 1 10 0v3 M11 20v-3a1 1 0 0 1 2 0v3',
      expand:'M8 3H3v5 M16 3h5v5 M3 16v5h5 M21 16v5h-5',
      exit:'M10 3H4v18h6 M9 12h12 M17 8l4 4-4 4'
    };
    const icon=(name)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]}"/></svg>`;
    this.root.querySelector('.dim-clock').innerHTML=icon('night');
    this.root.querySelector('.dim-clock').onclick=(event)=>{event.stopPropagation();this.setDim(true);};
    this.root.querySelector('.screen').onclick=()=>{if(this.dim)this.setDim(false);};
    this.root.querySelector('.fullscreen').innerHTML=icon('expand');
    this.root.querySelector('.exit').innerHTML=icon('exit');
    this.root.querySelector('.fullscreen').onclick=async()=>{
      try{
        if(document.fullscreenElement)await document.exitFullscreen();
        else await this.overlay.requestFullscreen();
      }catch{
        this.message('Use Full screen in Android Companion App settings.');
      }
    };
    this.root.querySelector('.exit').onclick=()=>{
      const u=new URL(location.href);
      u.searchParams.set('bedside_edit','1');
      location.assign(u.href);
    };
    for(const [key,label] of [
      ['shelf','Shelf'],
      ['corner','Corner'],
      ...(this.config.lamp?[['lamp','Bedside lamp']]:[])
    ]){
      const el=document.createElement('article');
      el.className='light';
      el.dataset.key=key;
      el.innerHTML=`<div class="light-top"><div><div class="light-name">${label}</div><div class="brightness">Connecting</div></div><button class="power" aria-label="Toggle ${label.toLowerCase()} light">${icon('power')}</button></div><input type="range" min="0" max="100" step="1" aria-label="${label} brightness">`;
      if(key==='lamp'&&this.config.lamp_white){
        const reading=el.querySelector('.brightness');
        const details=document.createElement('div');
        details.className='lamp-details';
        reading.replaceWith(details);
        details.append(reading);
        const mode=document.createElement('button');
        mode.className='lamp-mode';
        mode.onclick=()=>this.lampMode();
        details.append(mode);
      }
      el.querySelector('.power').onclick=()=>this.controlLight(key,'toggle');
      const range=el.querySelector('input');
      range.oninput=()=>{
        range.style.setProperty('--fill',range.value+'%');
        el.querySelector('.brightness').textContent=range.value==='0'?'Off':range.value+'%';
      };
      range.onchange=()=>this.controlLight(
        key,
        Number(range.value)?'turn_on':'turn_off',
        Number(range.value)?{brightness_pct:Number(range.value)}:{}
      );
      this.root.querySelector('.lights').append(el);
    }
    this.looks=[
      ['Warm','sun',102,[255,160,55,180],'Solid','#e6bd82'],
      ['Cinema','cinema',26,[100,30,255,0],'Solid','#b4a0df'],
      ['Ambient','ambient',51,[255,75,20,0],'Solid','#d9a18e'],
      ['Night','night',5,[255,25,0,0],'Solid','#8fa2bd'],
      ['Day','sun',255,[255,160,55,180],'Solid','#e6bd82'],
      ['Music','music',89,null,null,'#7fcdd6'],
      ['All off','power',0,null,null,'#8d929d']
    ];
    this.looks.forEach((look,i)=>{
      const b=document.createElement('button');
      b.className='scene';
      b.style.setProperty('--accent',look[5]);
      b.innerHTML=icon(look[1])+`<span>${look[0]}</span>`;
      b.onclick=()=>this.scene(i);
      this.root.querySelector('.scenes').append(b);
    });
    document.body.append(this.overlay);
    this.timer=setInterval(()=>{this.schedule();this.clock();this.update();},1000);
    try{this.dim=localStorage.getItem('bedside-dim-clock')==='true';}
    catch{this.dim=false;}
    this.setDim(this.dim);
    this.schedule();
    this.clock();
    this.update();
  }
  schedule(){
    const start=this.config?.night_start,end=this.config?.night_end;
    if(!/^\d{2}:\d{2}$/.test(start||'')||!/^\d{2}:\d{2}$/.test(end||''))return;
    const minutes=(v)=>{
      const [h,m]=v.split(':').map(Number);
      return h<24&&m<60?h*60+m:NaN;
    };
    const a=minutes(start),b=minutes(end);
    if(!Number.isFinite(a)||!Number.isFinite(b)||a===b)return;
    const timeZone=this._hass?.config?.time_zone||Intl.DateTimeFormat().resolvedOptions().timeZone;
    const now=new Intl.DateTimeFormat('en-GB',{
      hour:'2-digit',minute:'2-digit',hourCycle:'h23',timeZone
    }).format(new Date());
    const n=minutes(now),inWindow=a<b?n>=a&&n<b:n>=a||n<b;
    if(!this._hass)return;
    const required=this.config.night_lights||[];
    const night=inWindow&&required.every(id=>this._hass.states?.[id]?.state==='off');
    if(this.nightPeriod!==night){
      this.nightPeriod=night;
      this.setDim(night);
    }
  }
  setDim(on){
    this.dim=Boolean(on);
    if(!this.root)return;
    const screen=this.root.querySelector('.screen');
    screen.classList.toggle('dim',this.dim);
    screen.setAttribute(
      'aria-label',
      this.dim?'Dim clock. Tap anywhere to restore lighting controls.':'Bedside lighting dashboard'
    );
    try{localStorage.setItem('bedside-dim-clock',String(this.dim));}catch{}
    this.clock();
  }
  unmount(){
    clearInterval(this.timer);
    this.overlay?.remove();
    this.overlay=null;
    this.root=null;
  }
  clock(){
    if(!this.root)return;
    const d=new Date();
    const minute=Math.floor(d.getTime()/60000);
    this.root.querySelector('.screen').style.setProperty('--shift-x',((minute%5)-2)*6+'px');
    this.root.querySelector('.screen').style.setProperty('--shift-y',((Math.floor(minute/5)%5)-2)*6+'px');
    const timeZone=this._hass?.config?.time_zone||Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.root.querySelector('.time').textContent=new Intl.DateTimeFormat('en-GB',{
      hour:'2-digit',minute:'2-digit',hourCycle:'h23',timeZone
    }).format(d);
    this.root.querySelector('.date').textContent=new Intl.DateTimeFormat('en-GB',{
      weekday:'long',day:'numeric',month:'long',timeZone
    }).format(d);
    this.root.querySelector('.subdate').textContent=new Intl.DateTimeFormat('en-GB',{
      year:'numeric',timeZone
    }).format(d)+' · BEDROOM LIGHTING';
  }
  update(){
    if(!this.root)return;
    let offline=!this._hass;
    for(const el of this.root.querySelectorAll('.light')){
      const state=this._hass?.states[this.config[el.dataset.key]];
      const unavailable=!state||['unavailable','unknown'].includes(state.state);
      offline=offline||unavailable;
      const on=state?.state==='on';
      const value=on?Math.round((state.attributes.brightness??255)*100/255):0;
      const range=el.querySelector('input');
      const toggle=el.querySelector('.power');
      toggle.classList.toggle('on',on);
      toggle.setAttribute('aria-pressed',String(on));
      toggle.disabled=unavailable;
      range.disabled=unavailable;
      const mode=el.querySelector('.lamp-mode');
      if(mode){
        const white=state?.attributes.color_mode==='color_temp';
        mode.textContent=white?'Colour':'White';
        mode.setAttribute('aria-label',white?'Switch bedside lamp to colour mode':'Switch bedside lamp to white mode');
        mode.disabled=unavailable;
      }
      if(this.root.activeElement!==range){
        range.value=String(value);
        range.style.setProperty('--fill',value+'%');
        el.querySelector('.brightness').textContent=unavailable?'Unavailable':on?value+'%':'Off';
      }
    }
    this.root.querySelector('.screen').classList.toggle('offline',offline);
  }
  message(text){
    if(this.root)this.root.querySelector('.notice').textContent=text;
  }
  async call(domain,service,data){
    if(!this._hass){
      this.message('Waiting for Home Assistant');
      return false;
    }
    try{
      await this._hass.callService(domain,service,data);
      this.message('');
      return true;
    }catch(e){
      this.message(e.message||'Could not reach the light');
      return false;
    }
  }
  async lampMode(){
    const state=this._hass?.states[this.config.lamp];
    if(!state)return;
    const colour=state.attributes.color_mode==='color_temp';
    const rgb=this.looks[this.activeLook??0]?.[3]?.slice(0,3)||[255,160,55];
    await this.call('light','turn_on',{
      entity_id:this.config.lamp,
      brightness:state.attributes.brightness||102,
      ...(colour?{rgb_color:rgb}:{color_temp_kelvin:2700})
    });
  }
  async controlLight(key,service,data={}){
    if(key==='shelf'||key==='corner'){
      const entity=key==='shelf'
        ?'select.YOUR_SHELF_LIVE_OVERRIDE'
        :'select.YOUR_CORNER_LIVE_OVERRIDE';
      if(!await this.call('select','select_option',{entity_id:entity,option:'1'}))return;
      this.activeLook=null;
      this.root.querySelectorAll('.scene').forEach(button=>button.classList.remove('active'));
    }
    return this.call('light',service,{entity_id:this.config[key],...data});
  }
  async scene(i){
    const name=this.looks[i][0];
    const scripts={
      Warm:'bedside_warm',
      Cinema:'bedside_cinema',
      Ambient:'bedside_ambient',
      Night:'bedside_night',
      Day:'bedside_day',
      Music:'bedside_music',
      'All off':'bedside_all_off'
    };
    if(name==='Music'&&!this._hass?.states?.['script.bedside_music']){
      this.message('Music mode is not available yet');
      return;
    }
    const ok=await this.call('script',scripts[name],{});
    if(ok){
      this.activeLook=i;
      this.root.querySelectorAll('.scene').forEach(
        (button,index)=>button.classList.toggle('active',index===i)
      );
    }
  }
}
if(!customElements.get('bedside-console')){
  customElements.define('bedside-console',BedsideConsole);
}
window.customCards=window.customCards||[];
window.customCards.push({
  type:'bedside-console',
  name:'Bedside Console',
  description:'Full-screen landscape bedside clock and WLED controls'
});
