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
  b+=text(90,264,'N_min = 15',gray,19)+text(990,264,'N_max = 157',gray,19,'end');
  if(boundary!==null)b+=line(x(boundary),80,x(boundary),197,red,true)+text(x(boundary),60,'N_opt = '+boundary,red,21,'middle');
  markers.forEach((p,i)=>{const n=typeof p==='number'?p:p.n,col=p.color||teal;b+=circle(x(n),185,col,7); if(p.label)b+=line(x(n),170,x(n),125,col)+text(x(n),110,p.label,col,22,'middle');});
  if(label)b+=text(540,325,label,ink,27,'middle');
  return svg(b,'plot axis-diagram','Shared phase-gate-use axis from 15 to 157');
}
function pipeline(experiment='quantum experiment',hidden='\\phi',observations='0 1 0 0 1 …',prob='\\hat p_0',estimate='\\hat\\phi',captions=null) {
  const nodes=[[m(hidden),'unknown'],[experiment,'prepare → encode → measure'],[observations,'observations'],[m(prob),'response estimate'],[m(estimate),'inversion']];
  return `<div class="pipeline">${nodes.map(([a,b],i)=>`${i?'<span class="arrow">→</span>':''}<div class="node"><div class="${i===1?'experiment':i===0||i>2?'symbol':''}">${a}</div><div class="caption">${captions?captions[i]:b}</div></div>`).join('')}</div>`;
}
function outcomeBits(count=60) { return `<div class="outcomes">${D.bits.slice(0,count).map(v=>`<span class="bit ${v===0?'zero':''}">${v}</span>`).join('')}</div>`; }
function estimatePlot(rows,{moving=false,overshoot=false,count=rows.length}={}) {
  const max=overshoot?60:Math.max(45,...rows.map(r=>r.N));
  const c=chart({xmin:5,xmax:max,ymin:0,ymax:.08,xticks:overshoot?[5,15,31,45,60]:[5,15,25,35,45],yticks:[0,.02,.04,.06,.08],xlabel:'N · phase-gate uses',ylabel:'estimated φ (rad)'});
  let b=c.body+line(90,c.y(.05),990,c.y(.05),gray,true)+text(800,c.y(.05)-9,'true φ = 0.05',gray,18);
  if(overshoot)b+=line(c.x(31),30,c.x(31),290,red,true)+text(c.x(31)+12,51,'N_opt = 31',red,20)+text(c.x(31)+12,78,'UNKNOWN TO THE ALGORITHM',red,15);
  rows.slice(0,count).forEach(r=>b+=circle(c.x(r.N),c.y(r.estimate??r.phi_hat),r.N>31?red:teal,4.3));
  if(moving){
    b+=c.path(D.linear.probes.map((p,i)=>({N:p.N,mean:D.linear.moving_average[i]})),'N','mean',blue)+text(800,34,'moving average · w = 4',blue,18);
    const stop=c.x(D.linear.probes.at(-1).N),chosen=c.x(D.linear.N_star);
    b+=line(stop,260,chosen+10,260,red,false,3)+`<path d="M${chosen},260l12,-7v14Z" fill="${red}"/>`+text(stop,240,'STOP',red,22,'middle')+text(chosen-15,269,'backtrack · N = '+D.linear.N_star,red,21,'end');
  }
  return svg(b,'plot','Seeded phase estimates versus phase-gate uses');
}
function safeguardPlot(level=3) {
  const c=chart({xmin:15,xmax:157,xticks:[15,50,100,157],xlabel:'N · phase-gate uses',ylabel:'probability / score'});
  let b=c.body;
  if(level>=1)b+=c.path(D.safeguard.rows,'N','valid',gray,true);
  if(level>=2)b+=c.path(D.safeguard.rows,'N','accurate',blue);
  if(level>=3){b+=c.path(D.safeguard.rows,'N','success',teal); const r=D.safeguard.rows.find(r=>r.N===D.safeguard.N_star);b+=line(c.x(r.N),c.y(r.success),c.x(r.N),290,teal,true)+circle(c.x(r.N),c.y(r.success),teal,7)+text(c.x(r.N)+100,c.y(r.success)+80,'N* = '+r.N,teal,24);}
  return svg(b,'plot','Validity decreases, conditional accuracy generally increases, and the Gaussian approximate product has a discrete maximum');
}
const names={brute:'BF',linear:'LS',binary_deep:'BS',reverse_eng_risk:'RE',oracle_hl:'Oracle'};
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
  b+=text(630,348,'successful runs · |estimate − φ| &lt; ε',gray,21,'middle');
  return svg(b,'plot','Fixed-budget success rates with 95 percent Wilson confidence intervals; oracle analytic');
}
function budgetsPlot() {
  let b='';[0,10,20,30,40,50].forEach(v=>{const x=170+v*15;b+=line(x,20,x,285,'#c6d0d1',false,1)+text(x,319,v+'k',gray,18,'middle');});
  ['brute','linear','binary_deep','reverse_eng_risk'].forEach((key,i)=>{const r=D.crossings.find(r=>r.algorithm===key),y=45+i*65,x=170+.015*+r.budget_to_reach;
    b+=text(145,y+8,names[key],ink,27,'end')+line(170,y,x,y,colors[key],false,13)+line(170+.015*+r.budget_to_reach_lo,y,170+.015*+r.budget_to_reach_hi,y,ink,false,3)+text(x+20,y+8,(+r.budget_to_reach/1000).toFixed(1)+'k',colors[key],28);
  });return svg(b+text(600,347,'total phase-gate-use budget C',gray,21,'middle'),'plot','Interpolated budgets at 90 percent success with bootstrap crossing intervals');
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
  'The thesis studies phase estimation under finite resource constraints. The question today is how to choose the number of phase-gate uses per experiment. Start directly; no outline. [Sources] thesis/main-thesis.pdf, title page; thesis/03-methodology.tex.',15,{className:'title-slide'});
