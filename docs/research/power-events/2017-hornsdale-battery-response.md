# Hornsdale Power Reserve (Tesla Big Battery) Response Event

## Background: How the Battery Came to Exist

The Hornsdale Power Reserve was a direct result of South Australia's energy crisis of 2016-2017 (the September 2016 statewide blackout and the February 2017 heatwave load shedding). The SA government issued a competitive tender for grid-scale battery storage as part of its emergency energy plan.

In March 2017, Elon Musk famously bet via Twitter that Tesla could build a 100 MW battery system within **100 days of contract signature** or it would be free. Tesla won the contract and partnered with Neoen (the French renewable energy company that owns the adjacent Hornsdale Wind Farm).

- **Contract signed**: 29 September 2017
- **Construction complete / testing began**: 25 November 2017
- **Grid connection**: 1 December 2017 (approximately 40 days ahead of the 100-day deadline)
- **Original capacity**: 100 MW / 129 MWh
- **Capital cost**: approximately AUD $90 million (often cited as $89M in some sources)
- **Location**: Adjacent to Hornsdale Wind Farm, near Jamestown, South Australia

## The Loy Yang A Coal Plant Trip: 14 December 2017

### What Happened

Just **13 days** after the Hornsdale Power Reserve was connected to the grid, it faced its first major test.

On **14 December 2017 at 01:58:59 AEST**, **Unit A3** (not Unit 2) at the **Loy Yang A Power Station** in Victoria's Latrobe Valley tripped without warning. This caused the sudden loss of **560 MW** of baseload coal generation from the National Electricity Market.

**Note**: The unit that tripped was Loy Yang A **Unit 3** (referred to as "A3" in AEMO data). Some sources incorrectly cite Unit 2.

### The Battery Response

The sequence of events:

| Time | Event |
|---|---|
| 01:58:59 | Loy Yang A3 trips; 560 MW lost from grid |
| 01:58:59 + ms | HPR begins responding (faster than AEMO data collection hardware could record) |
| 01:59:19 | Grid frequency falls to 49.80 Hz threshold |
| 01:59:19 | HPR's contingency FCAS response triggers, injecting **7.3 MW** into the grid |
| 01:59:27 | Gladstone Power Station (contracted FCAS provider, coal, Queensland) begins responding |
| Next several minutes | HPR continues supporting frequency stabilization |

The Hornsdale battery responded **four seconds** ahead of the Gladstone coal generator that was contracted to provide frequency control ancillary services (FCAS). The battery's response was so fast that AEMO's data collection hardware could not precisely capture the initial reaction time.

### Response Time: The 140ms Figure

The response time figures require careful attribution:

- **~100 milliseconds**: The documented contingency FCAS response time for HPR, as cited in AEMO's initial operation report and the Aurecon Year 1 case study. This is the most reliable figure.
- **134 milliseconds**: Time for HPR to ramp from 0 to full 100 MW output, cited in some technical analyses. Faster than a human blink (~150 ms).
- **140 milliseconds**: A figure that appears in some media reporting (e.g., EcoWatch). This likely represents a rounded/approximated version of the 134 ms ramp time or a specific measurement from a particular incident.
- **Conventional FCAS (gas turbines)**: The NEM standard is a **6-second** (6,000 ms) response window. Traditional gas turbine generators respond on timescales of seconds to minutes.

**The key comparison**: ~100 ms (battery) vs. 6,000 ms (NEM standard / gas turbines) -- approximately **60 times faster**.

### Power Delivered

During the Loy Yang A3 trip specifically:
- HPR injected **7.3 MW** into the grid for the initial frequency arrest
- This was a fraction of the battery's 100 MW capacity, but it was delivered at exactly the right moment
- The battery continued providing frequency support over the following minutes as other generators came online

The battery was not required to replace the full 560 MW lost -- its role was to arrest the frequency decline immediately while slower conventional generators ramped up.

## AEMO Data and Official Reports

### AEMO Initial Operation Report (2018)

AEMO published "Initial Operation of the Hornsdale Power Reserve Battery Energy Storage System" documenting the battery's first months of operation. Key findings:

- HPR was the **first non-synchronous generator** to provide regulation FCAS in Australia's NEM
- HPR was registered to provide all **eight FCAS markets**
- AEMO's Automatic Generation Control (AGC) system sends MW set-points to the battery at up to **once every four seconds**
- The regulation FCAS provided by HPR was "both rapid and precise, compared to the service typically provided by a conventional synchronous generation unit"
- However, AEMO noted that the Market Ancillary Services Specification (MASS) did not yet differentiate FCAS quality -- all regulation FCAS was paid the same price regardless of speed

### Aurecon Year 1 Case Study (2018)

Independent analysis by Aurecon confirmed:
- HPR was responsible for **55% of FCAS services** in South Australia after six months
- Regulation FCAS prices dropped by **75%** in South Australia
- Contingency FCAS costs fell by **91%** -- from $470/MWh to $40/MWh
- Grid stabilization service costs were **57% lower** (AUD $32.7 million less) in Q1 2018 vs. Q4 2017

## Cost and Savings

| Metric | Value |
|---|---|
| Installation cost | ~AUD $90 million (often cited as $89M) |
| FCAS savings, Year 1 | ~AUD $40 million per year (removal of 35 MW local FCAS constraint) |
| Total savings, first 2 years | Over **AUD $150 million** in reduced FCAS costs for SA consumers |
| Grid cost reduction, 2019 | AUD $116 million |
| Regulation FCAS price reduction | 75% (SA) |
| Contingency FCAS cost reduction | 91% ($470/MWh to $40/MWh) |

