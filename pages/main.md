---
clicks: 1
---

# Fisher information and the QCRB

<TalkBody :number="2" :clicks="$clicks" :page="$page" />

---

# Monte-Carlo check: error and variance versus shots

<TalkBody :number="3" :clicks="$clicks" :page="$page" />

---

# Monte-Carlo check: the estimator breaks at the branch edge

<TalkBody :number="4" :clicks="$clicks" :page="$page" />

---
clicks: 1
---

# One budget, two allocations

<TalkBody :number="5" :clicks="$clicks" :page="$page" />

<!--
"A fixed budget requires us to find a tradeoff between N and m."
-->

---
clicks: 0
---

# The catch: the risk of overshooting (aliasing)

<TalkBody :number="6" :clicks="$clicks" :page="$page" />

<!--
"A random N means the measured p0 does not allow us to correctly reconstruct phi by phi-hat."

We NEED to adhere to N phi <= pi/2.
-->

---
clicks: 3
---

# Walking toward an invisible boundary

<TalkBody :number="7" :clicks="$clicks" :page="$page" />

<!--
Why? (1/N) arccos sqrt(p0-hat) —> 0 as N —> infinity.
-->

---
clicks: 4
---

# The task

<TalkBody :number="8" :clicks="$clicks" :page="$page" />

---

# Recap: choosing N adaptively

<TalkBody :number="9" :clicks="$clicks" :page="$page" />

<!--
We do not know N_opt, but we really need to avoid overshooting it.
-->

---
clicks: 3
---

# Safe for every possible phase?

<TalkBody :number="10" :clicks="$clicks" :page="$page" />

<!--
Baseline algorithm.

From now on: building on the GHZ protocol, try to guess N_opt in an exploration phase and use the remaining budget to guess using N_guess approx N_opt.
-->

---
clicks: 3
---

# Could we find the hidden boundary?

<TalkBody :number="11" :clicks="$clicks" :page="$page" />

---
clicks: 2
---

# A falling moving average signals overshoot

<TalkBody :number="12" :clicks="$clicks" :page="$page" />

---
clicks: 1
---

# What is the obvious inefficiency?

<TalkBody :number="13" :clicks="$clicks" :page="$page" />

---
clicks: 4
---

# Bisect the candidate interval

<TalkBody :number="14" :clicks="$clicks" :page="$page" />

---
clicks: 2
---

# One detector does not fit both searches

<TalkBody :number="15" :clicks="$clicks" :page="$page" />

---
clicks: 1
---

# A one-shot overshoot criterion

<TalkBody :number="16" :clicks="$clicks" :page="$page" />

<!--
Galton board!!!

Theory to the rescue.
-->

---
clicks: 3
---

# Reject the probes that fall too far

<TalkBody :number="17" :clicks="$clicks" :page="$page" />

---
clicks: 2
---

# Do we need to search at all?

<TalkBody :number="18" :clicks="$clicks" :page="$page" />

<!--
Assumes again phi0-hat approx phi.
-->

---
clicks: 1
---

# Problem: exploration has uncertainty too

<TalkBody :number="19" :clicks="$clicks" :page="$page" />

<!--
The N_guess returned by the BS / RE exploration phase may have overshot.

Need to take a few steps back from N_guess.

But how many?
-->

---
clicks: 3
---

# Statistical safeguard

<TalkBody :number="20" :clicks="$clicks" :page="$page" />

<!--
Need to maximize P_valid * P_acc.

Analytic expression => no QC!
-->

---

# Did the safeguard work?

<TalkBody :number="21" :clicks="$clicks" :page="$page" />

<!--
Tables from the paper showing how well the safeguard worked.
-->

---

# Back to the original game

<TalkBody :number="22" :clicks="$clicks" :page="$page" />

---
clicks: 1
---

# 90% successful runs — how much budget?

<TalkBody :number="23" :clicks="$clicks" :page="$page" />

---

# Tighter precision amortizes exploration

<TalkBody :number="24" :clicks="$clicks" :page="$page" />

---

# Beyond a branch-inverted point estimate

<TalkBody :number="25" :clicks="$clicks" :page="$page" />

---

# Summary

<TalkBody :number="26" :clicks="$clicks" :page="$page" />
