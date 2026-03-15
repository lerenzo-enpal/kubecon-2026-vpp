# Demand Response, Renewable Variability & Grid Stabilization
## Research Notes for KubeCon 2026 Presentation

---

## 1. Why Renewables Need Storage & Flexibility

### Wind Variability — Correlated Across Regions
- US DOE: When calm conditions occur at one wind farm, co-occurrence of calm at nearby farms is **38-58%**
- Germany: 72.75 GW installed wind, but during Nov 2024 Dunkelflaute, output dropped to **2.8 GW (3.8%)**
- Wind supplied only **7%** of Germany's electricity during worst days

### Solar Intermittency
- Germany: Solar contributed **4.3% in Nov 2024** vs ~25% in summer — **6x seasonal swing**
- Zero output at night, reduced by clouds, minimal in winter

### Dunkelflaute ("Dark Doldrums")
- Both wind and solar collapse simultaneously — high-pressure brings still air + overcast skies
- Occurs **2-10 times/year**, lasting **50-150 hours/month** in winter
- Nov 2024 Germany: renewables at **30%** (vs normal 50%+), fossil fuels covered 70%
- Prices spiked to **EUR 145/MWh** (vs ~EUR 40 avg), Dec 2024 hit **EUR 175/MWh**
- **14 consecutive days** below 10% of installed renewable capacity

---

## 2. Demand Response

### Definition
Voluntary reduction/shifting of electricity consumption in response to grid signals or price incentives.
Instead of building more power plants for peak demand, reshape the demand itself.

### Key Facts
- IEA Net Zero requires **500 GW demand response by 2030** (10x from 2020)
- VPPs save **40-60%** vs building peaker plants
- Global VPP market: **$5.7B (2025) → $28.4B (2035)**, CAGR 17.4%

### Real Examples
- **Arizona Public Service**: 50,000+ smart thermostat customers in "Cool Rewards"
- **Otter Tail Power**: 15% of system peak under VPP demand response control
- **Tesla VPP**: Powerwall owners earn $2.00/kWh during grid events
- **California**: 100,000 residential batteries at 535 MW
- **UK supermarket chain**: 20 MW reduction during stress events (McKinsey)

### VPP-Enabled Load Shifting
- Smart EV charging → off-peak/high-renewable periods
- Heat pump pre-loading → cheap renewable-rich periods
- Water heaters as thermal batteries
- Pool pumps, refrigeration → run during solar peaks

---

## 3. Australian Cost Studies

### RACE for 2030 CRC
- **1,000 MW flexible demand = AUD $300M/year bill savings**
- Untapped potential in commercial buildings, water/agriculture, food manufacturing

### AEMO ISP 2024
- Australia needs **49 GW / 646 GWh dispatchable storage by 2050**
- Transition delivers **$22 billion in net consumer benefits**
- Household batteries save **$4.1 billion** in avoided grid investment
- **AEMC**: Household bills could decrease **up to 20%** over next decade

### Hornsdale Power Reserve ("Tesla Big Battery")
- 150 MW / 193.5 MWh
- Saved **AUD $150M in 2 years** in FCAS costs
- 2019 alone: **AUD $116M** in cost reductions
- FCAS costs down **91%**: $470/MWh → $40/MWh
- Response: **100 ms** vs 6,000 ms conventional (60x faster)
- After 6 months: responsible for **55% of all FCAS** in South Australia

### Battery Cost Trends
- IRENA: Battery costs declined **93% (2010-2024)**: $2,571 → $192/kWh
- BloombergNEF 2026: 4-hour battery LCOE record low **$78/MWh**
- 30% cheaper than gas peaker plants (Australia CEC)

---

## 4. Grid Stabilization Strategies

### Three Layers of Frequency Reserves
| Reserve | Name | Time | Purpose |
|---------|------|------|---------|
| FCR | Frequency Containment | <30 sec | Arrest frequency deviation |
| aFRR | Automatic Restoration | 30s-5min | Restore to 50 Hz |
| mFRR | Manual Restoration | ~12.5 min | Relieve aFRR, manage congestion |

### Battery Speed Advantage
- Battery: milliseconds (some achieve **10 ms** to full power)
- Gas turbine: minutes to ramp
- Hornsdale: **100 ms vs 6,000 ms** = 60x faster

### Inertia Problem
- Traditional generators: massive spinning rotors resist frequency changes
- As they retire → grid loses natural stabilization
- **RoCoF** (Rate of Change of Frequency) increases without inertia
- **Grid-forming inverters**: emulate synchronous machines with virtual inertia
- Hornsdale (2022): world's first battery providing grid-scale inertia

### Spain/Portugal Blackout (April 28, 2025)
- 15 GW sudden loss → frequency plunged 50 Hz → 47 Hz
- NOT caused by too many renewables (384 intervals had higher renewable share)
- Caused by: voltage surge + inadequate reserves + insufficient inertia management
- "Not enough flexibility" — lacked batteries, demand response, grid-forming inverters

### Frequency-Responsive Loads
- Smart appliances monitor frequency autonomously
- Frequency drops → temporarily switch off
- Frequency rises → switch on
- No central dispatch needed, proportional response
- Millions of devices = gigawatts of instant response
- PNNL: comparable to conventional generator primary response

---

## Quotable Lines for Slides

- "The cheapest megawatt is the one you never have to generate."
- "A single 150 MW battery saved consumers $150M in two years and cut ancillary costs by 91%."
- "A battery can go from zero to full power in milliseconds. A gas turbine takes minutes. That's the difference between catching a falling glass and watching it shatter."
- "Every refrigerator in the country is a potential grid stabilizer."
- "The Iberian blackout wasn't caused by too many renewables — it was caused by not enough flexibility."
- "Northern Europe fears the Dunkelflaute. During Germany's Nov 2024 event, wind collapsed from 19 GW to 2.8 GW while millions of solar panels produced almost nothing."