The battery paid for itself in under two years through FCAS cost reductions alone, before accounting for energy arbitrage revenue.

## Broader Significance

### What It Proved

1. **Grid-scale batteries work for frequency control**: Before Hornsdale, FCAS in the NEM was exclusively provided by synchronous generators (coal, gas, hydro). HPR demonstrated that batteries could provide superior frequency response.

2. **Speed matters**: The 100 ms response vs. 6,000 ms standard was not just faster -- it was qualitatively different. The battery could arrest frequency deviations before they cascaded, rather than responding after the fact.

3. **Economics favor batteries**: The dramatic reduction in FCAS costs showed that a single 100 MW battery could reshape an entire market, breaking the pricing power of incumbent gas generators in ancillary services.

4. **Batteries can be built fast**: The 100-day construction timeline (completed in ~60 days) demonstrated that energy storage could be deployed rapidly in response to grid emergencies -- unlike gas or coal plants that take years.

### Regulatory Impact

The success of HPR exposed gaps in electricity market rules:
- FCAS markets did not reward faster response (battery paid the same as a slow gas turbine)
- Rules were written around the capabilities of synchronous generators
- AEMO and the AEMC (Australian Energy Market Commission) began reforming market rules to better value speed and precision

## The AER Fine: A Cautionary Note

In **2019**, during a firmware update by Tesla, the battery's "droop settings" were accidentally changed from 1.7% to 3.7%, reducing its contingency FCAS response capability. This went undetected for months (July-November 2019). When the Kogan Creek coal plant in Queensland tripped, investigations revealed HPR had been under-delivering on its FCAS commitments.

- Neoen discovered and self-reported the issue to AEMO
- Neoen returned **AUD $3.4 million** in overpayments for services not fully delivered
- The Australian Energy Regulator (AER) pursued the matter in court
- The Federal Court fined Neoen **AUD $900,000** in 2022

This episode underscored that software configuration is as critical as hardware in battery systems -- a lesson relevant to any VPP or distributed energy resource.

## Current Status: Phase 2 Expansion

In **July 2019**, Neoen announced a 50% expansion:

| Specification | Phase 1 (2017) | Phase 2 (2020) |
|---|---|---|
| Power | 100 MW | **150 MW** |
| Energy | 129 MWh | **194 MWh** |
| Additional capacity | -- | +50 MW / +64.5 MWh |
| Construction start | Sep 2017 | Nov 2019 |
| Commissioned | Dec 2017 | **Sep 2020** |
| ARENA funding | -- | AUD $8 million grant |

The expansion added Tesla Megapack units and incorporated advanced grid services including:
- **Synthetic inertia**: In July 2022, HPR became the first battery in the world to provide grid-scale inertia services, a capability previously only available from spinning synchronous generators
- **Virtual machine mode**: Emulating the behavior of a synchronous generator to provide system strength

## Sources

- AEMO: Initial Operation of the Hornsdale Power Reserve -- [AEMO PDF](https://www.aemo.com.au/-/media/files/media_centre/2018/initial-operation-of-the-hornsdale-power-reserve.pdf)
- Aurecon: Hornsdale Power Reserve Year 1 Technical and Market Impact Case Study -- [Aurecon PDF](https://www.aurecongroup.com/-/media/files/downloads-library/thought-leadership/aurecon-hornsdale-power-reserve-impact-study-2018.pdf)
- ARENA: Hornsdale Power Reserve Upgrade -- [ARENA](https://arena.gov.au/projects/hornsdale-power-reserve-upgrade/)
- RenewEconomy: Tesla big battery outsmarts lumbering coal units after Loy Yang trips -- [RenewEconomy](https://reneweconomy.com.au/tesla-big-battery-outsmarts-lumbering-coal-units-after-loy-yang-trips-70003/)
- RenewEconomy: Tesla big battery fined for failing to deliver promised capacity -- [RenewEconomy](https://reneweconomy.com.au/tesla-big-battery-fined-for-failing-to-deliver-promised-capacity-when-coal-plant-tripped/)
- Electrek: Tesla battery races to save Australia grid from coal plant crash -- [Electrek](https://electrek.co/2017/12/19/tesla-battery-save-australia-grid-from-coal-plant-crash/)
- The Conversation: A month in, Tesla's SA battery is surpassing expectations -- [The Conversation](https://theconversation.com/a-month-in-teslas-sa-battery-is-surpassing-expectations-89770)
- Hackaday: The Hornsdale Power Reserve and What It Means for Grid Battery Storage -- [Hackaday](https://hackaday.com/2019/12/16/the-hornsdale-power-reserve-and-what-it-means-for-grid-battery-storage/)
- Hornsdale Power Reserve official site -- [hornsdalepowerreserve.com.au](https://hornsdalepowerreserve.com.au/)
- Neoen: Hornsdale Power Reserve exceeds all benchmarks -- [Neoen](https://neoen.com/en/news/2018/neoens-hornsdale-power-reserve-exceeds-all-benchmarks-after-first-year-in-operation/)
- pv magazine: Hornsdale big battery begins providing inertia grid services -- [pv magazine](https://www.pv-magazine-australia.com/2022/07/27/hornsdale-big-battery-begins-providing-inertia-grid-services-at-scale-in-world-first/)
- Global Infrastructure Hub: Hornsdale Power Reserve Project -- [GI Hub](https://www.gihub.org/resources/showcase-projects/hornsdale-power-reserve-project-australia/)
- NPR: World's Largest Battery Is Turned On In Australia -- [NPR](https://www.npr.org/sections/thetwo-way/2017/12/01/567710447/worlds-largest-battery-is-turned-on-in-australia-as-tesla-ties-into-power-grid)
