---
clicks: 4
---

# Quantum metrology: from a hidden phase to an estimator

<SectionNav section="METROLOGY" :page="$page" />

<EstimatorStory :clicks="$clicks" />

<SlideCite id="derivation-pipeline" />

<!--
"Might call this a probabilistic inverse problem."

End: lets look at the experiment
-->

---
clicks: 7
---

# One-qubit quantum metrology protocol

<SectionNav section="METROLOGY" :page="$page" />

<div class="derivation one-qubit">
  <img src="/assets/thesis/1 qubit single use.drawio.png" alt="Thesis circuit for one probe: prepare zero, H, U(phi), H, measure">

  <div class="derivation-gate">
    <MathEq tex="U(\phi)=e^{i\phi Z}=\begin{pmatrix}e^{i\phi}&0\\0&e^{-i\phi}\end{pmatrix}" :display="false" />
  </div>

  <div class="derivation-main">
  <Derivation :clicks="$clicks" :start="1" size="small" :lines="[
    { lhs: 'p_0(\\phi)', rhs: '\\left|\\langle0|H\\,U(\\phi)\\,H|0\\rangle\\right|^2' },
    { rhs: '\\left|\\langle+|U(\\phi)|+\\rangle\\right|^2', },
   { rhs: '\\left|\\tfrac12\\begin{pmatrix}1 & 1\\end{pmatrix}\\begin{pmatrix}e^{i\\phi} & 0 \\\\ 0 & e^{-i\\phi}\\end{pmatrix}\\begin{pmatrix}1 \\\\ 1\\end{pmatrix}\\right|^2' },
    { rhs: '\\left|\\tfrac12\\left(e^{i\\phi}+e^{-i\\phi}\\right)\\right|^2' },
    { rhs: '\\cos^2\\phi' },
  ]" />
  </div>

  <div class="derivation-answers">
  <div v-click="6" class="bit-readout"><MathEq tex="0\;1\;0\;0\;1\;\ldots\quad\Longrightarrow\quad\hat p_0=\#0/m" /></div>
  <div v-click="7" class="derivation-answer"><MathEq tex="\hat\phi=\arccos\sqrt{\hat p_0}" /><small><MathEq tex="0\leq\phi\leq\pi/2" :display="false" /></small></div>
  </div>

</div>

<SlideCite id="derivation-one" />

---
clicks: 6
---

# N-qubit separable protocol

<SectionNav section="METROLOGY" :page="$page" />

<div class="derivation separable-derivation">
  <div class="derivation-figure">
    <img src="/assets/thesis/n qubit multiple uses.png" alt="Thesis circuit for N independent separable probes">
  </div>

  <div class="derivation-content">
  <Derivation :clicks="$clicks" :start="1" size="small" :lines="[
    { lhs: 'p_{\\rm sep}^{(N)}(0)', rhs: '\\left|\\langle 00\\ldots0 |H^{\\otimes N}U(\\phi)^{\\otimes N}H^{\\otimes N}|00\\ldots0\\rangle\\right|^2' },
    { rhs: '\\left|\\langle ++\\ldots+|U(\\phi)^{\\otimes N}|++\\ldots+\\rangle\\right|^2' },
    { rhs: '\\left|\\langle+|U(\\phi)|+\\rangle^{N}\\right|^2' },
    { rhs: '\\left|\\tfrac12\\left(e^{i\\phi}+e^{-i\\phi}\\right)\\right|^{2N}' },
    { rhs: '\\cos^{2N}\\phi' },
  ]" />

  <div v-click="6" class="derivation-answer"><MathEq tex="\hat\phi_{\rm sep}=\arccos\!\left(\hat p_{\rm sep}(00\ldots 0)^{\frac{1}{2N}}\right)" /><small><MathEq tex="0\leq\phi\leq\pi/2" :display="false" /></small></div>
  </div>
</div>

<SlideCite id="derivation-separable" />

<!--
ASK: "Which quantum trick have we not used so far?" — entanglement.
-->

---
clicks: 5
---

# N-qubit entangled (GHZ) protocol

<SectionNav section="METROLOGY" :page="$page" />

<div class="derivation ghz-derivation">
  <div class="derivation-figure">
    <img src="/assets/thesis/entangled circuit.png" alt="Thesis circuit for the fully entangled GHZ protocol">
  </div>

  <div class="derivation-content">
  <div class="derivation-gate">
    <MathEq tex="|\mathrm{GHZ}\rangle=\tfrac{1}{\sqrt2}\left(|0\rangle^{\otimes N}+|1\rangle^{\otimes N}\right)" :display="false" />
  </div>

  <Derivation :clicks="$clicks" :start="1" size="small" :lines="[
    { lhs: 'p_{\\rm ent}^{(N)}(0)', rhs: '\\left|\\langle\\mathrm{GHZ}|U(\\phi)^{\\otimes N}|\\mathrm{GHZ}\\rangle\\right|^2' },
    { rel: '', rhs: '\\begin{gathered}={}\\Bigl|\\tfrac12\\Bigl(\\langle 00\\ldots0|U(\\phi)^{\\otimes N}|00\\ldots 0\\rangle\\\\{}+\\langle 11\\ldots 1|U(\\phi)^{\\otimes N}|11\\ldots 1\\rangle\\Bigr)\\Bigr|^2\\end{gathered}' },
    { rhs: '\\left|\\tfrac12\\left(\\left(e^{i\\phi}\\right)^N+\\left(e^{-i\\phi}\\right)^N\\right)\\right|^2' },
    { rhs: '\\cos^2(N\\phi)' },
  ]" />

  <div v-click="5" class="derivation-answer"><MathEq tex="\hat\phi_{\rm ent}=\frac1N\arccos\sqrt{\hat p_0}" /><small class="branch-compare"><MathEq tex="0\leq\phi\leq\pi/(2N)" :display="false" /> </small></div>
  </div>
</div>

<SlideCite id="derivation-ghz" />

<!--
ASK: "Which one is better?"
-->

---
clicks: 2
---

# Entanglement allows greater sensitivity -- but a smaller branch

<SectionNav section="METROLOGY" :page="$page" />

<div class="derivation comparison-grid">
  <img src="/assets/thesis/proba_comparison.png" alt="Thesis comparison of separable and entangled response probabilities for N equals 10">
  <div>
    <div v-click="1" class="comparison-label">separable<br><b><MathEq tex="p_{\rm sep}^{(N)}(0)=\cos^{2N}\phi" /></b><small><MathEq tex="0\leq\phi\leq\pi/2" :display="false" /></small></div>
    <div v-click="2" class="comparison-label accent">GHZ (entangled)<br><b><MathEq tex="p_{\rm ent}^{(N)}(0)=\cos^2(N\phi)" /></b><small><MathEq tex="0\leq\phi\leq\pi/(2N)" :display="false" /></small></div>
  </div>
</div>

<SlideCite id="derivation-comparison" />

<!--
Of the separable curve: "one broad monotone branch." Of the entangled curve: "faster response, but repeated branches."

"Now one more question we could ask ourselves is: how large should we choose N? One reasonable guess is: as big as possible, while still fulfilling our constraint."
-->
