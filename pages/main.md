# Quantum metrology: infer a hidden phase

<TalkBody :number="2" :clicks="$clicks" :page="$page" />

<!--
We do not read off the unknown phase. Prepare a probe, encode the parameter, measure, then infer the phase classically. Here 0 denotes the all-zero readout event, and 1 its complement. With GHZ decoding only the two relevant outcomes have support in the ideal model. The audience knows circuits; do not explain gates. If an analogy preceded this slide, point out the identical layout. Echo transition: quantum observations are probabilistic, so we first estimate a probability. [Sources] thesis/02-theory.tex; thesis/03-methodology.tex.
-->

---
clicks: 2
---

# A probability becomes a phase estimate

<TalkBody :number="3" :clicks="$clicks" :page="$page" />

<!--
One response branch, N=15. The true phase determines p0=cos squared N phi. Repeated binary outcomes estimate p0. The horizontal guide follows the empirical fraction from 60 prerecorded outcomes (seed 1701), and the vertical guide returns the branch-inverted estimate. Rows of 8 and 20 bits preview the stream; the displayed fraction uses all 60 outcomes. All-zero event is abbreviated 0. Keep the estimator in the same place afterwards. [Sources] thesis/02-theory.tex; data/provenance.json.
-->

---
clicks: 2
---

# More phase-gate uses, finer local resolution

<TalkBody :number="4" :clicks="$clicks" :page="$page" />

<!--
Compare N=5,15,30. Each figure shows its first branch and its labeled phase range. The numerical probability change uses the same physical interval, phi=.030 to .033 rad. Larger N compresses the branch and improves Fisher information. The pointwise derivative is not larger everywhere: it vanishes at extrema; do not claim uniform slope growth. N means phase-gate uses, not circuit depth. [Sources] thesis/02-theory.tex.
-->

---

# Only the scaling we need

<TalkBody :number="5" :clicks="$clicks" :page="$page" />

<!--
For the thesis phase convention, QFI per repetition is 4N for independent separable probes and 4N squared for GHZ. No derivation. QCRB is a lower bound under its regularity and local unbiasedness conditions. Approximate equality describes the large-shot regular-branch estimator, not a universal finite-sample identity. Boundary readout atoms and adaptive selection matter. The noiseless sequential protocol has the same likelihood. [Sources] thesis/02-theory.tex.
-->

---
clicks: 1
---

# One budget, two allocations

<TalkBody :number="6" :clicks="$clicks" :page="$page" />

<!--
Same total number of phase-gate uses. Each strip encodes allocation schematically; it is not 10,000 individually drawn gate uses. Substituting m=C/N gives the local asymptotic variance 1/(4CN). This ignores integer rounding and assumes a valid regular branch. Larger safe N is attractive, even though repetitions decrease. [Sources] thesis/03-methodology.tex; thesis/02-theory.tex.
-->

---
clicks: 1
---

# The catch: the response folds back

<TalkBody :number="7" :clicks="$clicks" :page="$page" />

<!--
At N=30, the first branch ends at pi/60≈.0524. Expanding the axis reveals periodicity. A true phase .08 produces the same probability as roughly .02472 and other phases. Our point estimator always selects the first branch. Branch safety is sufficient for this estimator; it is not a theorem that all phase-estimation methods must discard aliased observations. A full likelihood can use them jointly. [Sources] thesis/02-theory.tex.
-->

---
clicks: 2
---

# Walking toward an invisible boundary

<TalkBody :number="8" :clicks="$clicks" :page="$page" />

<!--
True phi=.05 gives largest safe integer N_opt=31. Independent seeded binomial probes, 1000 shots each, expose aliasing as N grows. This is a calibration demonstration, not a single 10,000-budget algorithm run. Reveal points in three batches. The dashed boundary is simulation ground truth, unavailable to the algorithm. Past 31 every estimate is bounded by pi/(2N)<phi; eventual trend need not be monotone. [Sources] thesis/02-theory.tex; data/deck-data.js; data/provenance.json.
-->

---

# The concrete game

<TalkBody :number="9" :clicks="$clicks" :page="$page" />

<!--
Uniform phase ensemble over .01 to .1 rad; phase is fixed within each run. A successful run has absolute error below .001 rad. Endpoints imply N_min=15 and N_max=157. N_opt is the largest safe integer for the actual phase, not a proven finite-sample optimum. The cost is sum of N_i m_i for adaptive exploration and final shots; C=Nm applies to a single allocation. [Sources] thesis/03-methodology.tex.
-->

---
clicks: 2
---

# Safe for every possible phase?

<TalkBody :number="10" :clicks="$clicks" :page="$page" />