add('Quantum metrology: infer a hidden phase','METROLOGY',pipeline()+`<p class="center lead">${m('\\phi')} → response distribution → ${m('\\hat\\phi')}</p>`,
  'We do not read off the unknown phase. Prepare a probe, encode the parameter, measure, then infer the phase classically. Here 0 denotes the all-zero readout event, and 1 its complement. With GHZ decoding only the two relevant outcomes have support in the ideal model. The audience knows circuits; do not explain gates. If an analogy preceded this slide, point out the identical layout. Echo transition: quantum observations are probabilistic, so we first estimate a probability. [Sources] thesis/02-theory.tex; thesis/03-methodology.tex.',50);
add('A probability becomes a phase estimate','METROLOGY',states([response(15,false,1)+outcomeBits(8),response(15,false,2)+outcomeBits(20),response(15,false,3)+eq('\\hat\\phi_N=\\frac{1}{N}\\arccos\\sqrt{\\hat p_0}')]),
  'One response branch, N=15. The true phase determines p0=cos squared N phi. Repeated binary outcomes estimate p0. The horizontal guide follows the empirical fraction from 60 prerecorded outcomes (seed 1701), and the vertical guide returns the branch-inverted estimate. Rows of 8 and 20 bits preview the stream; the displayed fraction uses all 60 outcomes. All-zero event is abbreviated 0. Keep the estimator in the same place afterwards. [Sources] thesis/02-theory.tex; data/provenance.json.',70,{estimator:true});
add('More phase-gate uses, finer local resolution','MODEL',states([5,15,30].map(N=>response(N,false,-1)+`<p class="center lead">${m('N='+N)} · ${m('\\Delta\\phi=0.003')} → ${m('\\Delta p_0\\approx '+(Math.abs(Math.cos(N*.03)**2-Math.cos(N*.033)**2)).toFixed(3))}</p>`)),
  'Compare N=5,15,30. Each figure shows its first branch and its labeled phase range. The numerical probability change uses the same physical interval, phi=.030 to .033 rad. Larger N compresses the branch and improves Fisher information. The pointwise derivative is not larger everywhere: it vanishes at extrema; do not claim uniform slope growth. N means phase-gate uses, not circuit depth. [Sources] thesis/02-theory.tex.',45,{estimator:true});
