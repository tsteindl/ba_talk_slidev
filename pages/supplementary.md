---
layout: center
class: supplement supplement-divider
---

<div class="supp-tag">SUPPLEMENT</div>

# Backup slides

<p>algorithms · theoretical results · complete numerical tables</p>

<!--
The main talk ends before this divider. Continue only in response to questions.
[Sources] Thesis Chapters 2–4; exact source excerpts and generated tables are preserved under sources/.
-->

---
class: supplement
---

<div class="supp-tag">SUPPLEMENT · ALGORITHMS</div>

# Four strategies, one exploitation stage

<div class="algorithm-map">
  <div><b>Brute force</b><span>fixed safe N<sub>min</sub></span></div>
  <div><b>Linear search</b><span>walk until estimates fall</span></div>
  <div><b>Binary search</b><span>classify midpoint probes</span></div>
  <div><b>Reverse engineering</b><span>infer N from one pilot</span></div>
</div>

<div class="common-tail"><MathEq tex="\text{explore}\;\longrightarrow\;N^*\;\longrightarrow\;m=\lfloor B_{\rm rem}/N^*\rfloor\;\longrightarrow\;\hat\phi" /></div>

<!--
All evaluated algorithms ultimately spend the remaining budget on a fresh final estimate. Binary Search and Reverse Engineering use the statistical safeguard; Linear Search uses its configured fixed backoff.
[Sources] sources/algorithms.tex; thesis/03-methodology.tex.
-->

---
class: supplement
---

<div class="supp-tag">SUPPLEMENT · ALGORITHM</div>

# Brute force: guarantee the first branch

<div class="algo-flow">
  <div><small>prior upper bound</small><MathEq tex="\phi_{\max}" /></div><i>→</i>
  <div><small>safe choice</small><MathEq tex="N_{\min}=\left\lfloor\frac{\pi}{2\phi_{\max}}\right\rfloor" /></div><i>→</i>
  <div><small>all shots</small><MathEq tex="m=\left\lfloor\frac{C}{N_{\min}}\right\rfloor" /></div><i>→</i>
  <div><small>estimate</small><MathEq tex="\hat\phi=\operatorname{Simulate}(N_{\min},m)" /></div>
</div>

<p class="backup-callout">zero exploration cost · globally conservative</p>

<!--
This is the exact decision structure of Algorithm 1. It guarantees branch validity for every phase in the prior range but cannot exploit easier instances.
[Sources] sources/algorithms.tex, alg:brute-force.
-->

---
class: supplement
---

<div class="supp-tag">SUPPLEMENT · ALGORITHM</div>

# Linear search: detect a sustained decline

<div class="algo-steps">
  <div><b>1</b><span>start at N<sub>min</sub></span></div>
  <div><b>2</b><span>probe with m′ shots</span></div>
  <div><b>3</b><span>update moving average</span></div>
  <div><b>4</b><span>count consecutive decreases</span></div>
  <div><b>5</b><span>backtrack and apply s</span></div>
</div>

<div class="algorithm-rule"><MathEq tex="i\geq l\quad\Longrightarrow\quad N\leftarrow N-l\,\mathrm{inc},\qquad N^*=N-s" /></div>

<p class="backup-callout">simple signal · potentially many probes</p>

<!--
The active implementation can average the last w estimates before applying the l-step decrease rule. Every exploration call is charged to the budget.
[Sources] sources/algorithms.tex, alg:linear-search; thesis/03-methodology.tex.
-->

---
class: supplement
---

<div class="supp-tag">SUPPLEMENT · ALGORITHM</div>

# Binary search: retain the deepest accepted probe

<div class="binary-layout">
  <div class="algo-steps vertical">
    <div><b>1</b><span>pilot at N<sub>min</sub></span></div>
    <div><b>2</b><span>probe midpoint of [L,U]</span></div>
    <div><b>3</b><span>compare the phase estimate with threshold φ₁</span></div>
    <div><b>4</b><span>shrink interval; update deepest accepted probe</span></div>
  </div>
  <div class="decision-rule">
    <div><MathEq tex="\hat\phi_N\lt\phi_1" /><small>classify overshoot · move U down</small></div>
    <div><MathEq tex="\hat\phi_N\geq\phi_1" /><small>accept · store the estimate and N</small></div>
  </div>
