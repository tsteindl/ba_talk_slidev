---
layout: center
class: supplement supplement-divider
---

<div class="supp-tag">SUPPLEMENT</div>



<p></p>

---
class: supplement
---

<div class="supp-tag">SUPPLEMENT &middot; DERIVATION</div>

# The sequential protocol

<div class="derivation sequential-derivation">
  <img src="/assets/thesis/1qubit many uses.drawio.png" alt="Thesis circuit for one qubit and N sequential uses of U(phi)">

  <Derivation :clicks="99" :start="1" size="small" :lines="[
    { lhs: 'U(\\phi)^{N}', rhs: 'e^{iN\\phi Z}=U(N\\phi)', note: 'the phase gates commute' },
    { lhs: 'p_{\\rm seq}(0)', rhs: '\\left|\\langle0|H\\,U(\\phi)^{N}H|0\\rangle\\right|^2' },
    { rhs: '\\left|\\langle+|U(N\\phi)|+\\rangle\\right|^2' },
    { rhs: '\\left|\\tfrac12\\left(e^{iN\\phi}+e^{-iN\\phi}\\right)\\right|^2' },
    { rhs: '\\cos^2(N\\phi)=p_{\\rm ent}(0^N)' },
  ]" />

  <div class="derivation-answer accent"><MathEq tex="\hat\phi_{\rm seq}=\hat\phi_{\rm ent}" /><small>one qubit, N uses in a row — no entanglement, but N times the coherence time</small></div>
</div>

<SlideCite id="supp-sequential" />