add('Only the scaling we need','MODEL',`<div class="two center" style="margin-top:65px"><div><h3>Separable probes</h3>${eq('I_Q^{\\mathrm{sep}}=4N')}</div><div><h3>GHZ probes</h3>${eq('I_Q^{\\mathrm{GHZ}}=4N^2')}</div></div><div class="center">${eq('\\operatorname{Var}(\\hat\\phi)\\approx\\frac{1}{4mN^2}')}<p class="small muted">QCRB · locally regular branch · asymptotic regime</p></div>`,
  'For the thesis phase convention, QFI per repetition is 4N for independent separable probes and 4N squared for GHZ. No derivation. QCRB is a lower bound under its regularity and local unbiasedness conditions. Approximate equality describes the large-shot regular-branch estimator, not a universal finite-sample identity. Boundary readout atoms and adaptive selection matter. The noiseless sequential protocol has the same likelihood. [Sources] thesis/02-theory.tex.',40,{estimator:true});
add('One budget, two allocations','MODEL',`<div class="center">${eq('C=Nm=10{,}000')}</div><div class="two center"><div>${m('N=10,\\quad m=1000')}<div class="budget-block" style="grid-template-columns:repeat(10,1fr);grid-template-rows:repeat(10,1fr)">${'<i></i>'.repeat(100)}</div></div><div>${m('N=100,\\quad m=100')}<div class="budget-block second" style="grid-template-columns:repeat(100,1fr)">${'<i></i>'.repeat(100)}</div></div></div>${frag(`<div class="center">${eq('\\operatorname{Var}(\\hat\\phi)\\approx\\frac{1}{4CN}')}<p class="small accent">fixed C → prefer larger safe N</p></div>`,0)}`,
  'Same total number of phase-gate uses. Each strip encodes allocation schematically; it is not 10,000 individually drawn gate uses. Substituting m=C/N gives the local asymptotic variance 1/(4CN). This ignores integer rounding and assumes a valid regular branch. Larger safe N is attractive, even though repetitions decrease. [Sources] thesis/03-methodology.tex; thesis/02-theory.tex.',45,{estimator:true});
add('The catch: the response folds back','MODEL',states([response(30,false)+eq('0\\leq N\\phi\\leq\\pi/2'),(()=>{const N=30,c=chart({xmax:.22,xticks:[0,.05,.1,.15,.2]});const rows=Array.from({length:301},(_,i)=>({phi:i*.22/300,p:Math.cos(N*i*.22/300)**2}));const p=Math.cos(30*.08)**2;let b=c.body+`<rect x="${c.x(Math.PI/60)}" y="30" width="${990-c.x(Math.PI/60)}" height="260" fill="${red}" opacity=".07"/>`+c.path(rows,'phi','p')+line(90,c.y(p),990,c.y(p),red,true);for(const phi of [(Math.PI-2.4)/30,.08,(Math.PI+Math.PI-2.4)/30,(Math.PI+2.4)/30])b+=circle(c.x(phi),c.y(p),red,6);b+=line(c.x((Math.PI-2.4)/30),c.y(p),c.x((Math.PI-2.4)/30),290,red,true)+text(570,52,'same probability · several phases',red,22);return svg(b)+`<p class="center small unsafe">true φ = 0.080 → first-branch estimate ≈ 0.025</p>`;})()]),
  'At N=30, the first branch ends at pi/60≈.0524. Expanding the axis reveals periodicity. A true phase .08 produces the same probability as roughly .02472 and other phases. Our point estimator always selects the first branch. Branch safety is sufficient for this estimator; it is not a theorem that all phase-estimation methods must discard aliased observations. A full likelihood can use them jointly. [Sources] thesis/02-theory.tex.',65,{estimator:true,branch:true});
