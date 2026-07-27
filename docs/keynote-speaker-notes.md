# KubeCon Japan 2026 — Keynote Speaker Notes

**Total: 5:00 · 7 slides · Yokohama**

Read the room, not the clock — but if you're past the marker on a slide, cut, don't rush. Words in **bold** are landing beats; do not skip them.

Advance keys: `→` to step, `↓` to next slide.

---

## Slide 1 — Premise (0:00 → 0:20 · 20s)

**Visual:** Washi paper. One sentence: *"The energy grid is becoming a cloud-native distributed system."*

> "Good morning. I'm going to make one claim and spend five minutes defending it.
>
> **The energy grid is becoming a cloud-native distributed system.** Not metaphorically. Architecturally. The same problems you solve every day at work — coordination across a fleet, latency budgets, failure domains — are now grid problems.
>
> The case I'll use is Japan."

**Beat:** pause after "not metaphorically." Let it land.

---

## Slide 2 — Atlas (0:20 → 1:35 · 75s · 4 steps · ~18s each)

**Visual:** Washi map of Japan. StepBridge 4 steps.

### Step 1 · Whole country (0:20 → 0:38)
> "Japan is one country with **two grids**. The east runs at 50 Hz. The west runs at 60 Hz. Between them, two frequency converters — 2.1 gigawatts of capacity. That's the whole bridge."

### Step 2 · Zoom east (0:38 → 0:56)
> "The east is TEPCO, Tohoku EP, and JERA. Nuclear and LNG stacked along the Pacific coast — the shoreline that took the 2011 tsunami."

### Step 3 · Pan west (0:56 → 1:14)
> "West is KEPCO, Kyuden, Chugoku EP. A different frequency, a different fuel mix — more coal, more solar — and no fast way to help the east when the east needs it."

### Step 4 · Zoom out — full atlas (1:14 → 1:35)
> "One country, ten operators, two frequencies, forty-plus data centers on order. **The coordination problem is the grid.**"

**Beat:** the phrase "the coordination problem is the grid" is the pivot into the rest of the talk.

---

## Slide 3 — Energy origins (1:35 → 2:00 · 25s)

**Visual:** Generation mix bars (METI FY2023). LNG, oil, coal reveal in sequence.

> "Where does the fuel come from? **Eighty-five percent imported.** LNG. Oil. Coal. Every kilowatt-hour arrives by ship before it arrives on the wire.
>
> That's not a market fact — that's a distributed system with a physical dependency graph. And graphs have chokepoints."

**Beat:** land "chokepoints" — that's the segue to slide 4.

---

## Slide 4 — Hormuz (2:00 → 2:25 · 25s)

**Visual:** Ship traces a route from the Strait of Hormuz to Japan across the washi-inverted map.

> "This one. The Strait of Hormuz. A single tanker route, thousands of kilometers upstream of Japan's oil refineries — and therefore upstream of the oil-fired thermal reserve that backs the grid when nuclear or LNG drops.
>
> A six-week disruption this year added **fifteen thousand yen** to every household's annual bill. A chokepoint ten thousand kilometers away, priced at the wall socket.
>
> If you were designing this from scratch, you'd never accept this dependency. **But this is the system we have.** So the question becomes: what do you do when a single point of failure sits ten thousand kilometers away?"

---

## Slide 5 — Quake, then cold (2:25 → 3:55 · 90s · 10 steps)

**Visual:** Title card fades to grid HUD. `JapanColdSnapCascade` — 10-step timeline, March 2022. This is the meat.

### Step 0 · Title card (2:25 → 2:33)
> "March 2022. Sixty seconds that nearly broke Tokyo's grid."

### Step 1 · HUD boots (2:33 → 2:40)
> "OCCTO monitor. Dual 50/60 Hz readouts. Reserve margin — the number that matters."