</div>

<p class="backup-callout">final safeguard uses the deepest probe not classified as overshot</p>

<!--
The threshold is recomputed after every accepted probe. The retained probe is data-selected, so the later Gaussian safeguard is explicitly a plug-in approximation rather than an exact confidence guarantee.
[Sources] sources/algorithms.tex, alg:binary-search; thesis/03-methodology.tex.
-->

---
class: supplement
---

<div class="supp-tag">SUPPLEMENT · ALGORITHM</div>

# Reverse engineering: one pilot, no search

<div class="algo-flow reverse-flow">
  <div><small>safe pilot</small><MathEq tex="\hat\phi_0\leftarrow\operatorname{Simulate}(N_{\min},m')" /></div><i>→</i>
  <div><small>pilot variance</small><MathEq tex="\sigma_0^2=\frac{1}{4m'N_{\min}^2}" /></div><i>→</i>
  <div><small>statistical safeguard</small><MathEq tex="N^*=\arg\max_N P_{\rm valid}^{(N)}P_{\rm acc}^{(N)}" /></div>
</div>

<div class="naive-rule"><span>naive plug-in value</span><MathEq tex="N_{\rm guess}=\left\lfloor\frac{\pi}{2\hat\phi_0}\right\rfloor" /></div>
<p class="backup-callout">one exploration batch · uncertainty handled before exploitation</p>

<!--
The evaluated procedure does not directly exploit the naive plug-in N_guess. It supplies the pilot and its working variance to the statistical safeguard, which searches all admissible integer N.
[Sources] sources/algorithms.tex, alg:reverse-engineering; thesis/03-methodology.tex.
-->

---
class: supplement
---

<div class="supp-tag">SUPPLEMENT · SHARED SUBROUTINE</div>

# Statistical safeguard: score every admissible $N$

<div class="safeguard-grid">
  <div><small>remaining shots</small><MathEq tex="m(N)=\lfloor B/N\rfloor" /></div>
  <div><small>valid branch</small><MathEq tex="P_{\rm valid}^{(N)}=F_{\hat\phi_p,\sigma_p^2;[a,b]}\!\left(\frac{\pi}{2N}\right)" /></div>
  <div><small>target precision</small><MathEq tex="P_{\rm acc}^{(N)}=1-2\Phi\!\left(-\frac{\epsilon}{\sigma(N)}\right)" /></div>
  <div class="accent-cell"><small>selected value</small><MathEq tex="N^*=\arg\max_{N_{\min}:N_{\max}}P_{\rm valid}^{(N)}P_{\rm acc}^{(N)}" /></div>
</div>

<p class="backup-caveat">exact integer maximizer of an approximate asymptotic score</p>

<!--
The subroutine enumerates every admissible integer N. No extra quantum measurements are used inside it. The score remains approximate because the pilot distribution and final accuracy use asymptotic Gaussian models.
[Sources] sources/algorithms.tex, alg:stat-safeguard-subroutine; sources/theorems.tex, thm:stat-safeguard.
-->

---
class: supplement
---

<div class="supp-tag">SUPPLEMENT · THEORY</div>

# QFI bound for an error-propagation estimator

<div class="theorem-box">
<p>Consider a pure-state unitary family generated by A, and an estimator constructed by error propagation from a measurement observable M.</p>
<MathEq tex="\partial_\phi\langle M\rangle\neq0" />
<p>For m independent repetitions, its variance satisfies</p>
<MathEq tex="(\Delta\hat\phi)^2\geq\frac{1}{m\,I_Q[\rho,A]}" />
<p>The denominator contains the quantum Fisher information of the state family generated by A.</p>
</div>

<SlideCite id="supp-qfi" />

<!--
Exact theorem statement from the thesis. The proof uses error propagation, the commutator derivative, Cauchy–Schwarz, and additivity of QFI across independent repetitions.
[Sources] sources/theorems.tex, thm:qcrb; thesis/02-theory.tex.
-->

---
class: supplement
---

<div class="supp-tag">SUPPLEMENT · THEORY</div>

# SQL versus Heisenberg scaling