add('Walking toward an invisible boundary','MODEL',states([estimatePlot(D.overshoot,{overshoot:true,count:19}),estimatePlot(D.overshoot,{overshoot:true,count:31}),estimatePlot(D.overshoot,{overshoot:true})]),
  'True phi=.05 gives largest safe integer N_opt=31. Independent seeded binomial probes, 1000 shots each, expose aliasing as N grows. This is a calibration demonstration, not a single 10,000-budget algorithm run. Reveal points in three batches. The dashed boundary is simulation ground truth, unavailable to the algorithm. Past 31 every estimate is bounded by pi/(2N)<phi; eventual trend need not be monotone. [Sources] thesis/02-theory.tex; data/deck-data.js; data/provenance.json.',55,{estimator:true,branch:true});
add('The concrete game','MODEL',`<div class="center">${eq('\\phi\\sim\\mathcal U(0.01,0.1)\\qquad C=10{,}000')}${eq('\\epsilon=10^{-3}\\quad\u00b7\\quad |\\hat\\phi-\\phi|<\\epsilon')}</div>${axis({label:'Which N should we use?'})}`,
  'Uniform phase ensemble over .01 to .1 rad; phase is fixed within each run. A successful run has absolute error below .001 rad. Endpoints imply N_min=15 and N_max=157. N_opt is the largest safe integer for the actual phase, not a proven finite-sample optimum. The cost is sum of N_i m_i for adaptive exploration and final shots; C=Nm applies to a single allocation. [Sources] thesis/03-methodology.tex.',45,{estimator:true,scenario:true});
add('Safe for every possible phase?','ADAPTIVE N',axis({markers:[{n:15,label:'safe · conservative'}]})+frag(`<p class="center callout">Brute Force</p><p class="center small muted">${m('N=N_{\\min}=15')}</p>`,0)+frag(`<p class="center small">For φ = 0.02: largest safe N = 78</p>`,1),
  'Brute force is the thesis name for the fixed guaranteed-safe baseline. It does not exhaustively run all N. Spend every available repetition at N=15. If phi=.02 the safe boundary is 78, leaving a large gap in sensitivity. Safety does not guarantee hitting the requested error tolerance. [Sources] thesis/03-methodology.tex.',40,{estimator:true,scenario:true});
add('Could we find the hidden boundary?','ADAPTIVE N',states([axis({markers:[15],label:'How could we find this hidden boundary?'}),axis({markers:[15,16,17,18,19,20],label:'15 → 16 → 17 → 18 → …'}),axis({markers:[15,16,17,18,19,20],label:'Can we detect when we went too far?'})])+frag('<p class="center callout">Linear Search</p>',2),
  'Audience pause: how could we find the hidden boundary? Do not ask for arbitrary numerical guesses. Probe N successively and look for a falling estimate. Reveal the algorithm name after the idea. Transition: show what this detector sees under noise. [Sources] thesis/03-methodology.tex.',40,{estimator:true,scenario:true});
add('A falling moving average signals overshoot','ADAPTIVE N',states([estimatePlot(D.linear.probes,{count:12}),estimatePlot(D.linear.probes),estimatePlot(D.linear.probes,{moving:true})]),
  'Representative teaching run from the actual current linear-search implementation. Phi=.05, eight shots per probe, window w=4, lookback l=6, safeguard s=1. Stop at six consecutive falls of the moving average, backtrack six increments, then apply s. Frozen seed is selected once by a disclosed rule; it is not the tuned fixed-budget winner (that uses m prime=1,w=4,l=6,s=0). Moving-average detection is heuristic and can false alarm or miss. Retained exploration and final results are combined as implemented. [Sources] ba_thesis_sim/qmetrology/algorithms.py; data/provenance.json.',65,{estimator:true,scenario:true,source:'Seeded teaching run · 8 shots/probe · w = 4 · l = 6'});
