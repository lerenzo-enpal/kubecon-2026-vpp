# Iberian Peninsula Blackout — April 28, 2025

**The largest blackout in Western European history. First blackout in world history caused by overvoltage.**

## Key Facts

- **Date:** April 28, 2025
- **Time:** 12:33 CET (collapse in ~6 seconds)
- **Affected:** ~60 million people across Spain, Portugal, and parts of southern France
- **Generation lost:** 15 GW sudden loss
- **Duration:** Nearly a full day
- **Root cause:** Cascading overvoltage — a voltage spike triggered renewable generation protections, causing cascading disconnections

## Detailed Timeline

| Time (CET) | Event |
|------------|-------|
| Morning | Voltage instability observed in Spanish grid |
| 12:03-12:07 | First period of power and frequency oscillations in Continental European synchronous area |
| 12:19-12:21 | Second period of oscillations |
| 12:33:00 | Sharp voltage increase observed in Spain |
| 12:33:18 | Frequency begins rapid decline |
| 12:33:20 | Iberia disconnects from France; load shedding activated but insufficient |
| 12:33:21 | AC overhead lines between France and Spain disconnected by protection devices |
| 12:33:24 | Complete collapse of Iberian electricity system; HVDC France-Spain stops |

**The entire collapse took approximately 6 seconds.**

## Root Cause: Cascading Overvoltage

1. **Voltage instability** had been building in the Spanish grid during the morning of April 28
2. At ~12:33, a sharp voltage increase triggered **overvoltage protection** on renewable generators
3. Generators with power factor control automatically disconnected to protect equipment
4. Each disconnection further increased voltage (less generation absorbing reactive power)
5. This triggered more disconnections — a **cascading overvoltage** chain reaction
6. Fossil, nuclear, AND renewable plants all disconnected to self-protect
7. Within 6 seconds, the entire Iberian system collapsed

## Contributing Factors

- **High solar penetration:** At the time of collapse, solar accounted for ~59% of Spain's electricity supply
- **Insufficient synchronous generation:** Too few conventional generators online to provide voltage stability
- **Low system inertia:** Fewer spinning masses → less resistance to frequency/voltage changes
- **Fragile transmission state:** Network security margins were inadequate for overvoltage scenarios
- **Weak reactive power protocols:** Red Eléctrica de España (REE) implemented the weakest reactive power response protocols recorded in 2025
- **Spain's battery storage:** Only 25 MW installed (target was 500 MW by 2025)

## What Could Have Prevented It

### Battery Storage / VPPs
- Batteries with grid-forming inverters can provide **synthetic inertia** and **voltage regulation**
- Spain had only 25 MW of battery storage — essentially nothing at grid scale
- Compare: Germany has 24 GWh, Australia has multiple GW
- A distributed VPP fleet could have provided the reactive power absorption needed to prevent overvoltage

### Grid-Forming Inverters
- Standard solar/wind inverters are "grid-following" — they disconnect when voltage/frequency deviates
- **Grid-forming inverters** actively maintain voltage and frequency, mimicking synchronous generators
- Recommended as the #1 prevention measure by multiple analyses

### Better Voltage Control
- REE's reactive power management was criticized as inadequate
- Automated, distributed voltage control (exactly what a VPP provides) could have caught the instability earlier

## Investigation

- **ENTSO-E Expert Panel:** 45 experts from TSOs and regulators across Europe
- **Factual report:** Published October 3, 2025
- **Final root cause analysis:** Expected early 2026
- **Key finding:** "The Iberian blackout is the first in world history to be caused by overvoltage"

## Why This Matters for the Presentation

This is the **strongest argument for VPPs in the entire talk:**

1. Spain had almost zero battery storage (25 MW) — a VPP was structurally impossible
2. The cascade happened in 6 seconds — only automated, distributed response can act that fast
3. The root cause (overvoltage from renewable disconnection) is exactly what VPPs with grid-forming inverters prevent
4. 60 million people lost power because the grid lacked the distributed flexibility that a VPP provides
5. It's recent (April 2025) — the audience will remember it
6. It proves that 100% renewables without batteries/VPPs is structurally dangerous

**Narrative line:** "Spain tried to run a renewable grid without batteries. On April 28, 2025, 60 million people learned what happens when you skip the software layer."

## Sources

- [ENTSO-E Expert Panel Report](https://www.entsoe.eu/news/2025/10/03/28-april-blackout-in-spain-and-portugal-expert-panel-releases-comprehensive-factual-report/)
- [ENTSO-E Blackout Page](https://www.entsoe.eu/publications/blackout/28-april-2025-iberian-blackout/)
- [Baker Institute Analysis](https://www.bakerinstitute.org/research/iberian-peninsula-blackout-causes-consequences-and-challenges-ahead)
- [IEEFA: Excess renewables did not cause blackout](https://ieefa.org/resources/excess-renewables-generation-did-not-cause-iberian-blackout)
- [WindEurope: Spotlight on grid resilience](https://windeurope.org/news/iberian-blackout-entso-e-report-puts-spotlight-on-grid-resilience-and-voltage-control-not-on-renewables/)
- [NREL Analysis](https://docs.nrel.gov/docs/fy25osti/95103.pdf)
- [ScienceDirect: Overvoltage-driven blackout](https://www.sciencedirect.com/science/article/abs/pii/S235246772600007X)
- [Carbon Brief Q&A](https://www.carbonbrief.org/qa-what-we-do-and-do-not-know-about-the-blackout-in-spain-and-portugal/)
