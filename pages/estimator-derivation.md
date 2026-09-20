---
clicks: 4
---

# From a hidden phase to an estimator

<EstimatorStory :clicks="$clicks" />

<SlideCite id="derivation-pipeline" />

<!--
Move through the pipeline as one continuous process. The circuit is a compact one-qubit building block, not a basic-gate tutorial. One outcome is random; repeated outcomes estimate a response probability; only then do we invert. The animation is deterministic and click-driven. [Sources] thesis/02-theory.tex, especially the preliminaries and Eqs. for the single-qubit response.
-->

---
clicks: 3
---

# One qubit: probability first, phase second

<div class="derivation one-qubit">
  <div class="circuit-strip"><b>|0〉</b><span>H</span><span>U(φ)</span><span>H</span><b>measure</b></div>
  <div v-click="1" class="derivation-eq"><MathEq tex="p_0(\phi)=\left|\langle0|HU(\phi)H|0\rangle\right|^2=\cos^2\phi" /></div>
  <div v-click="2" class="bit-readout"><MathEq tex="0\;1\;0\;0\;1\;\ldots\quad\Longrightarrow\quad\hat p_0=\#0/m" /></div>
  <div v-click="3" class="derivation-answer"><MathEq tex="\hat\phi=\arccos\sqrt{\hat p_0}" /><small><MathEq tex="0\leq\phi\leq\pi/2" /></small></div>
</div>

<SlideCite id="derivation-one" />

<!--
For U(phi)=exp(i phi Z), the H-U-H circuit gives p0=cos²(phi). Repetitions estimate p0. On the monotone branch zero to pi/2, invert to obtain phi_hat. This establishes the estimator logic before changing the probe architecture. [Sources] thesis/02-theory.tex, Sec. 2.1 and the N=1 case of Eqs. (separable probability and estimator).
-->

---
clicks: 2
---

# Separable probes multiply probabilities

<div class="derivation protocol-grid">
  <img src="/assets/thesis/n qubit multiple uses.png" alt="Thesis circuit for N independent separable probes">
  <div>
    <div v-click="1" class="derivation-eq"><MathEq tex="p_{\rm sep}(0^N)=\left(\cos^2\phi\right)^N=\cos^{2N}\phi" /></div>
    <div v-click="2" class="derivation-answer"><MathEq tex="\hat\phi_{\rm sep}=\arccos\!\left(\hat p_{\rm sep}(0^N)^{1/(2N)}\right)" /></div>
  </div>
</div>

<SlideCite id="derivation-separable" />

<!--
The N qubits are independent. The probability that all N read out zero is the product of N identical single-qubit probabilities. Inverting this product response gives the separable estimator. Do not suggest that N is circuit depth; it is the number of phase-gate uses, here distributed across N qubits. [Sources] thesis/fig/n qubit multiple uses.png; thesis/02-theory.tex, Sec. 2.2, Eqs. prob-zero-sep and est-sep.
-->

---
clicks: 3
---

# A GHZ probe accumulates the phase coherently

<div class="derivation ghz-grid">
  <img src="/assets/thesis/entangled circuit.png" alt="Thesis circuit for the fully entangled GHZ protocol">
  <div>
    <div v-click="1" class="derivation-eq"><MathEq tex="\langle\mathrm{GHZ}|U(\phi)^{\otimes N}|\mathrm{GHZ}\rangle=\dfrac{e^{iN\phi}+e^{-iN\phi}}2" /></div>
    <div v-click="2" class="derivation-eq"><MathEq tex="p_{\rm ent}(0^N)=\cos^2(N\phi)" /></div>
    <div v-click="3" class="derivation-answer"><MathEq tex="\hat\phi_N=\frac1N\arccos\sqrt{\hat p_0}" /></div>
  </div>
</div>

<SlideCite id="derivation-ghz" />

<!--
The GHZ components acquire phases plus and minus N phi. Their overlap is cos(N phi), so the all-zero probability after decoding is cos²(N phi). On the identifiable branch 0 <= N phi <= pi/2, inversion gives the estimator used throughout the adaptive study. The ideal sequential protocol has the same likelihood, but different physical requirements. [Sources] thesis/fig/entangled circuit.png; thesis/02-theory.tex, Secs. 2.3–2.4, Eqs. prob-zero-ent and est-ent.
-->

---
clicks: 2
---

# Greater sensitivity comes with a smaller branch

<div class="derivation comparison-grid">
  <img src="/assets/thesis/proba_comparison.png" alt="Thesis comparison of separable and entangled response probabilities for N equals 10">
  <div>
    <div v-click="1" class="comparison-label">separable<br><b><MathEq tex="\cos^{2N}\phi" /></b><small>one broad monotone branch</small></div>
    <div v-click="2" class="comparison-label accent">GHZ / sequential<br><b><MathEq tex="\cos^2(N\phi)" /></b><small>faster response · repeated branches</small></div>
  </div>
</div>

<SlideCite id="derivation-comparison" />

<!--
The thesis figure compares N=10. The entangled response changes much faster near the origin, while periodic branches repeat. This is the tension that motivates choosing N adaptively: local sensitivity improves, but branch identifiability is lost if N is too large. The figure was adapted in the thesis from Kofler; retain that source attribution if this slide remains. [Sources] thesis/fig/proba_comparison.png; thesis/02-theory.tex, comparison of protocols; Kofler, Quantum Information and Quantum Metrology as cited by the thesis.
-->