add('What is the obvious inefficiency?','ADAPTIVE N',axis({markers:Array.from({length:55},(_,i)=>15+i),label:'Many small steps'})+frag('<p class="center callout">Binary Search</p>',0),
  'Pause for the audience. Linear search buys many nearby probes. Natural extension is binary search. Reveal name after interaction. The next slide illustrates bisection with idealized labels; the actual noisy search is recorded separately in deck-data.js. [Sources] thesis/03-methodology.tex.',35,{estimator:true,scenario:true});
add('Bisect the candidate interval','ADAPTIVE N',states([
  axis({range:[15,157],markers:[{n:86,label:'86 · overshoot',color:red}]}),
  axis({range:[15,86],markers:[{n:50,label:'50 · safe'}]}),
  axis({range:[50,86],markers:[{n:68,label:'68 · safe'}]}),
  axis({range:[68,86],markers:[{n:77,label:'77 · safe'}]}),
  axis({range:[77,86],markers:[{n:81,label:'81 · overshoot',color:red}],label:'But how do we classify a noisy probe?'})]),
  'Schematic noiseless decisions for hidden phi=.02, N_opt=78. Sequence 86→50→68→77→81 follows the current implementation midpoint rounding (rejection steps from upper probe toward L). Red means ground-truth overshoot here. In practice labels are noisy classifications, not access to phi. Keep deepest probe not classified as overshoot for the pilot. Bound contraction is cheap in number of probes, but higher-N probes cost more per shot. The statistical safeguard later considers the entire admissible range, not only the final bracket. [Sources] thesis/03-methodology.tex; ba_thesis_sim/qmetrology/algorithms.py.',70,{estimator:true,scenario:true,source:'Schematic bisection · ideal labels · hidden φ = 0.02'});
add('Do we need to search at all?','ADAPTIVE N',`<div class="center">${eq('N=15\\longrightarrow\\hat\\phi_0')}${eq('N_{\\mathrm{opt}}=\\left\\lfloor\\frac{\\pi}{2\\phi}\\right\\rfloor')}${frag(eq('N_{\\mathrm{guess}}=\\left\\lfloor\\frac{\\pi}{2\\hat\\phi_0}\\right\\rfloor'),0)}${frag('<p class="callout accent">Reverse Engineering</p>',1)}</div>`,
  'Pause: if the safe pilot already gives a phase estimate, do we need to search? N_opt is largest safe N. Substitute the estimate and obtain a raw guess. Reveal Reverse Engineering afterwards. This raw substitution motivates the shortcut; the reported current algorithm feeds the pilot directly into the statistical safeguard, not the raw guess alone. [Sources] thesis/03-methodology.tex.',55,{estimator:true,scenario:true});
add('Exploration has uncertainty too','ADAPTIVE N',`<div class="center">${eq('\\hat\\phi\\neq\\phi')}</div><div class="steps">${D.pilot_samples.map(r=>`<div class="step ${r.guess>31?'unsafe':''}">${m('\\hat\\phi='+r.estimate.toFixed(4))}<small>↓</small>${m('N_{\\mathrm{guess}}='+r.guess)}<small>${r.guess>31?'unsafe raw guess':'first-branch safe'}</small></div>`).join('')}</div><p class="center small muted">same true φ = 0.05 · N_p = 15 · 44 shots</p>${axis({markers:[{n:26,label:'RE · safeguarded N* = 26'}]})}`,
  'Explicit binomial-compatible pilot counts 20,24,26,29 out of 44 produce these estimates and raw N guesses. Illustrative possible outcomes, not a random-sample histogram. True safe limit is 31. An underestimated phase gives an unsafe N guess. Repeated pilot values produce substantial uncertainty, especially near a branch endpoint. Axis previews the safeguarded choice N*=26 for the 24/44 pilot; the following safeguard slide explains how it is calculated. This motivates a score that trades risk for precision. [Sources] data/deck-data.js; thesis/03-methodology.tex.',55,{estimator:true,scenario:true,className:'pilot-slide'});
