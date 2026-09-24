import D from './deck-data.js';
const ink = '#172d39', teal = '#007e80', blue = '#3566a6', red = '#bd414b', gray = '#5c6b73';
const m = tex => `<span class="math">${tex}</span>`;
const eq = tex => `<div class="equation">${m(tex)}</div>`;
const frag = (html, index, cls='') => `<div class="fragment ${cls}" data-fragment-index="${index}">${html}</div>`;
const text = (x,y,t,color=ink,size=21,anchor='start') => `<text x="${x}" y="${y}" fill="${color}" style="fill:${color};font-size:${size}px" text-anchor="${anchor}">${String(t).replace(/(N|P|C)_([A-Za-z]+)/g,'$1<tspan baseline-shift="sub" font-size="75%">$2</tspan>')}</text>`;
const line = (x1,y1,x2,y2,color=gray,dash=false,width=2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" ${dash?'stroke-dasharray="8 7"':''}/>`;
const circle = (x,y,color=teal,r=5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
function svg(body, cls='plot', label='Scientific figure') { return `<svg class="${cls}" viewBox="0 0 1050 350" role="img" aria-label="${label}">${body}</svg>`; }
function chart({xmin=0,xmax=1,ymin=0,ymax=1,xticks=[0,.5,1],yticks=[0,.5,1],xlabel='φ (rad)',ylabel='p₀',log=false}={}) {
  const x = v => 90+ (log ? (Math.log10(v)-Math.log10(xmin))/(Math.log10(xmax)-Math.log10(xmin)) : (v-xmin)/(xmax-xmin))*900;
  const y = v => 290-(v-ymin)/(ymax-ymin)*260;
  let body = '';
  for (const v of yticks) body+=line(90,y(v),990,y(v),'#c6d0d1',false,1)+text(76,y(v)+6,v,gray,18,'end');
  body+=line(90,30,90,290,'#8c9fa7')+line(90,290,990,290,'#8c9fa7');
  for(const v of xticks) body+=line(x(v),290,x(v),298,'#8c9fa7')+text(x(v),321,v,gray,18,'middle');
  body+=text(540,348,xlabel,gray,21,'middle')+text(18,12,ylabel,gray,21);
  return {x,y,body, path:(rows,xkey,ykey,color=teal,dash=false)=>`<path d="${rows.map((r,i)=>`${i?'L':'M'}${x(r[xkey]).toFixed(2)},${y(r[ykey]).toFixed(2)}`).join(' ')}" class="curve ${dash?'dash':''}" stroke="${color}"/>`};
}
function response(N,extended=false,guides=0) {
  const max = extended ? .22 : Math.PI/(2*N);
  const c=chart({xmax:max,xticks:extended?[0,.05,.1,.15,.2]:[0,+(max/2).toFixed(3),+max.toFixed(3)]});
  const rows=Array.from({length:301},(_,i)=>({phi:i*max/300,p:Math.cos(N*i*max/300)**2}));
  let b=c.body;
  if(extended) b+=`<rect x="${c.x(Math.PI/(2*N))}" y="30" width="${990-c.x(Math.PI/(2*N))}" height="260" fill="${red}" opacity=".07"/>`;
  b+=c.path(rows,'phi','p');
  if(guides>=1) { const phi=.05,p=Math.cos(N*phi)**2; b+=line(c.x(phi),c.y(0),c.x(phi),c.y(p),teal,true)+circle(c.x(phi),c.y(p),teal,7)+text(c.x(phi)+15,270,'φ = 0.05',teal,18); }
  if(guides>=2) { const phat=D.bits.filter(v=>v===0).length/D.bits.length; b+=line(90,c.y(phat),990,c.y(phat),blue,true)+text(850,c.y(phat)-12,'estimated p₀ = '+phat.toFixed(3),blue,19); }
  if(guides>=3) { const phat=D.bits.filter(v=>v===0).length/D.bits.length,est=Math.acos(Math.sqrt(phat))/N; b+=line(c.x(est),c.y(phat),c.x(est),290,blue,true)+circle(c.x(est),c.y(phat),blue,7)+text(c.x(est)-10,250,'estimated φ',blue,22,'end'); }
  if(guides===-1) { const a=.03,z=.033,pa=Math.cos(N*a)**2,pz=Math.cos(N*z)**2; b+=line(c.x(a),290,c.x(a),c.y(pa),blue,true)+line(c.x(z),290,c.x(z),c.y(pz),blue,true)+circle(c.x(a),c.y(pa),blue,6)+circle(c.x(z),c.y(pz),blue,6)+line(c.x(z)+20,c.y(pa),c.x(z)+20,c.y(pz),blue,false,3)+text(c.x(z)+35,(c.y(pa)+c.y(pz))/2+6,'Δp₀',blue,21); }
  return `<div class="response-view"><div class="response-formula">${m('p_0(\\phi)=\\cos^2('+N+'\\phi)')}</div>${svg(b,'plot',`Response p0 = cos squared N phi, N=${N}`)}</div>`;
}
function states(items) { return `<div class="replacement">${items.map((h,i)=>i===0?`<div class="state fragment fade-out" data-fragment-index="0">${h}</div>`:`<div class="state fragment ${i<items.length-1?'current-visible':''}" data-fragment-index="${i-1}">${h}</div>`).join('')}</div>`; }
function axis({markers=[],boundary=null,range=null,label='',showUnsafe=false}={}) {
  const x=n=>90+(n-15)/142*900;
  let b=line(90,185,990,185,'#a1afb4',false,3);
  if(range)b+=line(x(range[0]),185,x(range[1]),185,teal,false,10);
  if(showUnsafe&&boundary!==null)b+=`<rect x="${x(boundary)}" y="65" width="${990-x(boundary)}" height="180" fill="${red}" opacity=".07"/>`+text(x(boundary)+20,90,'aliasing',red);
  for(const n of [15,50,100,157])b+=line(x(n),177,x(n),194,gray)+text(x(n),229,n,gray,21,'middle');
  if(boundary!==null)b+=line(x(boundary),80,x(boundary),197,red,true)+text(x(boundary),60,'N_opt = '+boundary,red,21,'middle');
  markers.forEach((p,i)=>{const n=typeof p==='number'?p:p.n,col=p.color||teal;b+=circle(x(n),185,col,7); if(p.label)b+=line(x(n),170,x(n),125,col)+text(x(n),110,p.label,col,22,'middle');});
  if(label)b+=text(540,325,label,ink,27,'middle');
  return svg(b,'plot axis-diagram','Shared phase-gate-use axis from 15 to 157');
}
function pipeline(experiment='quantum experiment',hidden='\\phi',observations='0 1 0 0 1 …',prob='\\hat p_0',estimate='\\hat\\phi',captions=null) {
  const nodes=[[m(hidden),'unknown'],[experiment,'prepare → encode → measure'],[observations,'observations'],[m(prob),'response estimate'],[m(estimate),'inversion']];
  return `<div class="pipeline">${nodes.map(([a,b],i)=>`${i?'<span class="arrow">→</span>':''}<div class="node"><div class="node-body"><div class="${i===1?'experiment':i===0||i>2?'symbol':''}">${a}</div></div><div class="caption">${captions?captions[i]:b}</div></div>`).join('')}</div>`;
}
function outcomeBits(count=60) { return `<div class="outcomes">${D.bits.slice(0,count).map(v=>`<span class="bit ${v===0?'zero':''}">${v}</span>`).join('')}</div>`; }
// Two response branches on one axis: the same physical delta phi produces a
// larger probability change at larger N, which is why larger N estimates better.
function responseOverlay(Na=15,Nb=30,a=.03,z=.033) {
  const max=Math.PI/(2*Na);
  const c=chart({xmax:max,xticks:[0,+(max/2).toFixed(3),+max.toFixed(3)]});
  const curve=N=>Array.from({length:301},(_,i)=>({phi:i*max/300,p:Math.cos(N*i*max/300)**2}));
  let b=c.body+c.path(curve(Na),'phi','p',teal)+c.path(curve(Nb),'phi','p',blue);
  b+=line(c.x(a),290,c.x(a),40,gray,true,1.5)+line(c.x(z),290,c.x(z),40,gray,true,1.5);
  const d=[];
  for(const [N,col] of [[Na,teal],[Nb,blue]]){
    const pa=Math.cos(N*a)**2,pz=Math.cos(N*z)**2,xm=c.x(z)+22;
    b+=circle(c.x(a),c.y(pa),col,6)+circle(c.x(z),c.y(pz),col,6);
    b+=line(xm,c.y(pa),xm,c.y(pz),col,false,4)+line(c.x(z),c.y(pa),xm,c.y(pa),col,true,1.5);
    d.push([N,col,Math.abs(pa-pz).toFixed(3)]);
  }
  b+=text(c.x(a)-10,32,'\u0394\u03c6 = 0.003',gray,19,'end');
  return `<div class="response-view overlay-view"><div class="response-formula">${m('\\cos^2('+Na+'\\phi)')} vs ${m('\\cos^2('+Nb+'\\phi)')}</div>${svg(b,'plot','Response curves for N=15 and N=30 over the same phase interval')}</div>`
    +`<p class="overlay-legend">${d.map(([N,col,v])=>`<span style="color:${col}">${m('N='+N)} \u2192 ${m('\\Delta p_0\\approx '+v)}</span>`).join('')}</p>`
    +`<p class="center small accent overlay-take">same ${m('\\Delta\\phi')}, larger ${m('N')} \u2192 larger ${m('\\Delta p_0')} \u2192 more accuracy</p>`;
}
function estimatePlot(rows,{moving=false,overshoot=false,count=rows.length}={}) {
  const max=overshoot?60:Math.max(45,...rows.map(r=>r.N));
  const c=chart({xmin:5,xmax:max,ymin:0,ymax:.08,xticks:overshoot?[5,15,31,45,60]:[5,15,25,35,45],yticks:[0,.02,.04,.06,.08],xlabel:'N phase-gate uses',ylabel:'estimated φ (rad)'});
  let b=c.body+line(90,c.y(.05),990,c.y(.05),gray,true)+text(800,c.y(.05)-9,'true φ = 0.05',gray,18);
  if(overshoot)b+=line(c.x(31),30,c.x(31),290,red,true)+text(c.x(31)+12,51,'N_opt = 31',red,20)+text(c.x(31)+12,78,'UNKNOWN TO THE ALGORITHM',red,15);
  rows.slice(0,count).forEach(r=>b+=circle(c.x(r.N),c.y(r.estimate??r.phi_hat),r.N>31?red:teal,4.3));
  if(moving){
    b+=c.path(D.linear.probes.map((p,i)=>({N:p.N,mean:D.linear.moving_average[i]})),'N','mean',blue)+text(800,34,'moving average: w = 4',blue,18);
    const stop=c.x(D.linear.probes.at(-1).N),chosen=c.x(D.linear.N_star);
    b+=line(stop,260,chosen+10,260,red,false,3)+`<path d="M${chosen},260l12,-7v14Z" fill="${red}"/>`+text(stop,240,'STOP',red,22,'middle')+text(chosen-15,269,'backtrack: N = '+D.linear.N_star,red,21,'end');
  }
  return svg(b,'plot','Seeded phase estimates versus phase-gate uses');
}
function safeguardPlot(level=3) {
  const c=chart({xmin:15,xmax:157,xticks:[15,50,100,157],xlabel:'N phase-gate uses',ylabel:'probability / score'});
  let b=c.body;
  if(level>=1)b+=c.path(D.safeguard.rows,'N','valid',gray,true);
  if(level>=2)b+=c.path(D.safeguard.rows,'N','accurate',blue);
  if(level>=3){b+=c.path(D.safeguard.rows,'N','success',teal);const g=31;b+=line(c.x(g),290,c.x(g),262,gray,false,2)+text(c.x(g)+8,256,'N_guess = '+g,gray,18); const r=D.safeguard.rows.find(r=>r.N===D.safeguard.N_star);b+=line(c.x(r.N),c.y(r.success),c.x(r.N),290,teal,true)+circle(c.x(r.N),c.y(r.success),teal,7)+text(c.x(r.N)+100,c.y(r.success)+80,'N* = '+r.N,teal,24);}
  return svg(b,'plot','Validity decreases, conditional accuracy generally increases, and the Gaussian approximate product has a discrete maximum');
}
const names={brute:'Brute force (baseline)',linear:'Linear search',binary_deep:'Binary search',reverse_eng_risk:'Reverse engineering',oracle_hl:'Oracle (N_opt)'};
const colors={brute:gray,linear:teal,binary_deep:blue,reverse_eng_risk:ink,oracle_hl:gray};
function resultsPlot() {
  let b='';
  [0,20,40,60,80].forEach(v=>{const x=170+v*9;b+=line(x,20,x,290,'#c6d0d1',false,1)+text(x,320,v+'%',gray,18,'middle');});
  Object.keys(names).forEach((key,i)=>{const r=D.rates.find(r=>r.algorithm===key),y=42+i*55,x=170+900*+r.rate;
    b+=text(145,y+7,names[key],ink,26,'end');
    if(key!=='oracle_hl')b+=line(170+900*+r.rate_lo,y,170+900*+r.rate_hi,y,colors[key],false,3)+circle(x,y,colors[key],7);
    else b+=`<path d="M${x},${y-9}l9,9l-9,9l-9,-9Z" fill="none" stroke="${gray}" stroke-width="2"/>`;
    b+=text(x+25,y+7,(100*+r.rate).toFixed(1)+'%',colors[key],26);
  });
  b+=text(630,348,'successful runs: |φ^ - φ| &lt; ε',gray,21,'middle');
  return svg(b,'plot','Fixed-budget success rates with 95 percent Wilson confidence intervals; oracle analytic');
}
function budgetsPlot() {
  const base=+D.crossings.find(r=>r.algorithm==='brute').budget_to_reach;
  let b='';[0,10,20,30,40,50].forEach(v=>{const x=170+v*15;b+=line(x,20,x,285,'#c6d0d1',false,1)+text(x,319,v+'k',gray,18,'middle');});
  ['brute','linear','binary_deep','reverse_eng_risk'].forEach((key,i)=>{const r=D.crossings.find(r=>r.algorithm===key),y=45+i*65,x=170+.015*+r.budget_to_reach;
    b+=text(145,y+8,names[key],ink,27,'end')+line(170,y,x,y,colors[key],false,13)+line(170+.015*+r.budget_to_reach_lo,y,170+.015*+r.budget_to_reach_hi,y,ink,false,3)+text(x+20,y+8,(+r.budget_to_reach/1000).toFixed(1)+'k',colors[key],28)+(key==='brute'?'':text(x+118,y+8,'('+(+r.budget_to_reach/base).toFixed(2)+'x)',gray,22));
  });return svg(b+text(600,347,'total budget C=Nm',gray,21,'middle'),'plot','Interpolated budgets at 90 percent success with bootstrap crossing intervals');
}
function precisionPlot() {
  const c=chart({xmin:1e-8,xmax:1e-3,ymin:1,ymax:2,xticks:[1e-8,1e-7,1e-6,1e-5,1e-4,1e-3],yticks:[1,1.25,1.5,1.75,2],xlabel:'ε · absolute phase tolerance (rad) · logarithmic scale',ylabel:'C_BF / C_method at 90%',log:true});
  let b=c.body;
  for(const key of ['linear','binary_deep','reverse_eng_risk','oracle_hl']){
    const rows=D.sweep.filter(r=>r.algorithm===key).sort((a,b)=>+a.eps-+b.eps);
    b+=c.path(rows,'eps','ratio_vs_brute',colors[key],key==='oracle_hl');
    for(const r of rows){const x=c.x(+r.eps),y=c.y(+r.ratio_vs_brute);if(key!=='oracle_hl')b+=line(x,c.y(+r.ratio_lo),x,c.y(+r.ratio_hi),colors[key],false,2);b+=circle(x,y,colors[key],5);}
  }
  b+=text(105,45,'tighter precision ←',gray,18);
  return svg(b,'plot','Budget advantage at 90 percent success for tested precisions with bootstrap ratio intervals');
}
function classifier() {
  const c=chart({xmin:.032,xmax:.065,ymin:0,ymax:1.1,xticks:[.035,.04,.045,.05,.055,.06,.065],yticks:[],xlabel:'candidate phase estimate (rad)',ylabel:'Gaussian plug-in model'});
  const rows=Array.from({length:250},(_,i)=>{const p=.032+.033*i/249;return {p,v:Math.exp(-.5*((p-.05)/.004)**2)};});
  const tail=rows.filter(r=>r.p<=.04342);
  let b=c.body+`<path d="M${c.x(.032)},290 ${tail.map(r=>`L${c.x(r.p)},${c.y(r.v)}`).join(' ')} L${c.x(tail.at(-1).p)},290Z" fill="${red}" opacity=".2"/>`+c.path(rows,'p','v',gray);
  b+=line(c.x(.05),c.y(1),c.x(.05),290,gray,true)+text(c.x(.05),25,'accepted estimate',ink,20,'middle')+circle(c.x(.048),c.y(.1),blue,8)+text(c.x(.048)+12,c.y(.2),'plausible noise',blue,22)+circle(c.x(.038),c.y(.1),red,8)+text(c.x(.038)-10,c.y(.3),'likely overshoot',red,22,'middle');
  return svg(b,'plot','Illustrative 5 percent lower tail of Gaussian classifier, not guaranteed frequentist calibration');
}
const main=[];
function add(title,section,body,notes,seconds,opts={}) { main.push({title,section,body,notes,seconds,...opts}); }
add('',null,`<h1>Evaluating adaptive quantum<br>metrology protocols<br>under resource constraints</h1><p class="question">How large should ${m('N')} be?</p><p class="author">Tobias Steindl</p><p class="affiliation">JKU Linz · Institute for Integrated Circuits and Quantum Computing</p>`,
  '',15,{className:'title-slide'});
add('Fisher information and the QCRB','MODEL',`<div class="two center" style="margin-top:34px"><div><h3>Separable probes</h3>${eq('I_Q^{\\mathrm{sep}}=4N')}</div><div><h3>GHZ probes</h3>${eq('I_Q^{\\mathrm{GHZ}}=4N^2')}</div></div><div class="center qcrb"><h3>Quantum Cramér–Rao bound</h3>${eq('\\operatorname{Var}(\\hat\\phi)\\geq\\frac{1}{m\\,I_Q^{\\mathrm{GHZ}}}=\\frac{1}{4mN^2}')}<p class="small">for ${m('m')} independent measurement repetitions</p>${frag(`<p class="center lead accent">${m('\\operatorname{Var}(\\hat\\phi)\\approx\\frac{1}{4mN^2}')} — attained by our estimator at large ${m('m')}</p>`,0)}</div>`,
  '',45,{estimator:true});
add('Monte-Carlo check: error and variance versus shots','MODEL',`<img class="verify-figure" src="/assets/thesis/all_plots3.png" alt="Absolute error and sample variance against the number of shots m for N=8, 15 and 30, separable and entangled, with the QCRB overlaid">`,
  '',35);
add('Monte-Carlo check: the estimator breaks at the branch edge','MODEL',`<img class="verify-figure" src="/assets/thesis/na_over_N_3.png" alt="Absolute error and variance against the number of phase gates N at fixed m=500, showing the entangled estimator breaking down beyond N phi = pi/2">`,
  '',35);
add('One budget, two allocations','MODEL',`<div class="center">${eq('C=Nm=10{,}000')}</div><div class="two center"><div>${m('N=10,\\quad m=1000')}<div class="budget-block" style="grid-template-columns:repeat(10,1fr);grid-template-rows:repeat(10,1fr)">${'<i></i>'.repeat(100)}</div></div><div>${m('N=100,\\quad m=100')}<div class="budget-block second" style="grid-template-columns:repeat(100,1fr)">${'<i></i>'.repeat(100)}</div></div></div>${frag(`<div class="center">${eq('\\operatorname{Var}(\\hat\\phi)\\approx\\frac{1}{4mN^2}\\;\\;')}<p class="small accent">fixed C → prefer larger N</p></div>`,0)}`,
  '"A fixed budget requires us to find a tradeoff between N and m."',45,{estimator:true});
add('The catch: the risk of overshooting (aliasing)','MODEL',(()=>{const N=30,c=chart({xmax:.22,xticks:[0,.05,.1,.15,.2],ylabel:'p₀ = cos²(Nφ)'});const rows=Array.from({length:301},(_,i)=>({phi:i*.22/300,p:Math.cos(N*i*.22/300)**2}));const p=Math.cos(30*.08)**2;let b=c.body+`<rect x="${c.x(Math.PI/60)}" y="30" width="${990-c.x(Math.PI/60)}" height="260" fill="${red}" opacity=".07"/>`+c.path(rows,'phi','p')+line(90,c.y(p),990,c.y(p),red,true);for(const phi of [(Math.PI-2.4)/30,.08,(Math.PI+Math.PI-2.4)/30,(Math.PI+2.4)/30])b+=circle(c.x(phi),c.y(p),red,6);b+=line(c.x((Math.PI-2.4)/30),c.y(p),c.x((Math.PI-2.4)/30),290,red,true)+text(570,52,'same probability · several phases',red,22);return svg(b)+`<p class="center small unsafe">true φ = 0.080 → first-branch estimate ≈ 0.025</p>`+`<p class="center lead">a random ${m('N')} makes ${m('\\hat p_0^{(N)}')} useless for reconstructing ${m('\\phi')}</p>`+`<p class="center callout unsafe">we must keep ${m('N\\phi\\leq\\pi/2')}</p>`;})(),
  '"A random N means the measured p0 does not allow us to correctly reconstruct phi by phi-hat."\n\nWe NEED to adhere to N phi <= pi/2.',45,{estimator:true,branch:true,className:'catch-slide'});
add('Walking toward an invisible boundary','MODEL',states([estimatePlot(D.overshoot,{overshoot:true,count:19}),estimatePlot(D.overshoot,{overshoot:true,count:31}),estimatePlot(D.overshoot,{overshoot:true})])+frag(`<p class="center lead">why? ${m('\\hat\\phi_{\\mathrm{ent}}=\\tfrac1N\\arccos\\sqrt{\\hat p_0}\\xrightarrow[N\\to\\infty]{}0')}</p>`,2),
  'Why? (1/N) arccos sqrt(p0-hat) --> 0 as N --> infinity.',45,{estimator:true,branch:true,className:'walk-slide'});
add('The task','MODEL',`<ul class="task-list"><li>from now on: the <b>entangled</b> protocol with ${m('N')} phase gates</li><li>given ${m('\\phi\\sim\\mathcal U(0.01,0.1)')}, find ${m('\\hat\\phi')} with ${m('|\\phi-\\hat\\phi|\\leq\\epsilon=10^{-3}')} <span class="tag accent">“convergence”</span></li><li>on a budget of ${m('C=Nm=10{,}000')} — ${m('N')} phase gates, ${m('m')} shots</li></ul>`,
  '',70,{estimator:true,scenario:true,figure:'BranchBounds',clicks:4,className:'task-slide'});
add('Recap: choosing N adaptively','ADAPTIVE N',`<div class="recap"><p>${m('N\\phi\\leq\\pi/2')} ⇒ only ${m('N\\leq N_{\\mathrm{opt}}=\\lfloor\\pi/(2\\phi)\\rfloor')} is usable</p><p>a fixed budget ${m('C=Nm')} rewards the largest ${m('N')} we can get away with</p><p class="recap-punch accent">we do not know ${m('N_{\\mathrm{opt}}')} — and we really must not overshoot it</p></div>`,
  'We do not know N_opt, but we really need to avoid overshooting it.',30,{estimator:true,scenario:true});
add('Safe for every possible phase?','ADAPTIVE N',axis({markers:[{n:15,label:'safe · conservative'}]})+frag(`<p class="center callout">Brute Force</p><p class="center small muted">${m('N=N_{\\min}=15')}</p>`,0)+frag(`<p class="center small">for ${m('\\phi=0.02')}: largest safe ${m('N')} is 78 ${m('=:N_{\\mathrm{opt}}')}</p>`,1)+frag(`<ul class="beat-list"><li>the baseline algorithm — no exploration at all</li><li>from now on: <b>guess</b> ${m('N_{\\mathrm{opt}}')}, then spend the rest at ${m('N_{\\mathrm{guess}}\\approx N_{\\mathrm{opt}}')}</li></ul>`,2),
  'Baseline algorithm.\n\nFrom now on: building on the GHZ protocol, try to guess N_opt in an exploration phase and use the remaining budget to guess using N_guess approx N_opt.',45,{estimator:true,scenario:true,className:'brute-slide'});
add('Could we find the hidden boundary?','ADAPTIVE N',states([axis({markers:[15],label:'How could we find this hidden boundary?'}),axis({markers:[15,16,17,18,19,20],label:'15 → 16 → 17 → 18 → …'}),axis({markers:[15,16,17,18,19,20],label:'Can we detect when we went too far?'})])+frag('<p class="center callout">Linear Search</p>',2),
  '',40,{estimator:true,scenario:true});
add('A falling moving average signals overshoot','ADAPTIVE N',states([estimatePlot(D.linear.probes,{count:12}),estimatePlot(D.linear.probes),estimatePlot(D.linear.probes,{moving:true})]),
  '',65,{estimator:true,scenario:true,source:''});
add('What is the obvious inefficiency?','ADAPTIVE N',axis({markers:Array.from({length:55},(_,i)=>15+i),label:'Many small steps'})+frag('<p class="center callout">Binary Search</p>',0),
  '',35,{estimator:true,scenario:true});
add('Bisect the candidate interval','ADAPTIVE N',states([
  axis({range:[15,157],markers:[{n:86,label:'86 · overshoot',color:red}]}),
  axis({range:[15,86],markers:[{n:50,label:'50 · safe'}]}),
  axis({range:[50,86],markers:[{n:68,label:'68 · safe'}]}),
  axis({range:[68,86],markers:[{n:77,label:'77 · safe'}]}),
  axis({range:[77,86],markers:[{n:81,label:'81 · overshoot',color:red}],label:'But how do we classify a noisy probe?'})]),
  '',70,{estimator:true,scenario:true,source:''});
add('One detector does not fit both searches','ADAPTIVE N','',
  '',40,{estimator:true,scenario:true,figure:'SearchErrorEvolution',clicks:2});
add('A one-shot overshoot criterion','ADAPTIVE N',`<div class="center"><p class="lead accent" style="margin-top:10px!important">theory to the rescue</p><p class="small muted" style="margin-top:34px">Delta method: for large enough ${m('m')}</p>${eq('\\hat\\phi_N\\;\\approx\\;\\mathcal N\\!\\left(\\phi,\\tfrac{1}{4mN^2}\\right)')}${frag(`<p class="small muted" style="margin-top:30px">but ${m('\\phi')} is what we are after - plug in a safe, high-shot pilot ${m('\\hat\\phi_p')}</p>`+eq('\\hat\\phi_N\\;\\approx\\;\\mathcal N\\!\\left(\\hat\\phi_p,\\tfrac{1}{4mN^2}\\right)'),0)}</div>`,
  'Galton board!!!\n\nTheory to the rescue.',45,{estimator:true,scenario:true,clicks:1});
add('Reject the probes that fall too far','ADAPTIVE N','',
  '',50,{estimator:true,scenario:true,figure:'OneShotCriterion',clicks:3,figureProps:{probes:[{N:16,hits:14},{N:30,hits:0},{N:36,hits:1}],shots:30,caption:'N = 36 is only five past the safe depth — and the estimate has already collapsed'}});
add('Do we need to search at all?','ADAPTIVE N',`<div class="center">${eq('N=15\\longrightarrow\\hat\\phi_0')}${eq('N_{\\mathrm{opt}}=\\left\\lfloor\\frac{\\pi}{2\\phi}\\right\\rfloor')}${frag(eq('N_{\\mathrm{guess}}=\\left\\lfloor\\frac{\\pi}{2\\hat\\phi_0}\\right\\rfloor'),0)}${frag('<p class="callout accent">Reverse Engineering</p>',1)}</div>`,
  'Assumes again phi0-hat approx phi.',55,{estimator:true,scenario:true});
add('Problem: exploration has uncertainty too','ADAPTIVE N',`<p class="center small muted" style="margin-top:6px">the ${m('N_{\\mathrm{guess}}')} that exploration hands over is itself an estimate</p>`,
  'The N_guess returned by the BS / RE exploration phase may have overshot.\n\nNeed to take a few steps back from N_guess.\n\nBut how many?',45,{estimator:true,figure:'GuessQuality',clicks:1});
add('Statistical safeguard','ADAPTIVE N',states([safeguardPlot(1),safeguardPlot(2),safeguardPlot(3)])+`<div class="legend"><span style="color:${gray}">– – ${m('P_{\\mathrm{valid}}')}</span><span style="color:${blue}">— ${m('P_{\\mathrm{accurate}\\mid\\mathrm{valid}}')}</span><span style="color:${teal}">— ${m('P_{\\mathrm{success}}\\approx P_{\\mathrm{valid}}P_{\\mathrm{accurate}\\mid\\mathrm{valid}}')}</span></div>`+`<div class="safeguard-defs"><p>${m('P_{\\mathrm{valid}}^{(N)}=\\mathbb P(N\\phi\\leq\\pi/2)')}</p><p>${m('P_{\\mathrm{acc}}^{(N)}=\\mathbb P(|\\phi-\\hat\\phi_N|<\\epsilon\\mid N\\phi\\leq\\pi/2)')}</p><p>maximize ${m('P_{\\mathrm{valid}}\\cdot P_{\\mathrm{acc}}')} over every admissible ${m('N')}</p><p class="punch">analytic expression ⇒ no quantum cost</p></div>`,
  'Need to maximize P_valid * P_acc.\n\nAnalytic expression => no QC!',55,{estimator:true,scenario:true});
add('Did the safeguard work?','RESULTS',`<p class="center small muted" style="margin-top:4px">median ${m('N/N_{\\mathrm{opt}}')} and share of runs past ${m('N_{\\mathrm{opt}}')}, before and after the safeguard</p><table class="diag-table"><thead><tr><th></th><th colspan="2">raw guess</th><th colspan="2">after safeguard</th><th>converged</th></tr><tr><th></th><th>median</th><th>past ${m('N_{\\mathrm{opt}}')}</th><th>median</th><th>past ${m('N_{\\mathrm{opt}}')}</th><th>given safe</th></tr></thead><tbody><tr><td>Linear search</td><td>0.99</td><td>5.5%</td><td>0.94</td><td class="good">1.2%</td><td>62.3%</td></tr><tr><td>Binary search</td><td>0.90</td><td>5.6%</td><td>0.96</td><td class="good">0.7%</td><td>63.3%</td></tr><tr><td>Reverse engineering</td><td>1.00</td><td class="bad">23.9%</td><td>0.96</td><td class="good">0.7%</td><td>63.9%</td></tr></tbody></table><p class="center small accent" style="margin-top:22px">binary search is pushed deeper, reverse engineering pulled back — both land just under ${m('N_{\\mathrm{opt}}')}</p>`,
  'Tables from the paper showing how well the safeguard worked.',40,{estimator:true,className:'diag-slide'});
add('Back to the original game','RESULTS',resultsPlot()+`<p class="center small accent"></p>`,
  '',55,{estimator:true,scenario:true,source:'50,000 held-out runs/point · 95% Wilson intervals'});
add('90% successful runs — how much budget?','RESULTS',budgetsPlot()+frag(`<p class="center small muted"></p>`,0),
  '',40,{estimator:true,scenario:true});
// SKIPPABLE IF RUNNING LONG
add('Tighter precision amortizes exploration','RESULTS',`<img class="verify-figure" style="max-height:430px" src="/assets/thesis/fig_precision.png" alt="Budget advantage over brute force for each adaptive strategy as the precision requirement tightens, with the analytic oracle">`+`<ul class="beat-list" style="max-width:1010px"><li>baseline takes up to ${m('\\approx1.84\\times')} more budget in tested settings</li><li>coming within ${m('\\approx2\\%')} of the oracle at ${m('\\epsilon=10^{-8}')} (${m('\\approx82\\%')} of its advantage at ${m('\\epsilon=10^{-3}')})</li></ul>`,
  '',35,{estimator:true,scenario:true,className:'precision-slide'});
add('Further work','RESULTS',`<div class="two outlook"><div><h3>BAYESIAN / FULL LIKELIHOOD</h3>${response(50,true)}<ul class="outlook-list"><li>a Bayesian view lets us <b>update a belief</b> instead of inverting once</li><li>current setting: an overshot probe has to be <b>discarded</b></li><li>in a Bayesian setting it can be <b>re-used</b> through the likelihood</li></ul></div><div><h3>TOWARD EXPERIMENT</h3><div style="height:210px;display:flex;align-items:center;justify-content:center;font-size:32px;color:var(--muted)">noise · decoherence · realistic costs</div><ul class="outlook-list"><li>a GHZ state is <b>hard to prepare</b> in the lab — squeezed states are usually used</li><li>test the adaptive protocols on a <b>separable backbone</b> and compare to squeezed states</li></ul></div></div>`,
  '',45);
add('Summary','RESULTS',`<ul class="summary-list"><li>Adaptive algorithms on top of maximally entangled GHZ protocol<ul><li>Brute Force — baseline</li><li>Linear Search — walk up until moving average falls</li><li>Binary Search — bisect, one-shot overshoot criterion</li><li>Reverse Engineering — invert one safe pilot</li></ul></li><li>Results: RE reaches ${m('90\\%')} convergence on ${m('0.65\\times')} the brute-force budget, ${m('\\approx82\\%')} of the omniscient oracle's advantage<ul><li>tighter precision reduces this further to ${m('\\approx0.55\\times')}, within ${m('\\approx2\\%')} of the oracle</li></ul></li></ul><p class="thanks">Thank you for your attention!</p>`,
  '',35);


// Slides pulled out of the main talk but kept available as backup material,
// rendered the same way as the opening modules (see openings.js).
const backup=[
  ['A probability becomes a phase estimate',states([response(15,false,1)+outcomeBits(8),response(15,false,2)+outcomeBits(20),response(15,false,3)+eq('\\hat\\phi_{\\mathrm{ent}}=\\frac{1}{N}\\arccos\\sqrt{\\hat p_0}'),responseOverlay()]),''],
];

export {main,backup,m,eq,states,svg,chart,axis,text,line,circle,pipeline,ink,teal,blue,gray};
