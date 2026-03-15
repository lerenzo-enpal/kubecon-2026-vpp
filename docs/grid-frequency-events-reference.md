# Grid Frequency Event Scenarios — Technical Reference

Research backing for the event feed in the FrequencyDemo (slide 9). Each scenario's timeline, frequency values, and grid events are validated against ENTSO-E standards and real-world incidents.

---

## System Parameters (Continental Europe)

| Parameter | Value | Source |
|-----------|-------|--------|
| Nominal frequency | 50.000 Hz | ENTSO-E |
| FCR dimensioned for | 3,000 MW reference incident | ENTSO-E SOGL |
| FCR full activation | 30 seconds | ENTSO-E SOGL |
| aFRR full activation | 5 minutes | ENTSO-E (Dec 2024) |
| mFRR full activation | 12.5 minutes | ENTSO-E |
| Operational frequency band | 47.5–51.5 Hz | ENTSO-E NC RfG |
| System self-regulating effect | ~19,500 MW/Hz | ENTSO-E estimates |

---

## Scenario 1: Generator Trip (800 MW)

**Timeline in the simulation:**

| Grid Time | Event | Technical Basis |
|-----------|-------|-----------------|
| T+2s | Inertia absorbs initial shock | Rotating mass of synchronous generators provides ~2–5s of inertial response. For 800 MW in the full CE area (~300+ GW), this is well within normal contingency range. |
| T+5s | RoCoF detected — 0.06 Hz/s | RoCoF = ΔP × f₀ / (2 × H_sys). For 800 MW in the CE system, 0.06 Hz/s is realistic. Well below the 1 Hz/s protection relay limit. |
| T+10s | Nadir reached — 49.500 Hz | **Note:** In the full CE synchronous area, 800 MW would produce a nadir around 49.92–49.95 Hz. The 49.5 Hz value is dramatically compressed for presentation impact. This depth would be accurate for a smaller synchronous island or a system already under stress. |
| T+30s | Primary reserves arrest decline | FCR (Frequency Containment Reserve) must be fully deployed within 30 seconds per ENTSO-E SOGL. Timeline is accurate. |
| T+120s | Secondary reserves (aFRR) restoring | aFRR (automatic Frequency Restoration Reserve) begins replacing FCR after ~30s, reaches full activation in 5 minutes. The 30–120s window is accurate for initial aFRR engagement. |
| T+600s | Tertiary reserves engaged | mFRR (manual Frequency Restoration Reserve) activates fully within 12.5 minutes (~750s). 600s is within the correct window. |
| T+750s | Frequency nominal — 50.000 Hz | Total restoration within ~12 minutes is consistent with ENTSO-E's 15-minute restoration target. |

**Real-world precedent:** The January 2021 CE system separation involved a 6.3 GW imbalance and frequency only dropped to 49.74 Hz in the NW area, demonstrating how robust the full CE system is against even large disturbances.

---

## Scenario 2: 3 GW Loss of Generation

**Timeline in the simulation:**

| Grid Time | Event | Technical Basis |
|-----------|-------|-----------------|
| T+1s | Massive generation loss — 3 GW offline | 3,000 MW is exactly the ENTSO-E reference incident for which FCR is dimensioned. This is the design-basis contingency for the CE grid. |
| T+4s | Steep RoCoF — 0.16 Hz/s | Higher RoCoF proportional to larger disturbance. 0.16 Hz/s remains well below the 1 Hz/s protection relay threshold. |
| T+8s | Nadir 48.9 Hz — UFLS Stage 1 trips | **Note:** The full CE system is designed to contain the 3,000 MW reference incident within 200 mHz (nadir ~49.8 Hz). A 48.9 Hz nadir implies degraded conditions: low inertia (high renewable penetration), pre-existing frequency deviation, or a reduced synchronous area post-separation. The August 2019 UK blackout saw 48.8 Hz from ~1.9 GW loss in the smaller GB system (~35 GW), validating this depth for smaller grids. |
| T+15s | Load shedding stabilizes decline | UFLS relay operating time is 100–200ms after threshold crossing, plus 50–100ms for breaker operation. Stabilization within seconds of UFLS activation is realistic. |
| T+60s | Primary + secondary reserves active | FCR fully deployed by 30s, aFRR ramping. Correct timeline. |
| T+300s | Tertiary reserves & redispatch | mFRR fully active by 12.5 minutes. Redispatch actions on this timescale are standard practice. |
| T+900s | Plants ramping up — restoring | Additional generation (gas turbines, pumped hydro) being brought online. 15-minute timescale is realistic for hot-standby units. |
| T+1200s | Frequency restored — 50.000 Hz | 20-minute total restoration is realistic, especially if UFLS was triggered and loads need reconnection. |

