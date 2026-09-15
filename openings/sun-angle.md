# What is the Sun’s elevation?

<TalkBody :number="1" module="sun-angle" :index="0" :clicks="$clicks" :page="$page" />

<!--
The hidden quantity is now the solar elevation angle alpha. Use a vertical gnomon of known height h on level ground; do not look at or access the Sun directly. Parallel rays and a well-defined shadow edge are assumed. [Sources] elementary response model or geometry stated on slide; openings.js. Schematic, not measured calibration data.
-->

---
clicks: 1
---

# A known pole turns angle into length

<TalkBody :number="1" module="sun-angle" :index="1" :clicks="$clicks" :page="$page" />

<!--
Measure the horizontal shadow length L, then reveal the right triangle and angle alpha. The drawing uses alpha=45 degrees and h=L for visual simplicity. In a real measurement, the pole must be vertical and the ground level. [Sources] elementary response model or geometry stated on slide; openings.js. Schematic, not measured calibration data.
-->

---

# Shadow length → infer Sun angle

<TalkBody :number="1" module="sun-angle" :index="2" :clicks="$clicks" :page="$page" />

<!--
Since tan alpha=h/L, a known height and measured shadow length give alpha_hat=arctan(h/L_hat). This is physically founded and structurally close to metrology: a hidden angle controls an observable response that is inverted. The quantum case replaces deterministic length by an estimated outcome probability. [Sources] elementary response model or geometry stated on slide; openings.js. Schematic, not measured calibration data.
-->