<!--
Brute force is the thesis name for the fixed guaranteed-safe baseline. It does not exhaustively run all N. Spend every available repetition at N=15. If phi=.02 the safe boundary is 78, leaving a large gap in sensitivity. Safety does not guarantee hitting the requested error tolerance. [Sources] thesis/03-methodology.tex.
-->

---
clicks: 3
---

# Could we find the hidden boundary?

<TalkBody :number="11" :clicks="$clicks" :page="$page" />

<!--
Audience pause: how could we find the hidden boundary? Do not ask for arbitrary numerical guesses. Probe N successively and look for a falling estimate. Reveal the algorithm name after the idea. Transition: show what this detector sees under noise. [Sources] thesis/03-methodology.tex.
-->

---
clicks: 2
---

# A falling moving average signals overshoot

<TalkBody :number="12" :clicks="$clicks" :page="$page" />

<!--
Representative teaching run from the actual current linear-search implementation. Phi=.05, eight shots per probe, window w=4, lookback l=6, safeguard s=1. Stop at six consecutive falls of the moving average, backtrack six increments, then apply s. Frozen seed is selected once by a disclosed rule; it is not the tuned fixed-budget winner (that uses m prime=1,w=4,l=6,s=0). Moving-average detection is heuristic and can false alarm or miss. Retained exploration and final results are combined as implemented. [Sources] ba_thesis_sim/qmetrology/algorithms.py; data/provenance.json.
-->

---
clicks: 1
---

# What is the obvious inefficiency?

<TalkBody :number="13" :clicks="$clicks" :page="$page" />

<!--
Pause for the audience. Linear search buys many nearby probes. Natural extension is binary search. Reveal name after interaction. The next slide illustrates bisection with idealized labels; the actual noisy search is recorded separately in deck-data.js. [Sources] thesis/03-methodology.tex.
-->

---
clicks: 4
---

# Bisect the candidate interval

<TalkBody :number="14" :clicks="$clicks" :page="$page" />

<!--
Schematic noiseless decisions for hidden phi=.02, N_opt=78. Sequence 86→50→68→77→81 follows the current implementation midpoint rounding (rejection steps from upper probe toward L). Red means ground-truth overshoot here. In practice labels are noisy classifications, not access to phi. Keep deepest probe not classified as overshoot for the pilot. Bound contraction is cheap in number of probes, but higher-N probes cost more per shot. The statistical safeguard later considers the entire admissible range, not only the final bracket. [Sources] thesis/03-methodology.tex; ba_thesis_sim/qmetrology/algorithms.py.
-->

---
clicks: 2
---

# Do we need to search at all?

<TalkBody :number="15" :clicks="$clicks" :page="$page" />

<!--
Pause: if the safe pilot already gives a phase estimate, do we need to search? N_opt is largest safe N. Substitute the estimate and obtain a raw guess. Reveal Reverse Engineering afterwards. This raw substitution motivates the shortcut; the reported current algorithm feeds the pilot directly into the statistical safeguard, not the raw guess alone. [Sources] thesis/03-methodology.tex.
-->

---

# Exploration has uncertainty too

<TalkBody :number="16" :clicks="$clicks" :page="$page" />

<!--
Explicit binomial-compatible pilot counts 20,24,26,29 out of 44 produce these estimates and raw N guesses. Illustrative possible outcomes, not a random-sample histogram. True safe limit is 31. An underestimated phase gives an unsafe N guess. Repeated pilot values produce substantial uncertainty, especially near a branch endpoint. Axis previews the safeguarded choice N*=26 for the 24/44 pilot; the following safeguard slide explains how it is calculated. This motivates a score that trades risk for precision. [Sources] data/deck-data.js; thesis/03-methodology.tex.
-->

---

# Is the downward jump larger than shot noise?

<TalkBody :number="17" :clicks="$clicks" :page="$page" />

<!--
OPTIONAL CLASSIFIER. Bell curve is a Gaussian plug-in model centered at accepted estimate, not the true calibrated sampling law. Illustrative alpha=.05, sigma=.004. Lower-tail point suggests overshoot, central point could be ordinary noise. Current implementation initializes the threshold at N_min; after acceptance it recalibrates for the next candidate, after rejection it retains threshold. Reference uncertainty, branch endpoints and selection mean nominal alpha is not a guaranteed false-alarm rate. Alpha is tuned for end-to-end success; headline BS winner uses conf=.5, so alpha=.5 rather than the illustrative .05. Deepest accepted probe is selected, not guaranteed truly safe. [Sources] thesis/03-methodology.tex; ba_thesis_sim/qmetrology/algorithms.py.
-->