**Real-world precedents:**
- **January 2021 CE System Separation:** 6.3 GW imbalance, frequency fell to 49.74 Hz. 1.7 GW of interruptible loads disconnected in France and Italy. System reconnected within 63 minutes.
- **August 2019 UK Blackout:** ~1.9 GW generation loss, frequency fell to 48.8 Hz in the ~35 GW GB system, triggering LFDD (UK equivalent of UFLS). Over 1 million customers disconnected.

---

## Scenario 3: Sudden Demand Drop (5 GW) — Over-frequency

**Timeline in the simulation:**

| Grid Time | Event | Technical Basis |
|-----------|-------|-----------------|
| T+1s | Sudden demand drop — 5 GW excess | Instantaneous supply-demand imbalance drives frequency upward. Could be caused by industrial load loss, interconnector trip exporting power, or sudden renewable curtailment response. |
| T+4s | Frequency rising — over-generation | With 5 GW excess in ~300+ GW system, steady-state deviation would be ~250 mHz (5000/19500). Dynamic overshoot can exceed this. |
| T+8s | Over-frequency — 50.500 Hz | At the boundary of plausibility for the full CE system. More realistic for a smaller synchronous zone or combined with low load conditions. |
| T+20s | Generator governors responding | Generator governors (frequency-sensitive mode) respond within seconds. FCR equivalent for over-frequency would be activated within 30 seconds. Timeline is accurate. |
| T+90s | AGC ramping down generation | AGC (Automatic Generation Control, implementing aFRR) actively reducing generation output. Correct timescale. |
| T+300–600s | Frequency settling → nominal | Full restoration within 5–10 minutes is consistent with aFRR/mFRR timescales. |

**Critical context — the "50.2 Hz Problem":** Legacy distributed PV installations in Germany were configured to disconnect at 50.2 Hz, creating a systemic risk where an over-frequency event could cascade into a massive under-frequency emergency by simultaneously losing tens of GW of solar. ENTSO-E mandated national retrofit programmes to extend the operating range to 47.5–51.5 Hz.

**Real-world precedent:**
- **April 2025 Iberian Blackout:** Over-frequency protections triggered cascading disconnection of renewable generation, which then swung into severe under-frequency and total collapse. The entire sequence from first oscillations to blackout took approximately 30 seconds.

---

## Scenario 4: Cyber Attack (SCADA Compromise)

**Timeline in the simulation:**

