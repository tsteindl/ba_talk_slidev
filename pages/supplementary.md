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