---
clicks: 2
---

# Safe enough × sensitive enough

<TalkBody :number="18" :clicks="$clicks" :page="$page" />

<!--
Statistical safeguard evaluated for pilot 24/44 all-zero outcomes at Np=15, remaining budget B=9340. Posterior is truncated Gaussian on [.01,.1]. Validity is probability phi≤pi/(2N) given pilot. Conditional accuracy is Gaussian approximation with floor(B/N) shots. Maximize their product over every integer N=15..157; ties choose smallest N. Small floor-induced irregularities are real. The product approximates valid-and-accurate success, treating overshot success as negligible; it is not exact total finite-shot convergence probability. RE uses safe opening pilot; BS uses deepest accepted pilot with selection uncertainty. Only this classical calculation is exhaustive, with no additional phase-gate cost. [Sources] thesis/03-methodology.tex; ba_thesis_sim/qmetrology/safeguard.py; data/provenance.json.
-->

---

# Back to the original game

<TalkBody :number="19" :clicks="$clicks" :page="$page" />

<!--
At C=10,000 and eps=.001: BF 56.092%, LS 64.100%, BS deep 65.070%, RE risk 66.296%. Points include 95% Wilson intervals, R=50,000 independent held-out runs per algorithm/point, test seed 2024; tuning blocks 42 and 43. Frozen winner per budget from finite grids, so tuning and selection uncertainty are not included in these intervals. Oracle 73.4843% is analytic QCRB-based success approximation at omniscient N_opt, not a Monte Carlo algorithm or universal finite-shot upper bound. Outcome metric is prior-averaged absolute-error convergence, not worst-case reliability. [Sources] data/fixed-budget.csv; ba_thesis_sim/results/experiment_manifest.json.
-->

---
clicks: 1
---

# 90% successful runs — how much budget?

<TalkBody :number="20" :clicks="$clicks" :page="$page" />

<!--
Same prior and eps. BF 45.9k, LS 35.5k, BS 32.4k, RE 29.8k at estimated 90% convergence. Crossings are log-linearly interpolated between tested budgets, not exact resource thresholds. Thin dark intervals are 95% run-level bootstrap crossing intervals; 2000 resamples, seed 12345. Reported ratio CI is [1.51,1.58], does not include all tuning/grid uncertainty; grid sensitivity is separately audited in source data. RE uses about 35% less budget, equivalent to a BF/RE ratio 1.54. Persistent card C=10,000 recalls starting game; this plot varies total budget to reach 90%. [Sources] data/budget-90.csv.
-->

---

# Tighter precision amortizes exploration

<TalkBody :number="21" :clicks="$clicks" :page="$page" />

<!--
SKIPPABLE IF RUNNING LONG; 10–20 second version: exploration becomes relatively cheap as final measurement gets expensive; advantage saturates. Main plotted 90% sweep reaches RE≈1.82 at eps=1e-8. The brief 1.84 headline is another tested point: eps=1e-4 at 80% reliability, CI [1.80,1.88]. It is not the maximum across every threshold (50% ratios exceed 2). Lines connect tested positive tolerances on log10 epsilon; not new observed points. Every point uses 50,000 held-out runs, bootstrap 95% ratios and interpolated crossings. Persistent C and eps card is removed because both vary here. [Sources] data/precision-sweep.csv; ba_thesis_sim/results/budget_crossings.csv.
-->

---

# Cheap exploration can find a large safe N

<TalkBody :number="22" :clicks="$clicks" :page="$page" />

<!--
Resolve the opening question. Larger N improves resource efficiency within the branch. Its safe limit depends on the unknown phase. Cheap exploration and a statistical safety margin can improve ensemble-average success. Diagram is schematic for phi=.02 and does not report a measured adaptive final N=65. Gains are constant budget factors in tested ideal settings, not asymptotic separations. [Sources] thesis/04-results.tex; thesis/09-conclusion.tex.
-->

---

# Beyond a branch-inverted point estimate

<TalkBody :number="23" :clicks="$clicks" :page="$page" />

<!--
Left: a periodic likelihood can still inform a joint posterior when a branch-inverted estimate aliases. Do not imply one periodic measurement globally identifies phi. Right: adapt the general allocation idea to physical noise and realistic costs. A simpler separable experiment might provide a proof of concept, but the same GHZ overshoot rule and N scaling do not transfer unchanged. Ideal sequential encoding shares the GHZ likelihood; physical costs and decoherence can change rankings. This is outlook, not demonstrated experimental savings. [Sources] thesis/09-conclusion.tex; thesis/04-results.tex.
-->