### Step 2 · Quake (2:40 → 2:49)
> "**March 16, 23:36.** Magnitude 7.4 off Fukushima. Onagawa, Higashidori, Hitachinaka, Kashima — four east-coast thermal plants trip in the same minute."

### Step 3 · Aftermath (2:49 → 2:57)
> "**March 17.** 6.5 gigawatts of east-coast thermal is offline. Restarts are slow — days, not hours."

### Step 4 · Arctic front (2:57 → 3:05)
> "**March 21.** An arctic front sweeps in from Hokkaido. Heating demand jumps fifteen percent."

### Step 5 · Wind and solar collapse (3:05 → 3:13)
> "**March 22, morning.** Overcast and still air. Wind and solar go to zero at exactly the wrong time."

### Step 6 · Converter maxed (3:13 → 3:22)
> "The west has spare power. **The frequency converter caps at 2.1 gigawatts.** The rescue can't fit through the bridge."

### Step 7 · Emergency warning (3:22 → 3:31)
> "**11:00 AM.** METI issues Japan's first-ever power supply emergency warning. Reserve margin at 2.5 percent — below the 3 percent threshold."

### Step 8 · Public conservation (3:31 → 3:41)
> "Public conservation call. JEPX spot spikes. Everyone remembers January 2021 — forty days where the spot price ran from ten yen to two hundred fifty-one."

### Step 9 · Averted, but shaped (3:41 → 3:55)
> "Blackout averted. But every winter now carries this shape. And there are forty-plus data centers lining up behind it. **This isn't a one-time incident. It's the operating envelope.**"

**Beat:** hard pause after "operating envelope." Then transition into VPP.

---

## Slide 6 — The VPP transformation (3:55 → 4:35 · 40s)

**Visual:** `VPPTransformationSequence` — graph under uneven load, becomes a city, becomes Japan with millions of home lights.

> "So what do you do?
>
> You look at this and you notice — it's a graph. Uneven load, chokepoints, coordination-limited. Familiar.
>
> Now name the graph. A city. A city with millions of homes and roofs and cars and batteries. Each one is already connected. Each one already speaks a protocol. **A graph is a city, under load.**
>
> Pull back to Japan. Same graph, with geography. Add the three superpowers software already gives you: **connected devices respond fast. Batteries store energy. Coordination uses both smarter than any human operator could.**"

**Beat:** the twinkling houses across Japan should be visible by the end of this section.

---

## Slide 7 — Close (4:35 → 5:00 · 25s)

**Visual:** Dark map of Japan under the VPP overlay. Big text: `100K DEVICES · coordinated by software · = 1 power plant, zero emissions`.

> "One hundred thousand devices, coordinated by software, is one power plant with zero emissions.
>
> **No new plants. No new transmission. No approvals. Just code, Kubernetes, and the distributed system you already know how to build.**
>
> The grid is becoming cloud-native. Thank you."

**Beat:** stop. Do not add anything after "thank you."

---

## Recovery notes

If you're at **1:45 and still on slide 2** — skip step 3, jump to step 4. The east/west detail comes back in slide 5.

If you're at **3:00 and still on slide 5, step 3** — collapse steps 4-6 into one line: *"Then an arctic front, then wind and solar collapse, then the converter maxes out — the west can't rescue the east fast enough."*

If you're at **4:30 and haven't reached slide 7** — cut the middle paragraph of slide 6. Go straight from "familiar" to "add the three superpowers."

If you finish early — do not fill. Let the closing slide sit. Silence is fine.

---

## Do not say

- "Virtual power plant" before slide 6. The whole talk earns the term.
- Any company name that isn't already on-screen (TEPCO, KEPCO, JERA, METI, OCCTO, JEPX are fine — they're in the visuals).
- "AI" — not the framing.

## Do say

- **Distributed system.** Use the phrase early and often.
- **Coordination.** This is the through-line.
- **Kubernetes** exactly once, in the closer. Any more and it's marketing.