add('Is the downward jump larger than shot noise?','ADAPTIVE N',classifier()+`<p class="center small">${m('\\phi_1=\\hat\\phi_{\\mathrm{acc}}+\\frac{\\Phi^{-1}(\\alpha)}{2N\\sqrt{m\u0027}}')}</p>`,
  'OPTIONAL CLASSIFIER. Bell curve is a Gaussian plug-in model centered at accepted estimate, not the true calibrated sampling law. Illustrative alpha=.05, sigma=.004. Lower-tail point suggests overshoot, central point could be ordinary noise. Current implementation initializes the threshold at N_min; after acceptance it recalibrates for the next candidate, after rejection it retains threshold. Reference uncertainty, branch endpoints and selection mean nominal alpha is not a guaranteed false-alarm rate. Alpha is tuned for end-to-end success; headline BS winner uses conf=.5, so alpha=.5 rather than the illustrative .05. Deepest accepted probe is selected, not guaranteed truly safe. [Sources] thesis/03-methodology.tex; ba_thesis_sim/qmetrology/algorithms.py.',70,{estimator:true,scenario:true,optional:'classifier',source:'Illustrative α = 0.05 · Gaussian plug-in approximation'});
add('Safe enough × sensitive enough','ADAPTIVE N',states([safeguardPlot(1),safeguardPlot(2),safeguardPlot(3)])+`<div class="legend"><span style="color:${gray}">– – ${m('P_{\\mathrm{valid}}')}</span><span style="color:${blue}">— ${m('P_{\\mathrm{accurate}\\mid\\mathrm{valid}}')}</span><span style="color:${teal}">— ${m('P_{\\mathrm{success}}\\approx P_{\\mathrm{valid}}P_{\\mathrm{accurate}\\mid\\mathrm{valid}}')}</span></div>`,
  `Statistical safeguard evaluated for pilot 24/44 all-zero outcomes at Np=15, remaining budget B=9340. Posterior is truncated Gaussian on [.01,.1]. Validity is probability phi≤pi/(2N) given pilot. Conditional accuracy is Gaussian approximation with floor(B/N) shots. Maximize their product over every integer N=15..157; ties choose smallest N. Small floor-induced irregularities are real. The product approximates valid-and-accurate success, treating overshot success as negligible; it is not exact total finite-shot convergence probability. RE uses safe opening pilot; BS uses deepest accepted pilot with selection uncertainty. Only this classical calculation is exhaustive, with no additional phase-gate cost. [Sources] thesis/03-methodology.tex; ba_thesis_sim/qmetrology/safeguard.py; data/provenance.json.`,80,{estimator:true,scenario:true,source:'Gaussian approximate score · fresh final shots · integer shot counts'});
add('Back to the original game','RESULTS',resultsPlot()+`<p class="center small accent">all three adaptive strategies improve over the fixed safe baseline</p>`,
  'At C=10,000 and eps=.001: BF 56.092%, LS 64.100%, BS deep 65.070%, RE risk 66.296%. Points include 95% Wilson intervals, R=50,000 independent held-out runs per algorithm/point, test seed 2024; tuning blocks 42 and 43. Frozen winner per budget from finite grids, so tuning and selection uncertainty are not included in these intervals. Oracle 73.4843% is analytic QCRB-based success approximation at omniscient N_opt, not a Monte Carlo algorithm or universal finite-shot upper bound. Outcome metric is prior-averaged absolute-error convergence, not worst-case reliability. [Sources] data/fixed-budget.csv; ba_thesis_sim/results/experiment_manifest.json.',55,{estimator:true,scenario:true,source:'50,000 held-out runs/point · 95% Wilson intervals · ◇ analytic asymptotic oracle'});
