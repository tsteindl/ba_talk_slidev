# A temperature behind a locked door

<TalkBody :number="1" module="ice" :index="0" :clicks="$clicks" :page="$page" />

<!--
Unknown locked-room temperature. We cannot enter or read a thermometer, but can insert and retrieve a probe through a hatch. The schematic door remains locked. [Sources] elementary response model or geometry stated on slide; openings.js. Schematic, not measured calibration data.
-->

---
clicks: 1
---

# Ice in → ten minutes → ice out

<TalkBody :number="1" module="ice" :index="1" :clicks="$clicks" :page="$page" />

<!--
Expose an identical ice cube for exactly ten minutes, then retrieve it and observe fraction remaining. The example returns 0.35 of the initial ice mass; rendered cube side shrinks by approximately the cube root of 0.35, preserving a volume-based comparison. This is a schematic fixed-time experiment, not a heat-transfer simulation. [Sources] elementary response model or geometry stated on slide; openings.js. Schematic, not measured calibration data.
-->

---
clicks: 2
---

# Remaining ice → infer temperature

<TalkBody :number="1" module="ice" :index="2" :clicks="$clicks" :page="$page" />

<!--
Assumed remaining-ice response decreases with temperature: M(T)=.95-.03T on 0–30 °C. Observed fraction .35 maps to 20 °C. This local working range is monotone and nonsaturated. Fixed ice geometry, exposure, airflow and humidity are required for physical calibration; do not derive heat transfer. Final compact five-node layout previews the quantum pipeline. [Sources] elementary response model or geometry stated on slide; openings.js. Schematic, not measured calibration data.
-->