| Grid Time | Event | Technical Basis |
|-----------|-------|-----------------|
| T+5s | Anomalous SCADA traffic detected | In reality, reconnaissance takes weeks to months. The 2015 Ukraine attack involved 8+ months of preparation. T+0 represents the start of the active attack phase, with prior infiltration already complete. |
| T+30s | Generators tripped remotely | The 2015 Ukraine attack demonstrated remote breaker opening at 30 substations simultaneously. SCADA compromise enables remote generator tripping — this is a proven attack vector. |
| T+60s | Protection relays compromised | The Ukraine attack included firmware corruption of serial-to-Ethernet converters at substations, disabling remote recovery. Compromising protection relays is a documented capability. |
| T+90s | Cascade — relays disabled | Without functioning protection relays, the grid loses automated defense mechanisms (UFLS, distance protection), making cascading failure inevitable. |
| T+150s | Reserves overwhelmed | Reserve activation depends on SCADA/EMS systems that are themselves compromised. Without coordination, manual intervention is too slow. |
| T+210s | Uncontrolled collapse | With protection disabled and no coordinated response possible, frequency decline becomes uncontrolled. |
| T+270s | TOTAL BLACKOUT — 47.4 Hz | 47.5 Hz is the generator disconnection threshold per ENTSO-E. Below this, all generators trip on under-frequency protection. The ~4.5 minute timeline from attack initiation to blackout is validated by the 2003 Italy blackout, where uncontrolled frequency collapse from 50 Hz to 47.5 Hz took approximately 2.5 minutes. |

**Real-world precedents:**
- **Ukraine 2015:** First confirmed cyberattack on a power grid. 30 substations disconnected, 230,000 customers without power for 1–6 hours. Used BlackEnergy malware via spear-phishing.
- **Ukraine 2016:** Second attack using Industroyer/CrashOverride malware specifically designed for power grid IEC 61850/104 protocols.
- **2003 Italy Blackout** (non-cyber, but cascade reference): After separation from CE grid, frequency dropped from 50 Hz through 49 Hz to 47.5 Hz in ~2.5 minutes, validating the uncontrolled collapse timeline.

---

## UFLS Threshold Values

| Threshold | Presentation Value | ENTSO-E Standard | Status |
|-----------|--------------------|-------------------|--------|
| 49.0 Hz — UFLS Stage 1 | 10% load shed | First UFLS threshold at 49.0 Hz, 5–10% per step | Accurate |
| 48.5 Hz — UFLS Stage 2 | Additional 15% | 6–10 steps between 49.0–48.0 Hz, cumulative ~25% at midpoint | Plausible |
| 48.0 Hz — UFLS Stage 3 | Relay trip | Lower bound of standard UFLS operating range | Accurate |
| 47.5 Hz — Total collapse | Generator disconnect | Absolute lower frequency limit per ENTSO-E NC RfG | Accurate |
| 51.5 Hz — Generator trip | Over-frequency disconnect | Upper frequency limit per ENTSO-E NC RfG | Accurate |

ENTSO-E specifies 6–10 UFLS steps total between 49.0–48.0 Hz, each shedding 5–10% of load, with total shedding of 40–50%. The presentation simplifies to 3 stages, which is appropriate for a conference talk.

---

## Sources

- ENTSO-E SOGL (System Operation Guideline)
- ENTSO-E NC ER (Network Code on Emergency and Restoration)
- ENTSO-E NC RfG (Network Code on Requirements for Generators)
- [ENTSO-E UFLS Technical Background Document](https://www.entsoe.eu/Documents/Network%20codes%20documents/NC%20ER/141215_Technical_background_for_LFDD.pdf)
- [ENTSO-E CE System Separation January 2021 Final Report](https://www.entsoe.eu/news/2021/07/15/final-report-on-the-separation-of-the-continental-europe-power-system-on-8-january-2021/)
- [UK August 2019 Blackout — Ofgem Report](https://www.ofgem.gov.uk/sites/default/files/docs/9_august_2019_power_outage_report.pdf)
- [2003 Italy Blackout — UCTE Investigation Report](https://eepublicdownloads.entsoe.eu/clean-documents/pre2015/publications/ce/otherreports/20040427_UCTE_IC_Final_report.pdf)
- [2015 Ukraine Cyberattack — CISA Alert](https://www.cisa.gov/news-events/ics-alerts/ir-alert-h-16-056-01)
- [2025 Iberian Peninsula Blackout — ENTSO-E](https://www.entsoe.eu/publications/blackout/28-april-2025-iberian-blackout/)