<div class="scaling-compare">
  <div><b>separable</b><MathEq tex="I_Q=4N" /><MathEq tex="(\Delta\phi_{\rm sep})^2\sim\frac{1}{mN}" /><small>standard quantum limit</small></div>
  <div><b>GHZ</b><MathEq tex="I_Q=4N^2" /><MathEq tex="(\Delta\phi_{\rm ent})^2\sim\frac{1}{mN^2}" /><small>Heisenberg limit</small></div>
</div>

<p class="backup-caveat">parallel resource accounting · local asymptotic precision</p>

<SlideCite id="supp-scaling" />

<!--
Exact equations from the thesis fact. The ideal sequential protocol has the same likelihood and QFI scaling as GHZ, but differs in simultaneous qubit count, coherence time, gate errors and elapsed time.
[Sources] sources/theorems.tex, fact:sql-vs-hl; thesis/02-theory.tex.
-->

---
class: supplement
---

<div class="supp-tag">SUPPLEMENT · THEORY</div>

# Delta method

<div class="theorem-box compact-theorem">
<p>If a sequence of random variables satisfies</p>
<MathEq tex="\sqrt n\,[X_n-\theta]\xrightarrow{d}\mathcal N(0,\sigma^2)," />
<p>then, for a smooth transformation satisfying</p>
<MathEq tex="g'(\theta)\neq0" />
<MathEq tex="\sqrt n\,[g(X_n)-g(\theta)]\xrightarrow{d}\mathcal N\!\left(0,\sigma^2[g'(\theta)]^2\right)." />
</div>

<p class="backup-callout">apply the inverse cosine transformation to the binomial frequency</p>

<SlideCite id="supp-delta" />

<!--
Exact theorem statement from the thesis, condensed only typographically.
[Sources] sources/theorems.tex, thm:delta-method; thesis/02-theory.tex.
-->

---
class: supplement
---

<div class="supp-tag">SUPPLEMENT · THEORY</div>

# Asymptotic distribution of the inversion estimator

<div class="theorem-box compact-theorem">
<p>Fix N and an interior phase satisfying</p>
<MathEq tex="0\lt N\phi\lt\pi/2,\qquad 0\lt p_0=\cos^2(N\phi)\lt1" />
<MathEq tex="\sqrt m\,(\hat\phi_{\rm ent}-\phi)\xrightarrow{d}\mathcal N\!\left(0,\frac{1}{4N^2}\right)" />
<MathEq tex="\hat\phi_{\rm ent}\mid\phi\approx\mathcal N\!\left(\phi,\frac{1}{4mN^2}\right)" />
<MathEq tex="\mathbb E[\hat\phi_{\rm ent}\mid\phi]\longrightarrow\phi" />
</div>

<p class="backup-caveat">fixed N · regular interior · large-m approximation</p>

<SlideCite id="supp-asymptotic" />

<!--
Exact lemma statement from the thesis. Boundary points and adaptive selection are outside the lemma's assumptions.
[Sources] sources/theorems.tex, lemma:asymp-dist-est; thesis/02-theory.tex.
-->

---
class: supplement
---

<div class="supp-tag">SUPPLEMENT · THEORY</div>

# A uniform prior gives a truncated-normal pilot posterior

<div class="theorem-box compact-theorem">
<p>Assume a uniform phase prior and the following working pilot approximation:</p>
<MathEq tex="\hat\phi_p\mid\phi\approx\mathcal N(\phi,\sigma_p^2),\qquad\sigma_p^2=\frac{1}{4m_pN_p^2}." />
<p>Then</p>
<MathEq tex="\phi\mid\hat\phi_p\approx\operatorname{TruncNorm}(\hat\phi_p,\sigma_p^2,[a,b])." />
</div>

<p class="backup-caveat">working asymptotic model; not an exact adaptive posterior</p>

<SlideCite id="supp-posterior" />

<!--
Exact theorem statement from the thesis. For Binary Search, the retained deepest accepted probe is data-selected, so applying this model is explicitly approximate.
[Sources] sources/theorems.tex, thm:asympt-dist-given-pilot; thesis/03-methodology.tex.
-->

---
class: supplement
---

<div class="supp-tag">SUPPLEMENT · THEORY</div>