add('90% successful runs — how much budget?','RESULTS',budgetsPlot()+frag(`<p class="center callout accent">${m('C_{\\mathrm{BF}}/C_{\\mathrm{RE}}\\approx1.54\\times')} <span class="small muted">[1.51, 1.58]</span></p>`,0),
  'Same prior and eps. BF 45.9k, LS 35.5k, BS 32.4k, RE 29.8k at estimated 90% convergence. Crossings are log-linearly interpolated between tested budgets, not exact resource thresholds. Thin dark intervals are 95% run-level bootstrap crossing intervals; 2000 resamples, seed 12345. Reported ratio CI is [1.51,1.58], does not include all tuning/grid uncertainty; grid sensitivity is separately audited in source data. RE uses about 35% less budget, equivalent to a BF/RE ratio 1.54. Persistent card C=10,000 recalls starting game; this plot varies total budget to reach 90%. [Sources] data/budget-90.csv.',50,{estimator:true,scenario:true,source:'Log-linear budget crossings · 95% bootstrap intervals · tolerance unchanged'});
// SKIPPABLE IF RUNNING LONG
add('Tighter precision amortizes exploration','RESULTS',precisionPlot()+`<div class="legend"><span style="color:${teal}">LS</span><span style="color:${blue}">BS</span><span style="color:${ink}">RE</span><span class="muted">– – Oracle</span></div><p class="center small unsafe">up to ≈ 1.84× lower budget in the tested settings*</p>`,
  'SKIPPABLE IF RUNNING LONG; 10–20 second version: exploration becomes relatively cheap as final measurement gets expensive; advantage saturates. Main plotted 90% sweep reaches RE≈1.82 at eps=1e-8. The brief 1.84 headline is another tested point: eps=1e-4 at 80% reliability, CI [1.80,1.88]. It is not the maximum across every threshold (50% ratios exceed 2). Lines connect tested positive tolerances on log10 epsilon; not new observed points. Every point uses 50,000 held-out runs, bootstrap 95% ratios and interpolated crossings. Persistent C and eps card is removed because both vary here. [Sources] data/precision-sweep.csv; ba_thesis_sim/results/budget_crossings.csv.',20,{estimator:true,optional:'precision',source:'*1.84×: RE at ε = 10⁻⁴, 80% reliability · plotted sweep: 90% reliability'});
add('Cheap exploration can find a large safe N','RESULTS',axis({boundary:78,showUnsafe:true,markers:[{n:15,label:'Brute Force'},{n:65,label:'adaptive'}]})+`<p class="center lead">large safe N = efficient</p><p class="center small muted" style="margin-top:16px">unknown boundary · cheap exploration · fewer resources</p>`,
  'Resolve the opening question. Larger N improves resource efficiency within the branch. Its safe limit depends on the unknown phase. Cheap exploration and a statistical safety margin can improve ensemble-average success. Diagram is schematic for phi=.02 and does not report a measured adaptive final N=65. Gains are constant budget factors in tested ideal settings, not asymptotic separations. [Sources] thesis/04-results.tex; thesis/09-conclusion.tex.',35,{estimator:true,scenario:true});
add('Beyond a branch-inverted point estimate','RESULTS',`<div class="two outlook"><div><h3>BAYESIAN / FULL LIKELIHOOD</h3>${response(50,true)}<p>retain measurement information</p><p>update belief sequentially</p><p>use informative overshot probes</p></div><div><h3>TOWARD EXPERIMENT</h3><div style="height:210px;display:flex;align-items:center;justify-content:center;font-size:36px">probe → encode → readout</div><p>noise + decoherence</p><p>realistic execution costs</p><p>experimentally simpler protocols</p></div></div><p class="center lead accent">Questions?</p>`,
  'Left: a periodic likelihood can still inform a joint posterior when a branch-inverted estimate aliases. Do not imply one periodic measurement globally identifies phi. Right: adapt the general allocation idea to physical noise and realistic costs. A simpler separable experiment might provide a proof of concept, but the same GHZ overshoot rule and N scaling do not transfer unchanged. Ideal sequential encoding shares the GHZ likelihood; physical costs and decoherence can change rankings. This is outlook, not demonstrated experimental savings. [Sources] thesis/09-conclusion.tex; thesis/04-results.tex.',55);


export {main,m,eq,states,svg,chart,text,line,circle,pipeline,ink,teal,blue,gray};
