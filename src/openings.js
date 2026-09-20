// Every entry is an independent three-slide opening, outside the main talk clock.
export function buildOpeningModules({m,eq,states,svg,chart,text,line,circle,pipeline,ink,teal,blue,gray}) {
  const assets='/assets/openings/';
  const image=(file,alt,cls='')=>`<img class="opening-image ${cls}" src="${assets+file}" alt="${alt}">`;
  const cookie=(index=2,cls='')=>`<div class="cookie ${cls}" role="img" aria-label="${['Pale','Golden','Toasted amber','Very dark brown'][index]} standardized chocolate-chip cookie" style="background-position:${index*100/3}% center"></div>`;
  const caption='<p class="opening-footnote muted">illustrative response · fixed conditions</p>';
  const photoSource='[Sources] assets/openings/provenance.json; locally stored illustrative food images, not experimental data.';
  const scientificSource='[Sources] elementary response model or geometry stated on slide; openings.js. Schematic, not measured calibration data.';
  const diagram=(body,label)=>`<svg class="illustration opening-illustration" viewBox="0 0 1100 420" role="img" aria-label="${label}">${body}</svg>`;
  function ovenScene() {
    return `<div class="opening-scene">${image('oven.png','Open oven with broken temperature display and a cookie on a tray','oven-art')}<div class="opening-prompt"><div class="hero">${m('T=?')}</div><p>broken display</p><div class="opening-rule"></div><p>same cookie</p><p class="accent">exactly 5 min</p></div></div>`;
  }
  function bridge({hidden,probe,observed,law,inferred,note,equation=''}) {
    return `<div class="analogy-bridge">${pipeline(probe,hidden,observed,law,inferred,['hidden quantity','known probe','observable effect','known response','inferred quantity'])}</div>${equation?`<div class="center opening-inference">${eq(equation)}</div>`:''}${note?`<p class="center opening-takeaway accent">${note}</p>`:''}`;
  }
  function calibration({kind,step=0}) {
    const conf={
      cookie:{xmin:140,xmax:220,xticks:[150,170,190,210],xlabel:'T · oven temperature (°C)',ylabel:'browning B(T)',value:190,f:t=>1/(1+Math.exp(-(t-180)/15)),formula:'B(T)'},
      pumpkin:{xmin:0,xmax:1,xticks:[0,.25,.5,.75,1],xlabel:'s · oil concentration (relative units)',ylabel:'darkness A(s)',value:.6,f:s=>.15+.7*s,formula:'A(s)'},
      ice:{xmin:0,xmax:30,xticks:[0,10,20,30],xlabel:'T · room temperature (°C)',ylabel:'remaining ice fraction M(T)',value:20,f:t=>.95-.03*t,formula:'M(T)'}
    }[kind];
    const c=chart({...conf,ymin:0,ymax:1,yticks:[0,.5,1]});
    const rows=Array.from({length:201},(_,i)=>{const x=conf.xmin+i*(conf.xmax-conf.xmin)/200;return {x,y:conf.f(x)};});
    const p=conf.f(conf.value),xx=c.x(conf.value),yy=c.y(p);
    let b=c.body+c.path(rows,'x','y',teal)+text(985,14,'assumed response law',gray,17,'end');
    if(step>=1)b+=line(90,yy,xx,yy,blue,true)+circle(xx,yy,blue,7)+text(975,yy-14,'observed response',blue,20,'end');
    if(step>=2)b+=line(xx,yy,xx,290,blue,true)+text(xx+15,270,kind==='pumpkin'?'estimated s':'estimated T',blue,22);
    return svg(b,'plot opening-calibration',`${conf.ylabel}: schematic monotone response with horizontal observation and vertical inverse mapping`).replace('viewBox="0 0 1050 350"','viewBox="0 -20 1050 390"');
  }
  function inversion(kind) { return states([0,1,2].map(step=>calibration({kind,step}))); }
  function cube(x,y,size=90) {
    const d=size*.25;
    return `<g><path d="M${x},${y}l${d},${-d}h${size}l${-d},${d}Z" fill="#e7f5f9" stroke="${blue}" stroke-width="2"/><path d="M${x+size},${y}l${d},${-d}v${size}l${-d},${d}Z" fill="#93c4d8" stroke="${blue}" stroke-width="2"/><rect x="${x}" y="${y}" width="${size}" height="${size}" fill="#c6e5ef" stroke="${blue}" stroke-width="2"/></g>`;
  }
  function roomScene(stage=0) {
    let b=`<path d="M180 115L440 20L700 115V325H180Z" fill="#e8ece8" stroke="${ink}" stroke-width="3"/>`;
    b+=`<rect x="555" y="170" width="95" height="155" rx="3" fill="#afbbb9" stroke="${ink}" stroke-width="2"/><path d="M585 245v-22a17 17 0 0134 0v22" fill="none" stroke="${ink}" stroke-width="5"/><rect x="580" y="242" width="43" height="34" rx="4" fill="${ink}"/>`;
    b+=text(390,150,'T = ?',ink,68,'middle')+text(895,105,'locked room',gray,28,'middle');
    if(stage===0)b+=text(895,165,'no direct reading',gray,24,'middle');
    else if(stage===1){b+=cube(285,215,78)+text(895,180,'same ice cube',gray,26,'middle')+text(895,232,'10 min',teal,37,'middle')+line(70,255,260,255,blue,true,3);}
    else b+=`<ellipse cx="862" cy="300" rx="87" ry="14" fill="#c6e5ef"/>`+cube(815,236,55)+text(855,185,'fraction remaining: 0.35',blue,23,'middle')+line(710,250,790,250,blue,true,3);
    return diagram(b,'Locked room with hidden temperature; fixed-time ice exposure and a retrieved smaller cube');
  }
  function soupScale() {
    let b='';
    const colors=['#ef9829','#c88728','#a27827','#766725','#465522'];
    colors.forEach((color,i)=>{const x=125+i*205;b+=`<ellipse cx="${x}" cy="78" rx="81" ry="27" fill="${color}"/><path d="M${x-83} 77Q${x-68} 150 ${x} 150Q${x+68} 150 ${x+83} 77" fill="#e5e8e2" stroke="${gray}" stroke-width="2"/>`+text(x,189,(i*.25).toFixed(2),gray,21,'middle');});
    return `<svg class="soup-scale" viewBox="0 0 1100 215" role="img" aria-label="Schematic soup appearance grows darker as relative oil concentration increases">${b+text(1080,207,'s →',gray,21,'end')}</svg>`;
  }
  function echoScene(stage=0) {
    let b=circle(140,190,ink,22)+line(140,215,140,305,ink,false,5)+line(140,240,95,265,ink,false,4)+line(140,240,185,265,ink,false,4);
    b+=`<rect x="870" y="75" width="48" height="235" fill="#a1b0ad"/><rect x="750" y="40" width="240" height="310" fill="#d9e1dc" opacity=".28"/>`+text(880,365,'hidden reflector',gray,24,'middle');
    b+=line(185,95,870,95,gray,true)+text(535,75,'d = ?',ink,52,'middle')+text(390,400,'known sound speed c',gray,24,'middle');
    if(stage>=1)b+=line(200,160,865,160,teal,false,4)+`<path d="M865 160l-18,-10v20Z" fill="${teal}"/>`+text(490,142,'outgoing pulse',teal,25,'middle')+(stage===1?`<circle r="9" fill="${teal}"><animateMotion begin="indefinite" dur="0.9s" fill="freeze" path="M200 160L855 160"/></circle>`:'');
    if(stage>=2)b+=line(865,260,205,260,blue,true,4)+`<path d="M205 260l18,-10v20Z" fill="${blue}"/>`+text(490,305,'return delay Δt',blue,27,'middle')+`<circle r="9" fill="${blue}"><animateMotion begin="indefinite" dur="1.3s" fill="freeze" path="M855 160L855 260L210 260"/></circle>`;
    return diagram(b,'Echo travels to the hidden reflector and back; distance is inferred from round-trip delay');
  }
  function shadowScene(stage=0) {
    // Level ground, α=45°: h=L=260 schematic units.
    let b=line(100,320,960,320,gray,false,4)+`<rect x="255" y="60" width="70" height="260" fill="${ink}"/><rect x="110" y="210" width="115" height="110" fill="#d9e1dc"/>`;
    for(let i=0;i<6;i++)b+=line(115+i*18,210,115+i*18,320,gray,false,2);
    b+=circle(285,20,'#d7aa3e',18)+text(445,65,'h = ?',ink,55,'middle')+text(720,90,'known sun angle',gray,24);
    b+=line(300,35,585,320,'#b49a55',false,3);
    if(stage>=1)b+=line(325,317,585,317,ink,false,12)+line(325,345,585,345,blue,true,2)+text(455,380,'shadow length L',blue,27,'middle');
    if(stage>=2)b+=line(325,60,325,320,teal,true,3)+`<path d="M553 320A32 32 0 00562 297" fill="none" stroke="${teal}" stroke-width="2"/>`+text(527,296,'α',teal,27)+text(348,196,'h',teal,27);
    return diagram(b,'Inaccessible object height and shadow form a right triangle on level ground with known sun elevation angle');
  }
  function sunAngleScene(stage=0) {
    // Known vertical gnomon height h=220 and a 45° illustrative solar elevation.
    let b=line(100,320,960,320,gray,false,4)+`<rect x="275" y="100" width="50" height="220" fill="${ink}"/>`;
    b+=circle(285,20,'#d7aa3e',18)+text(475,78,'α = ?',ink,55,'middle');
    b+=line(255,100,255,320,teal,true,2)+line(245,100,265,100,teal)+line(245,320,265,320,teal)+text(235,218,'known h',teal,25,'end');
    if(stage>=1)b+=line(325,317,545,317,ink,false,12)+line(325,350,545,350,blue,true,2)+text(435,382,'measured L',blue,27,'middle');
    if(stage>=2)b+=line(305,80,545,320,'#b49a55',false,3)+`<path d="M510 320A35 35 0 00520 295" fill="none" stroke="${teal}" stroke-width="3"/>`+text(488,292,'α',teal,28);
    return diagram(b,'Known-height vertical gnomon and its measured shadow infer the unknown solar elevation angle');
  }
  const modules={
    'cookie-reference':[
      ['The oven display is broken',ovenScene(),'Unknown oven temperature. One standardized cookie goes in for exactly five minutes; recipe and exposure time are held fixed. No direct thermometer reading. '+photoSource],
      ['Which reference cookie matches?',`<div class="mystery-cookie">${cookie(2)}<div><p>mystery cookie</p><p class="muted small">same recipe · 5 min</p></div></div><div class="cookie-reference-row">${[150,170,190,210].map((t,i)=>`<div class="cookie-reference">${cookie(i)}<p>${t}°C</p>${i===2?'<div class="fragment reference-match" data-fragment-index="0"></div>':''}</div>`).join('')}</div>`,'Reference cookies labeled 150,170,190,210 °C illustrate comparison-based inference. Mystery cookie matches the 190 °C appearance. These labels are illustrative examples, not measured baking data or a precise thermometer calibration. Same recipe and bake time are essential assumptions. '+photoSource],
      ['Compare response → infer temperature',bridge({hidden:'T',probe:cookie(2,'bridge-cookie')+'<span>cookie · 5 min</span>',observed:'browning',law:'\\mathrm{references}',inferred:'\\hat T\\approx190^{\\circ}\\mathrm C',note:'compare response → infer temperature'}),'The reference library turns observed browning into an approximate temperature estimate. This is comparison-based, not a claimed analytic invertible law. Point to the same five-column layout used by the quantum metrology slide next. There we must estimate a probability from repeated binary observations before inversion. '+photoSource],
    ],
    'cookie-law':[
      ['A cookie probes the hidden temperature',ovenScene(),'Same broken-display oven, standardized cookie, exactly five minutes. This version assumes a known monotone browning law B(T), instead of a reference library. '+photoSource],
      ['Browning → invert the response',`<div class="opening-response"><div class="response-object">${cookie(2)}${eq('B(T)')}<p class="small muted">same recipe · 5 min</p></div><div>${inversion('cookie')}</div></div>${caption}`,'Assumed sigmoid browning law on the displayed 140–220 °C range. In this schematic law observed B(190)≈0.661 maps back to T=190 °C. Reveal response curve, horizontal observation, then vertical inferred temperature. No physical cookie thermometer or globally invertible baking law is claimed; saturation and nuisance variables are outside this illustration. '+photoSource+' '+scientificSource],
      ['Observe effect → invert response',bridge({hidden:'T',probe:cookie(2,'bridge-cookie')+'<span>cookie · 5 min</span>',observed:'browning',law:'B(T)',inferred:'\\hat T',note:'observe effect → invert response',equation:'\\hat T=B^{-1}(B_{\\mathrm{obs}})'}),'The response law bridges hidden temperature and visible cookie browning. Use the identical five-node flow to transition into phase, quantum experiment, outcomes, probability estimate, inferred phase. The analogy uses a scalar appearance response; quantum outcomes require repeated observations. '+photoSource+' '+scientificSource]
    ],
    'pumpkin-oil':[
      ['Pumpkin soup. Hidden pumpkin seed oil.',`<div class="opening-scene pumpkin-scene">${image('pumpkin-soup-oil.png','Orange pumpkin soup with dark green Styrian pumpkin seed oil pouring from a bottle','pumpkin-art')}<div class="opening-prompt"><div class="hero">${m('s=?')}</div><p>pumpkin seed oil</p><p class="accent">Styria · Austria</p></div></div>`,'Local Styrian pumpkin seed oil in pumpkin soup. Unknown concentration s cannot be recovered simply by unmixing the soup. We use visible appearance, not tasters, yes/no votes or a probabilistic oil judgment. '+photoSource],
      ['Visible appearance → hidden ingredient',`<div class="pumpkin-response">${soupScale()}${inversion('pumpkin')}</div>`,'The bowls are a schematic appearance scale from orange toward dark olive as relative oil concentration grows. Assumed darkness A(s)=0.15+0.7s, so observed A=.57 maps to s=.60 relative units. Fixed recipe, mixing and illumination are necessary for any real appearance calibration. The visual color scale is illustrative and not experimental concentration data. No taster or probabilistic response is used. '+scientificSource],
      ['Appearance reveals the amount',bridge({hidden:'s',probe:image('pumpkin-soup-oil.png','Pumpkin soup and pumpkin seed oil','bridge-photo')+'<span>pumpkin soup</span>',observed:'appearance',law:'A(s)',inferred:'\\hat s',note:'hidden ingredient → visible appearance → infer amount',equation:'\\hat s=A^{-1}(A_{\\mathrm{obs}})'}),'Final five-node layout matches the actual metrology pipeline. Oil concentration controls an observable appearance response under an assumed monotone law. Next: the unknown phase instead controls an outcome probability. '+photoSource+' '+scientificSource]
    ],
    ice:[
      ['A temperature behind a locked door',roomScene(),'Unknown locked-room temperature. We cannot enter or read a thermometer, but can insert and retrieve a probe through a hatch. The schematic door remains locked. '+scientificSource],
      ['Ice in → ten minutes → ice out',states([roomScene(1),roomScene(2)]),'Expose an identical ice cube for exactly ten minutes, then retrieve it and observe fraction remaining. The example returns 0.35 of the initial ice mass; rendered cube side shrinks by approximately the cube root of 0.35, preserving a volume-based comparison. This is a schematic fixed-time experiment, not a heat-transfer simulation. '+scientificSource],
      ['Remaining ice → infer temperature',`<div class="opening-response"><div class="response-object"><svg class="ice-readout" viewBox="400 50 250 250" role="img" aria-label="Retrieved ice cube">${cube(430,100,100)}</svg>${eq('M(T)')}<p class="small muted">fraction remaining</p></div><div>${inversion('ice')}</div></div><div class="compact-bridge">${bridge({hidden:'T',probe:'ice · 10 min',observed:'remaining ice',law:'M(T)',inferred:'\\hat T',note:''})}</div>`,'Assumed remaining-ice response decreases with temperature: M(T)=.95-.03T on 0–30 °C. Observed fraction .35 maps to 20 °C. This local working range is monotone and nonsaturated. Fixed ice geometry, exposure, airflow and humidity are required for physical calibration; do not derive heat transfer. Final compact five-node layout previews the quantum pipeline. '+scientificSource]
    ],
    echo:[
      ['A distance we cannot see',echoScene(),'Hidden reflector at unknown distance. A pulse can reach it although direct sight or access is unavailable. Homogeneous propagation and known sound speed c are assumed. '+scientificSource],
      ['Send a pulse. Time the echo.',states([echoScene(1),echoScene(2)]),'Deterministic prerecorded outgoing and return paths illustrate a round trip; animations represent process, not calibrated propagation speed. Measure delay Δt of the reflection from the intended target. '+scientificSource],
      ['Echo delay → infer distance',bridge({hidden:'d',probe:'sound pulse',observed:m('\\Delta t'),law:'\\Delta t=2d/c',inferred:'\\hat d',note:'observe delay → infer distance',equation:'\\hat d=\\frac{c\\,\\widehat{\\Delta t}}{2}'}),'Round-trip distance is 2d, so Δt=2d/c and d_hat=c times estimated delay /2. Known propagation speed, target association, and negligible extra latency are assumptions; no arbitrary numerical speed is needed. Next quantum metrology slide uses the same layout, but single outcomes are probabilistic and we first estimate a probability. '+scientificSource]
    ],
    shadow:[
      ['A height beyond direct reach',shadowScene(),'Tall object beyond a fence, inaccessible for a direct height measurement. Sun elevation angle alpha above level ground is known, alpha between zero and pi/2. Parallel rays are assumed. '+scientificSource],
      ['Measure the shadow on the ground',states([shadowScene(1),shadowScene(2)]),'Reveal ground shadow, then the right triangle. Height is vertical and L is measured horizontally from the foot of the object to the shadow tip; the fence does not block the shadow. The illustration uses a 45-degree ray, h=L, as drawn. The sun icon denotes illumination schematically; the drawn ray sets the geometric angle. '+scientificSource],
      ['Known geometry → infer height',bridge({hidden:'h',probe:'sun angle '+m('\\alpha'),observed:m('L'),law:'L=h/\\tan\\alpha',inferred:'\\hat h',note:'measure shadow → infer height',equation:'\\hat h=\\hat L\\tan\\alpha'}),'With sun elevation alpha, tan alpha=h/L, so L=h/tan alpha and h_hat=L_hat tan alpha. This requires level ground and a vertical object; terrain, diffuse shadow edges and angular uncertainty are omitted from this schematic. Final flow shares the quantum pipeline layout. '+scientificSource]
    ],
    'sun-angle':[
      ['What is the Sun’s elevation?',sunAngleScene(),'The hidden quantity is now the solar elevation angle alpha. Use a vertical gnomon of known height h on level ground; do not look at or access the Sun directly. Parallel rays and a well-defined shadow edge are assumed. '+scientificSource],
      ['A known pole turns angle into length',states([sunAngleScene(1),sunAngleScene(2)]),'Measure the horizontal shadow length L, then reveal the right triangle and angle alpha. The drawing uses alpha=45 degrees and h=L for visual simplicity. In a real measurement, the pole must be vertical and the ground level. '+scientificSource],
      ['Shadow length → infer Sun angle',bridge({hidden:'\\alpha',probe:'known height '+m('h'),observed:m('L'),law:'L=h/\\tan\\alpha',inferred:'\\hat\\alpha',note:'known probe → visible response → infer angle',equation:'\\hat\\alpha=\\arctan\\!\\left(\\frac{h}{\\hat L}\\right)'}),'Since tan alpha=h/L, a known height and measured shadow length give alpha_hat=arctan(h/L_hat). This is physically founded and structurally close to metrology: a hidden angle controls an observable response that is inverted. The quantum case replaces deterministic length by an estimated outcome probability. '+scientificSource]
    ]
  };
  return modules;
};