# The safeguard balances validity and accuracy

<div class="theorem-box safeguard-theorem">
<MathEq tex="P_{\rm valid}^{(N)}:=\mathbb P(N\phi\leq\pi/2\mid\hat\phi_p)" />
<MathEq tex="P_{\rm acc}^{(N)}:=\mathbb P(|\phi-\hat\phi_N|\lt\epsilon\mid N\phi\leq\pi/2,\hat\phi_p)" />
<MathEq tex="N^*=\underset{N'=N_{\min},\ldots,N_{\max}}{\operatorname{arg\,max}}\;P_{\rm valid}^{(N')}P_{\rm acc}^{(N')}" />
<MathEq tex="=\underset{N'}{\operatorname{arg\,max}}\;F_{\hat\phi_p,\sigma_p^2;[a,b]}\!\left(\frac{\pi}{2N'}\right)\left[1-2\Phi\!\left(\frac{-\epsilon}{\sigma(N')}\right)\right]" />
<MathEq tex="\sigma(N')=\frac{1}{2N'\sqrt{\lfloor B/N'\rfloor}}" />
</div>

<SlideCite id="supp-safeguard" />

<!--
Exact theorem equations from the thesis. The integer enumeration is exact for the stated score; the score itself is approximate.
[Sources] sources/theorems.tex, thm:stat-safeguard; thesis/03-methodology.tex.
-->

---
class: supplement
---

<div class="supp-tag">SUPPLEMENT · GENERATED TABLE</div>

# Performance in the main setting

<table class="backup-table performance-table">
<thead><tr><th>method</th><th>converged at C = 10,000</th><th>budget for 90%</th></tr></thead>
<tbody>
<tr><td>Brute force</td><td>56.09% <small>[55.66, 56.53]</small></td><td>45,900 <small>[45,300, 46,500]</small></td></tr>
<tr><td>Linear search</td><td>64.10% <small>[63.68, 64.52]</small></td><td>35,500 <small>[34,900, 36,000]</small></td></tr>
<tr><td>Binary search</td><td>65.07% <small>[64.65, 65.49]</small></td><td>32,400 <small>[32,000, 32,900]</small></td></tr>
<tr class="highlight"><td>Reverse engineering</td><td>66.30% <small>[65.88, 66.71]</small></td><td>29,800 <small>[29,200, 30,300]</small></td></tr>
<tr><td>Separable, N = 1</td><td>15.68% <small>[15.36, 16.00]</small></td><td>680,000 <small>[669,000, 691,000]</small></td></tr>
<tr><td>Oracle N<sub>opt</sub></td><td>73.48%</td><td>24,435</td></tr>
</tbody>
</table>

<p class="table-note">95% Wilson intervals for rates; bootstrap intervals for adaptive budgets</p>

<SlideCite id="supp-performance" />

<!--
Adaptive parameters were tuned on seeds 42 and 43 and frozen before independent validation on seed 2024 with 50,000 trials. The oracle is a deterministic large-m reference, not an implementable protocol.
[Sources] sources/generated-tables/tab_summary_low_prec_ci.tex, generated by ba_thesis_sim/analysis/thesis_tables.py.
-->

---
class: supplement
---

<div class="supp-tag">SUPPLEMENT · GENERATED TABLE</div>

# Budget ratios across tested scenarios

<table class="backup-table ratio-table">
<thead><tr><th rowspan="2">method</th><th colspan="2">φ ∼ U(0.01, 0.1)</th><th>U(0.001, 0.01)</th><th>U(0.001, 0.1)</th></tr><tr><th>ε = 10⁻³</th><th>10⁻⁴</th><th>10⁻⁴</th><th>10⁻⁴</th></tr></thead>
<tbody>
<tr><td>Linear search</td><td>1.29× <small>(1.45× oracle)</small></td><td>1.56× <small>(1.19×)</small></td><td>1.36× <small>(1.36×)</small></td><td>1.42× <small>(1.40×)</small></td></tr>
<tr><td>Binary search</td><td>1.42× <small>(1.33×)</small></td><td>1.60× <small>(1.16×)</small></td><td>1.32× <small>(1.39×)</small></td><td>1.84× <small>(1.07×)</small></td></tr>
<tr class="highlight"><td>Reverse engineering</td><td>1.54× <small>(1.22×)</small></td><td>1.74× <small>(1.06×)</small></td><td>1.46× <small>(1.26×)</small></td><td>1.84× <small>(1.07×)</small></td></tr>
<tr><td>Oracle</td><td>1.88×</td><td>1.85×</td><td>1.84×</td><td>1.98×</td></tr>
</tbody>
</table>

