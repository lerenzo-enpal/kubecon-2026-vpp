# Grid Frequency Incidents & Reserve Framework — Reference

## ENTSO-E Frequency Containment Framework

### Reserve Layers (Continental Europe)

| Reserve | Capacity | Activation Time | Purpose |
|---------|----------|-----------------|---------|
| **FCR** | 3,000 MW | Within 30 seconds | Arrest frequency deviation |
| **aFRR** | ~3,000-5,000 MW | 30s – 15 min | Restore frequency to 50.000 Hz |
| **mFRR** | ~10,000+ MW | Within 15 min | Relieve aFRR, handle sustained events |
| **RR** | Varies | Up to 30 min | Relieve mFRR (some countries) |

- FCR activates proportionally. Full deployment at ±200 mHz (49.800 / 50.200 Hz).
- Germany's FCR share: ~580-620 MW.
- **Source:** ENTSO-E SO GL (EU Regulation 2017/1485), Articles 154-160

### Under-Frequency Load Shedding (UFLS)

| Stage | Frequency | Load Shed | Cumulative |
|-------|-----------|-----------|------------|
| 1 | 49.00 Hz | 5-10% | 5-10% |
| 2 | 48.70 Hz | 5-10% | 10-20% |
| 3 | 48.40 Hz | 5-10% | 15-30% |
| 4 | 48.10 Hz | 5-10% | 20-40% |
| 5 | 47.50 Hz | Generator disconnect | Cascade risk |

- 49.20 Hz: Alert state triggered
- 47.50 Hz: Generator protection relays trip (self-protection)
- 47.00 Hz: Virtually all generators tripped — total blackout
- **Note:** UFLS is national. Each country implements slightly different thresholds. Germany uses VDE-AR-N 4141.
- **Source:** EU Regulation 2017/2196 (Emergency & Restoration Code), Articles 15-22

## Real Incidents

### Single Plant Trip (1-2 GW) — Routine
- Frequency dip: ~100-200 mHz (49.80-49.90 Hz)
- FCR arrests within 15-30 seconds
- aFRR restores within 2-5 minutes
- Full nominal within 5-15 minutes
- No load shedding required
- **Example:** Dec 5, 2005 — two French nuclear units (1,800 MW). Nadir ~49.85 Hz, recovered in minutes.

### 3 GW Reference Incident
- Nadir: ~49.75-49.80 Hz
- FCR fully deployed in 30 seconds (this is what it's sized for)
- aFRR restores in 5-15 minutes
- Full nominal in 15-30 minutes
- No load shedding (stays above 49.0 Hz)

### 2006 European Grid Split (November 4)
- **Cause:** Planned 380 kV line disconnection over river Ems + high N-S flows → cascading trips
- Grid split into **3 islands** within ~14 seconds
- **West island:** 49.00 Hz nadir, ~9 GW imbalance, ~17 GW load shed, ~15M households affected
- **Northeast island:** 51.4 Hz peak, ~6,200 MW of wind tripped on over-frequency
- **Southeast island:** ~49.7 Hz, roughly balanced
- Resynchronized in ~55 minutes. No total blackout.
- **Source:** UCTE "Final Report — System Disturbance on 4 November 2006" (73 pages, freely available)

### 2021 Continental European Grid Split (January 8)
- **Cause:** Busbar coupler trip at Ernestinovo substation, Croatia → cascading line trips
- Grid split into **2 islands** within ~10 seconds
- **Southeast island:** 48.75 Hz nadir, ~6,300 MW imbalance, ~3,600 MW load shed
- **Northwest island:** 50.6 Hz peak
- Resynchronized in ~1 hour
- **Source:** ENTSO-E "Continental Europe Synchronous Area Separation 8 January 2021 — Final Report" (July 2021)

### 2025 Spain/Portugal Blackout (April 28)
- **CAUTION:** Investigation ongoing as of early 2026. Numbers are preliminary.
- Near-total Iberian blackout at ~12:33 local time
- Iberian peninsula separated from CE grid via France-Spain interconnectors
- Frequency collapsed below 47.5 Hz → generator protection trips → system collapse
- ~15 GW lost in Spain (midday demand ~25-30 GW), Portugal lost all supply
- ~60 million people affected — largest Western European blackout in history
- Recovery: partial 2-5 hours, major cities 5-12 hours, full 16-24 hours
- Contributing factors under investigation: high renewable penetration, lower inertia, possible protection relay cascade
- **Source:** REE and REN preliminary press statements; ENTSO-E formal ICS investigation announced

## Recovery Timeline Summary

| Event Size | Freq Nadir | FCR Arrest | Full Recovery | Load Shedding? |
|-----------|------------|------------|---------------|----------------|
| 1 GW (routine) | ~49.90 Hz | 15-30s | 5-15 min | No |
| 2 GW (large) | ~49.80 Hz | 15-30s | 10-20 min | No |
| 3 GW (reference) | ~49.75 Hz | 30s | 15-30 min | No |
| 5 GW (extreme) | ~49.2-49.5 Hz | 30-60s (partial) | 30-60 min | Probable |
| 9 GW (2006 split) | 49.00 Hz | N/A (split) | ~55 min resync | Yes, 17 GW |
| System collapse (2025) | <47.5 Hz | Failed | 5-16+ hours | Total blackout |

## Key Defensible Statements

1. "Continental Europe keeps 3,000 MW of frequency containment reserves spinning at all times" — ENTSO-E SO GL
2. "FCR fully activates within 30 seconds" — ENTSO-E SO GL Article 154
3. "The 2006 grid split saw frequency drop to 49.0 Hz, triggering load shedding for 15 million households" — UCTE Final Report
4. "In January 2021, the grid split again — 48.75 Hz, 6,300 MW imbalance" — ENTSO-E ICS Final Report
5. "Below 47.5 Hz, generators disconnect to self-protect — cascade threshold" — EU 2017/2196
6. "UFLS starts at 49.0 Hz in stages of 5-10%" — EU 2017/2196
7. "A 1-2 GW trip: ~100-200 mHz dip, recovered in under 15 minutes" — standard CE frequency quality data
8. "April 2025 Iberian blackout: ~60 million affected" — preliminary REE/ENTSO-E (investigation ongoing)

## Press/Q&A Caveats

- 3,000 MW is a dimensioning criterion, not a hard limit. System survives somewhat larger events via inertia + load damping.
- **System inertia is declining** with renewables. Same MW loss = faster frequency drop with less inertia. Directly relevant to VPP narrative (synthetic inertia, fast frequency response).
- Spain/Portugal 2025: do NOT state root cause as fact. Use "preliminary reports suggest" and note investigation is pending.
- UFLS thresholds vary by country. 49.0 Hz is the ENTSO-E standard but some countries differ.

## Primary Sources

| Source | Covers | Access |
|--------|--------|--------|
| UCTE "Final Report — System Disturbance 4 Nov 2006" | 2006 split | ENTSO-E website (free) |
| ENTSO-E "CE Separation 8 Jan 2021 — Final Report" | 2021 split | ENTSO-E website (free) |
| EU Regulation 2017/1485 (System Operation Guideline) | FCR/aFRR/mFRR | EUR-Lex |
| EU Regulation 2017/2196 (Emergency & Restoration Code) | UFLS, restoration | EUR-Lex |
| ENTSO-E "CE Operation Handbook — Policy 1" | Load-frequency control | ENTSO-E website |
| VDE-AR-N 4141 | German UFLS implementation | VDE standards |
| REE/REN press statements (April 2025) | Spain/Portugal blackout | REE.es, REN.pt |