<p class="table-note">first number: B<sub>brute</sub>/B<sub>method</sub> · parentheses: B<sub>method</sub>/B<sub>oracle</sub></p>

<!--
All ratios refer to 90% convergence. The separable protocol is omitted here because its budget is much larger and is reported in the full generated table set.
[Sources] sources/generated-tables/tab_ratios.tex, generated by ba_thesis_sim/analysis/thesis_tables.py.
-->

---
class: supplement
---

<div class="supp-tag">SUPPLEMENT · GENERATED TABLE</div>

# Precision scaling with 95% intervals

<table class="backup-table precision-table">
<thead><tr><th>ε</th><th>Linear</th><th>Binary</th><th>Reverse eng.</th><th>Oracle</th></tr></thead>
<tbody>
<tr><td>10⁻³</td><td>1.29× <small>[1.27,1.32]</small></td><td>1.42× <small>[1.39,1.44]</small></td><td>1.54× <small>[1.51,1.58]</small></td><td>1.88×</td></tr>
<tr><td>10⁻⁴</td><td>1.56× <small>[1.52,1.59]</small></td><td>1.60× <small>[1.57,1.63]</small></td><td>1.74× <small>[1.71,1.78]</small></td><td>1.85×</td></tr>
<tr><td>10⁻⁵</td><td>1.64× <small>[1.60,1.67]</small></td><td>1.75× <small>[1.72,1.79]</small></td><td>1.80× <small>[1.76,1.83]</small></td><td>1.85×</td></tr>
<tr><td>10⁻⁶</td><td>1.65× <small>[1.62,1.69]</small></td><td>1.78× <small>[1.75,1.81]</small></td><td>1.80× <small>[1.77,1.83]</small></td><td>1.85×</td></tr>
<tr><td>10⁻⁷</td><td>1.67× <small>[1.64,1.70]</small></td><td>1.79× <small>[1.76,1.83]</small></td><td>1.81× <small>[1.78,1.84]</small></td><td>1.85×</td></tr>
<tr><td>10⁻⁸</td><td>1.66× <small>[1.62,1.69]</small></td><td>1.77× <small>[1.74,1.80]</small></td><td>1.82× <small>[1.78,1.85]</small></td><td>1.85×</td></tr>
</tbody>
</table>

<p class="table-note">improvement over brute force at 90% convergence · bootstrap intervals</p>

<!--
The bootstrap resamples the two performance curves independently and therefore does not model dependence from shared simulation seeds.
[Sources] sources/generated-tables/tab_scaling_with_prec_ci.tex, generated by ba_thesis_sim/analysis/thesis_tables.py.
-->

---
class: supplement
---

<div class="supp-tag">SUPPLEMENT · GENERATED TABLE</div>

# What exploration finds before the safeguard

<table class="backup-table diagnostics-table">
<thead><tr><th>method</th><th>median N<sub>guess</sub>/N<sub>opt</sub></th><th>within 10%</th><th>guess overshoot</th><th>probes/trial</th><th>exploration share</th><th>false alarm / miss</th></tr></thead>
<tbody>
<tr><td>Linear</td><td>0.99</td><td>61.8%</td><td>5.5%</td><td>28.9</td><td>0.58%</td><td>61.7% / 5.5%</td></tr>
<tr><td>Binary</td><td>0.90</td><td>46.6%</td><td>5.6%</td><td>5.5</td><td>2.41%</td><td>30.7% / 5.6%</td></tr>
<tr class="highlight"><td>Reverse eng.</td><td>1.00</td><td>87.6%</td><td>23.9%</td><td>1.0</td><td>0.77%</td><td>—</td></tr>
</tbody>
</table>

<p class="table-note">106 informative operating points · errors are trial-level</p>

<!--
Reverse Engineering has no overshoot detector; its relatively frequent unsafe raw guesses motivate the shared statistical safeguard.
[Sources] sources/generated-tables/tab_diag_search.tex, generated by ba_thesis_sim/analysis/thesis_tables.py.
-->

---
class: supplement
---

<div class="supp-tag">SUPPLEMENT · GENERATED TABLE</div>

# The safeguard rescues unsafe guesses

<table class="backup-table downstream-table">
<thead><tr><th>method</th><th>median guess / N<sub>opt</sub></th><th>median final N*/N<sub>opt</sub></th><th>final overshoot</th><th>unsafe-guess rescue</th><th>converged given safe N*</th></tr></thead>
<tbody>
<tr><td>Brute force</td><td>0.54</td><td>0.54</td><td>0.00%</td><td>—</td><td>53.0%</td></tr>
<tr><td>Linear</td><td>0.99</td><td>0.94</td><td>1.22%</td><td>48.3%</td><td>62.3%</td></tr>
<tr><td>Binary</td><td>0.90</td><td>0.96</td><td>0.74%</td><td>96.5%</td><td>63.3%</td></tr>
<tr class="highlight"><td>Reverse eng.</td><td>1.00</td><td>0.96</td><td>0.65%</td><td>98.2%</td><td>63.9%</td></tr>
</tbody>
</table>

<p class="table-note">aggregate over 106 informative operating points</p>

<!--
Unsafe-guess rescue is conditional on the exploration guess exceeding N_opt. A final N below N_opt can be intentional because the safeguard trades branch validity against attainable precision.
[Sources] sources/generated-tables/tab_diag_downstream.tex, generated by ba_thesis_sim/analysis/thesis_tables.py.
-->

---
class: supplement
---

<div class="supp-tag">SUPPLEMENT · GENERATED TABLE</div>

# Finite-sample check of the overshoot threshold

<table class="backup-table detector-table">
<thead><tr><th>m′</th><th>Berry–Esseen bound</th><th>exact distance to normal</th><th>α = 0.50</th><th>α = 0.34</th><th>α = 0.05</th></tr></thead>
<tbody>
<tr><td>50</td><td>0.114</td><td>0.084</td><td>0.077</td><td>0.077</td><td>0.037</td></tr>
<tr><td>200</td><td>0.139</td><td>0.083</td><td>0.081</td><td>0.067</td><td>0.036</td></tr>
<tr><td>800</td><td>0.147</td><td>0.083</td><td>0.080</td><td>0.072</td><td>0.040</td></tr>
</tbody>
</table>

<div class="detector-notes">
<MathEq tex="m'\min(p_0,1-p_0)\geq10" />
<span>last three columns: largest deviation from nominal detector size</span>
</div>

<SlideCite id="supp-detector" />

<!--
The normal approximation applies to the binomial count K. The achieved detector size also reflects finite threshold placement and binomial discreteness, so its worst deviation need not shrink across these expanding regularity regions.
[Sources] sources/generated-tables/tab_overshoot_operating.tex, generated by ba_thesis_sim/analysis/thesis_tables.py.
-->

---
class: supplement
---

<div class="supp-tag">SUPPLEMENT · GENERATED TABLE</div>

# Parameters selected for the main setting

<table class="backup-table parameter-table">
<thead><tr><th>method</th><th>frozen configuration at C = 10,000</th></tr></thead>
<tbody>
<tr><td>Linear search</td><td><code>m_exploration=1, lookback=6, safeguard=0, inc=1, mean_window=4</code></td></tr>
<tr><td>Binary search</td><td><code>m_exploration=114, conf=0.5</code></td></tr>
<tr><td>Reverse engineering</td><td><code>m_exploration=44</code> · planned pilot share 6.60%</td></tr>
</tbody>
</table>

<p class="table-note">ε = 10⁻³ · φ ∼ U(0.01, 0.1) · tuned before held-out evaluation</p>

<!--
This slide exists for reproducibility questions. These are selected simulation parameters, not universal algorithm constants.
[Sources] sources/generated-tables/tab_opt_param_first.tex, generated by ba_thesis_sim/analysis/thesis_tables.py.
-->
