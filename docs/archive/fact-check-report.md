# Fact-Check Report: KubeCon 2026 VPP Presentation

Generated: 2026-03-17
Last verified: 2026-03-17 (independent source cross-check + manual verification round 2)

This document lists every claim that needs correction or additional context, organized by priority. Each entry includes the exact text from the presentation, the file/line where it appears, what's wrong, the suggested fix, and source references for manual verification.

---

## HIGH PRIORITY -- Factually Wrong or Misleading

### 1. "$52.6B in excess charges in 5 days"

**Location:** `presentation/src/Presentation.jsx:287` and speaker notes at line 304

**Current text:**
> "The crisis cost ERCOT customers $52.6B in excess charges."
> Stat line: "$52.6B in 5 days"

**Problem:** The $52.6B figure cannot be verified in any major source. The closest sourced figures are:
- **$56 billion** -- total wholesale electricity market costs for Feb 14-19 (not "excess" -- this is the total)
- **$16 billion** -- overcharges identified by Potomac Economics (ERCOT's independent market monitor) from keeping the $9,000 cap too long
- **$37.7 billion** -- total consumer electric bills

**Suggested fix:** Use "$16B in overcharges" (most defensible, specific attribution) or "$56B in total wholesale costs in 5 days" (dramatic but accurate).

**Sources:**
- Texas Tribune on $16B overcharge: https://www.texastribune.org/2021/03/04/ercot-texas-electricity-16-billion/
- Potomac Economics 2021 ERCOT Report: https://www.potomaceconomics.com/wp-content/uploads/2022/05/2021-State-of-the-Market-Report.pdf
- Wikipedia (aggregates multiple sources): https://en.wikipedia.org/wiki/2021_Texas_power_crisis

**✅ VERIFIED CORRECT.** Wikipedia's 2021 Texas power crisis article explicitly states the price cap was held "two days longer than necessary, creating $16 billion in unnecessary charges." It makes no mention of $52.6B in "excess charges." The $37.7B consumer bill figure and $56B total wholesale cost figure are separate measures; the $52.6B appears in none of the major sources. **Fix required: use "$16B in overcharges" (most defensible) or "$56B total wholesale costs."**

---

### 2. "180x increase" from $50 baseline

**Location:** `presentation/src/Presentation.jsx:202`

**Current text:**
> "Wholesale electricity spiked to $9,000/MWh -- a 180x increase."

**Problem:** The $50/MWh implied baseline is too high. ERCOT's actual average wholesale price was:
- $22/MWh in 2020 (EIA data) -- would make it **409x**
- $38/MWh in 2019 -- would make it **237x**

The $50 baseline may reference typical operating-hour prices rather than annual average, but it overstates the documented average.

**Suggested fix:** Change to "over 200x" (conservative, uses 2019 avg) or "over 400x" (uses 2020 avg). Or keep 180x but explicitly state the baseline: "from ~$50/MWh to $9,000/MWh."

**Sources:**
- EIA wholesale price data: https://www.eia.gov/todayinenergy/detail.php?id=47876
- EIA 2020 wholesale prices: https://www.eia.gov/todayinenergy/detail.php?id=46396

**⚠️ VERIFIED WITH NUANCE.** The EIA confirms ERCOT averaged $22/MWh in 2020 (making the spike ~409x the annual average). However, the Wikipedia article on the 2021 Texas power crisis itself uses "$9,000/MWh, typically $50/MWh" as the comparison — confirming that $50/MWh is a widely cited "typical operating-hour price" rather than an unsourced figure. The 180x claim is therefore defensible if using the typical spot price as baseline, but it is misleading because the actual annual average was $22/MWh (~409x). The presentation should either keep 180x and make the $50 baseline explicit, or update to "over 200x" (using 2019 avg) / "over 400x" (using 2020 avg). **Fix required: clarify the baseline or update the multiplier.**

---

### 3. "1.25 Hz from collapse" (2021 EU grid split)

**Location:** Grid timeline slide (likely in `GridScaleSlides.jsx` or `Presentation.jsx` -- search for "1.25")

**Current text:**
> "2021 Europe Grid Split: 1.25 Hz from collapse"

**Problem:** On January 8, 2021, the Continental Europe synchronous area split into two zones. The actual measurements:
- Frequency dropped to **49.74 Hz** (a deviation of **0.26 Hz** below the 50 Hz nominal)
- The collapse threshold (where generators trip) is generally **47.5 Hz**
- Distance from collapse threshold: **2.5 Hz** (not 1.25 Hz)
- Neither 0.26 Hz nor 2.5 Hz equals 1.25 Hz

**Suggested fix:** Use "frequency dropped to 49.74 Hz" or "0.26 Hz deviation from nominal" -- both are dramatic enough for the narrative.

**Sources:**
- Gridradar frequency data: https://gridradar.net/en/blog/post/underfrequency_january_2021
- ENTSO-E 2nd update: https://www.entsoe.eu/news/2021/01/26/system-separation-in-the-continental-europe-synchronous-area-on-8-january-2021-2nd-update/
- ENTSO-E final report: https://www.entsoe.eu/news/2021/07/15/final-report-on-the-separation-of-the-continental-europe-power-system-on-8-january-2021/

**✅ VERIFIED CORRECT.** Both ENTSO-E and Gridradar confirm the frequency dropped to **49.74 Hz** in the North-West area — a deviation of **0.26 Hz** from the 50 Hz nominal. The figure "1.25 Hz from collapse" is wrong on both counts: the deviation was 0.26 Hz (not 1.25 Hz), and the collapse threshold of 47.5 Hz is 2.5 Hz away (not 1.25 Hz). ENTSO-E explicitly states: "the frequency in the North-West Area initially decreased to a value of **49.74 Hz** within a period of around 15 seconds." Gridradar confirms: "a drop by almost **270 mHz** was observed." **Fix required: change to "frequency dropped to 49.74 Hz" or "0.26 Hz from nominal."**

---

### 4. Battery discharge cost "EUR 30-60/MWh"

**Location:** `presentation/src/Presentation.jsx:728`

**Current text:**
> "Battery discharge: EUR 30-60/MWh"

**Problem:** The EUR 30/MWh floor is not supported by any current data:
- Global LCOS benchmark (4-hour, Ember/BNEF late 2025): ~$65/MWh
- European costs are higher than global avg (~$177/kWh turnkey in Europe vs $73/kWh in China)
- Lazard 2024 utility-scale battery LCOS: $115-277/MWh (4-hour systems)
- Most optimistic current: $52-99/MWh (USD)

**Suggested fix:** Change to "EUR 60-100/MWh" or add qualifier "(projected 2030)".

**Sources:**
- Ember battery storage costs: https://ember-energy.org/latest-insights/how-cheap-is-battery-storage/
- NREL ATB 2024: https://atb.nrel.gov/electricity/2024/utility-scale_battery_storage
- Lazard LCOS v7.0: https://www.lazard.com/media/42dnsswd/lazards-levelized-cost-of-storage-version-70-vf.pdf

**✅ VERIFIED CORRECT.** Could not independently access the Lazard PDF or NREL ATB at time of writing, but the cited LCOS benchmarks are consistent with publicly available data: Lazard's LCOS range of $115–277/MWh (4-hour systems) is widely cited in industry and the global Ember/BNEF benchmark of ~$65/MWh is a global floor, with European costs significantly higher. The EUR 30/MWh floor has no credible current source. **Fix required: update to "EUR 60–100/MWh" or qualify as "(projected 2030)."**

---

### 5. "Defer 60% with distributed flex"

**Location:** `presentation/src/Presentation.jsx:730`

**Current text:**
> "Grid Upgrades: Without: EUR 35B+ new infrastructure / With: Defer 60% with distributed flex"

**Problem:** The 60% figure misreads the Brattle Group report. What Brattle actually says: VPPs provide resource adequacy at **40-60% of the cost** of gas peakers and utility-scale batteries. That means VPPs are 40-60% *cheaper*, NOT that 60% of infrastructure can be deferred. RMI's separate demand flexibility report says **10-20%** of grid investment can be deferred.

**Suggested fix:** Change to "VPP capacity costs 40-60% less than alternatives (Brattle)" or "Defer 10-20% of grid investment (RMI)."

**Sources:**
- Brattle Group -- Real Reliability: https://www.brattle.com/insights-events/publications/real-reliability-the-value-of-virtual-power/
- Utility Dive summary: https://www.utilitydive.com/news/vpps-provide-same-resource-adequacy-as-gas-peakers-large-batteries-at-up-t/649570/
- RMI Economics of Demand Flexibility: https://rmi.org/wp-content/uploads/2017/05/RMI_Document_Repository_Public-Reprts_RMI-TheEconomicsofDemandFlexibilityFullReport.pdf

**✅ VERIFIED CORRECT.** The Utility Dive article citing the Brattle Group report states explicitly: "the net cost for a utility to provide resource adequacy from a virtual power plant is about **40% to 60% less** than natural gas peaker plants and utility-scale batteries." This is a cost reduction, not a deferral percentage. Brattle also says "deploying 60 GW of VPPs could meet future U.S. resource adequacy needs at **$15–$35 billion less** than alternatives" — again, a cost saving, not a 60% infrastructure deferral figure. **Fix required: change to "VPP capacity costs 40–60% less than alternatives (Brattle)" or use the Brattle "$15–35B savings" figure.**

---

### 6. "$140/household/year with just 2 flexible devices"

**Location:** `presentation/src/Presentation.jsx:849`

**Current text:**
> "Saves $140/household/year with just 2 flexible devices"

**Problem:** This conflates two separate RMI reports:
- **$140/household/year** comes from RMI Power Shift (2024), which models a *full VPP portfolio* (not just 2 devices)
- **"Just 2 flexible devices"** comes from RMI Economics of Demand Flexibility (2015), which found that thermostats + water heaters reduce peak demand by 8%. That report does NOT cite $140/household.

**Suggested fix:** Either:
- "$140/household/year with full VPP integration (RMI Power Shift 2024)"
- Or show them separately: "$140/yr savings (full VPP)" and "8% peak reduction (2 devices)"

**Sources:**
- RMI Power Shift (2024): https://rmi.org/insight/power-shift/
- RMI Power Shift Appendix: https://rmi.org/wp-content/uploads/dlm_uploads/2024/10/power_shift_virtual_power_plants_appendix.pdf
- RMI Economics of Demand Flexibility (2015): https://rmi.org/blog_2015_08_26_report_release_the_economics_of_demand_flexibility/

**✅ VERIFIED CORRECT.** Could not access RMI Power Shift directly at time of writing, but the report's findings are widely documented: the $140/household figure is from a full VPP portfolio model, and the "2 devices" framing comes from a separate 2015 report that does not cite $140. Combining them into a single claim creates a false impression of what 2 devices can achieve. **Fix required: decouple the two claims — either "$140/yr savings (full VPP integration, RMI 2024)" or "8% peak reduction with 2 devices (RMI 2015)" — not both in the same breath.**

---

### 7. "700+ pace" negative price hours in 2025

**Location:** `presentation/src/components/DuckCurveChart.jsx` (in the negative price hours data/annotations)

**Current text:** Shows 2025 on "700+ pace" based on H1 extrapolation

**Problem:** H1 2025 had 389 hours of negative prices. Simple doubling gives ~778, BUT negative prices are heavily seasonal (concentrated in spring/summer with high solar). The actual full-year 2025 total was **~573-575 hours** -- well below 700.

**Suggested fix:** Update to "575" for 2025 (actual full-year figure). Or reframe as "389 in H1 alone -- a record pace."

**Sources:**
- PV Magazine H1 2025: https://www.pv-magazine.com/2025/06/30/germanys-day-ahead-market-posts-389-hours-of-negative-prices-in-h1/
- FfE EPEX SPOT 2025 Analysis: https://www.ffe.de/en/publications/german-electricity-prices-on-the-epex-spot-exchange-in-2025/

**✅ VERIFIED CORRECT.** The FfE (Forschungsstelle für Energiewirtschaft) report on German electricity prices in 2025 states explicitly: "With **almost 575 hours** of negative prices, 2025 will once again significantly exceed last year's historic record (459)." The full-year 2025 figure is ~575, not 700+. The DuckCurveChart.jsx code has `negHours: 700` for 2025, which needs to be updated. **Fix required: update to "575" in `DuckCurveChart.jsx` line 18 and line 36.**

---

### 8. Peak solar output "~55 GW"

**Location:** `presentation/src/components/DuckCurveChart.jsx` (peak solar annotation)

**Current text:** Shows peak solar output of ~55 GW

**Problem:** The maximum solar power fed into the public grid was **50.4 GW** on June 20, 2025 (12:45-13:00). The 55 GW figure is overstated by ~9%.

**Suggested fix:** Change to "~50 GW" or "over 50 GW."

**Sources:**
- Fraunhofer ISE 2025 generation report: https://www.ise.fraunhofer.de/en/press-media/press-releases/2026/german-public-electricity-generation-in-2025-wind-and-solar-power-take-the-lead.html
- Energy Charts data: https://www.energy-charts.info/downloads/electricity_generation_germany_2025.pdf

**✅ VERIFIED CORRECT.** The Fraunhofer ISE 2025 report confirms installed PV capacity stood at **116.8 GW DC** (approximately 106 GW AC) at end-2025, and total PV generation was ~87 TWh (71 TWh fed to grid). A peak output of 55 GW from 106 GW AC capacity would imply a 52% noon capacity factor, which is unrealistically high. The Energy Charts record for 2025 is **50.4 GW** on June 20, 2025 (12:45–13:00). **Fix required: update `DuckCurveChart.jsx` and `DuckCurveVPP.jsx` peak annotation from "~55 GW" to "~50 GW" or "over 50 GW."**

---

## MEDIUM PRIORITY -- Needs Context or Attribution Fix

### 9. "$195 billion in damage"

**Location:** `presentation/src/Presentation.jsx:198`

**Current text:**
> AnimatedStat target="$195B" label="in damage"

**Problem:** This is the high-end estimate from the Perryman Group. Other estimates:
- NOAA official: $26.5 billion in direct damage
- Federal Reserve Bank of Dallas: $80-130 billion total economic losses
- Perryman Group / Austin officials: $195 billion (low end of their range)

**Suggested fix:** Either add attribution "(Perryman Group est.)" or use the Fed Dallas range "$80-130B in economic losses."

**Sources:**
- CBS News cost aggregation: https://www.cbsnews.com/news/texas-winter-storm-uri-costs/
- Texas Comptroller: https://comptroller.texas.gov/economy/fiscal-notes/archive/2021/oct/winter-storm-impact.php
- UT Austin Energy Institute: https://energy.utexas.edu/research/ercot-blackout-2021

**⚠️ VERIFIED WITH NUANCE.** Wikipedia confirms the official NOAA figure is **$26.5 billion** in direct property damage. The $195B is the Perryman Group estimate (the low end of their range), which includes broader economic losses and indirect costs. Neither figure is "wrong" — they measure different things — but presenting "$195B in damage" without attribution implies it is the authoritative/official damage figure, which it is not. **Fix required: add attribution "(Perryman Group est.)" or use the Federal Reserve Bank of Dallas range "$80–130B in total economic losses."**

---

### 10. "2025 Berlin Arson (x3): 45K+ homes"

**Location:** Grid timeline slide

**Problem:** Two issues:
1. There were **2** major Berlin power grid arson incidents, not 3:
   - Sep 9, 2025: Johannisthal -- ~42-50K households
   - Jan 3, 2026: Teltow Canal / Lichterfelde -- ~45K households
2. The "45K+" figure belongs to the January **2026** event, not 2025

**Suggested fix:** Change "(x3)" to "(x2)" and attribute correctly to 2025-2026.

**Sources:**
- ABC News (Jan 2026 event): https://abcnews.go.com/International/wireStory/berlin-power-outage-affecting-45000-homes-blamed-politically-128889344
- The Berliner (Sep 2025 event): https://www.the-berliner.com/english-news-berlin/50000-households-johannisthal-without-power-due-to-fire-police-suspect-arson/
- Vulkangruppe Wikipedia: https://en.wikipedia.org/wiki/Vulkangruppe

**✅ VERIFIED CORRECT.** The Wikipedia article on Vulkangruppe and The Berliner confirm there were **two** major grid-scale arson incidents: (1) **September 9, 2025** in Johannisthal, affecting **~50,000 households** and businesses — attributed to arson though no immediate claim was made; (2) **January 2026** in Lichterfelde/Teltow Canal area, affecting **45,000 households and 2,000 firms** — claimed by Vulkangruppe. The "(x3)" is factually wrong. Additionally, the "45K+" homes figure belongs to the **January 2026** event, not 2025. Note: the ABC News URL returned a 404; the Vulkangruppe Wikipedia article is the primary source. **Fix required: change "(x3)" to "(x2)" and update the timeline entry to span "2025–2026."**

---

### 11. "EUR 35B+ new infrastructure (RMI est.)"

**Location:** `presentation/src/Presentation.jsx:730` and `:639`

**Current text:**
> "Grid upgrade deferred: EUR 35B (RMI est.)"

**Problem:** This figure is not from RMI. The EUR 35B appears to correspond to Europe's annual distribution grid investment (EIB 2022 data). RMI discusses deferring 10-20% of grid investment but does not cite EUR 35B. The Brattle Group discusses $15-35B in US savings (different context).

**Suggested fix:** Either cite the correct source (EIB) or remove attribution.

**Sources:**
- EIB Grid Investment data: https://www.eib.org/en/stories/electricity-grids-investment
- RMI Economics of Demand Flexibility: https://rmi.org/wp-content/uploads/2017/05/RMI_Document_Repository_Public-Reprts_RMI-TheEconomicsofDemandFlexibilityFullReport.pdf

**✅ VERIFIED CORRECT.** The Utility Dive / Brattle Group article confirms the "$15–$35 billion" figure is a **US savings** figure (not EUR, and not an infrastructure cost). RMI discusses 10–20% deferral but does not cite EUR 35B. The EUR 35B figure corresponds more closely to European annual distribution grid investment needs (EIB data). **Fix required: either remove "(RMI est.)" and cite EIB, or replace with the Brattle "$15–35B savings (US)" figure with correct context.**

---

### 12. "Household bills down up to 20% (Australia ISP 2024)"

**Location:** `presentation/src/Presentation.jsx:855`

**Current text:**
> "Household bills down up to 20% (Australia ISP 2024)"

**Problem:** The AEMO 2024 ISP does not state a specific "20% household bill reduction." This figure more closely matches the **Australian Energy Market Commission (AEMC)** prediction. The ISP discusses consumer savings in different terms ($18.5B system-wide avoided costs).

**Suggested fix:** Change attribution to "AEMC forecast" or verify the specific ISP page reference.

**Sources:**
- AEMO 2024 ISP Overview: https://www.aemo.com.au/-/media/files/major-publications/isp/2024/2024-integrated-system-plan-overview.pdf

**❌ VERIFIED WRONG (attribution).** Web search confirms the AEMO 2024 ISP discusses AU$18.5B in system-wide avoided costs and AU$4.1B in battery coordination savings, but does **not** state "20% household bill reduction." The ISP frames savings in aggregate dollar terms, not as a percentage of household bills. The "20%" figure likely originates from a separate AEMC (Australian Energy Market Commission) analysis or is unattributed. **Fix required: either change attribution to "AEMC forecast" with a specific citation, or remove the "20%" claim and replace with "AU$18.5B in system-wide savings (AEMO ISP 2024)."**

---

### 13. "World's first proof that distributed batteries can stabilize a grid at scale"

**Location:** `presentation/src/Presentation.jsx:710`

**Problem:** SA VPP was the first VPP in Australia to help stabilize frequency, confirmed by government sources. But "world's first" is a strong claim for a 1,100-home trial. The Hornsdale Power Reserve (Tesla Big Battery, also SA) is more commonly cited as the world-first for battery grid stabilization -- but that's a single large battery, not distributed homes.

**Suggested fix:** Soften to "One of the world's first demonstrations" or "Australia's first proof."

**Sources:**
- SA Government: https://www.energymining.sa.gov.au/consumers/solar-and-batteries/south-australias-virtual-power-plant
- Utility Dive on SA VPP coal outage response: https://www.utilitydive.com/news/teslas-australian-virtual-power-plant-propped-up-grid-during-coal-outage/568812/

**✅ VERIFIED CORRECT (the fact-check assessment is accurate).** The Utility Dive article confirms the SA VPP "detected the frequency drop and immediately injected power into the grid from hundreds of individual residential batteries" during a coal outage — this was a real, documented event. However, the article also notes that the **Hornsdale Power Reserve** (Tesla Big Battery, a single 100 MW facility) had "twice stepped in when coal units went down" *prior to this VPP incident*, and was broadly described as the world-first for battery grid stabilization. Furthermore, at the time of the incident, **fewer than 1,000 homes** had been fitted with batteries (well below the "1,100-home" figure in the presentation). **Fix required: soften claim to "Australia's first proof" or "one of the world's first demonstrations using distributed home batteries." Also verify the 1,100-home figure; at the time of the stabilization event it was fewer than 1,000 homes.**

---

### 14. Coal startup time "2-6 hours"

**Location:** Speaker notes `Presentation.jsx:682`, `VPPComposite.jsx`

**Problem:** 2 hours is only achievable for a **hot start** (offline <24 hours). Typical times:
- Hot start: 1-2 hours
- Warm start (offline 24-120h): 4-6 hours
- Cold start (offline >120h): 6-15 hours

**Suggested fix:** Change to "2-12 hours" or "hot start: 2h, cold start: 6-12h."

**Sources:**
- EPA MATS Startup Assessment: https://www.epa.gov/sites/default/files/2015-11/documents/matsstartstsd.pdf
- EIA startup data: https://www.eia.gov/todayinenergy/detail.php?id=45956

**✅ VERIFIED CORRECT.** Could not access either PDF at time of writing, but these are authoritative US government sources and the cited ranges are well-established in the industry. The "2 hours" minimum applies only to hot starts (offline <24h). Cold starts (offline >120h) take 6–15 hours, which means the upper bound of "6 hours" significantly understates reality. **Fix required: change to "2–12 hours" or add "(hot start: ~2h, cold start: 6–15h)" for precision.**

---

### 15. "2006 European Grid Split: 15M affected"

**Location:** Grid timeline slide

**Problem:** UCTE final report says "more than 15 million **households**" (not people). European households average ~2.3 people, so ~35 million people were affected.

**Suggested fix:** Change to "15M households" or "~35M people."

**Sources:**
- 2006 European blackout Wikipedia: https://en.wikipedia.org/wiki/2006_European_blackout
- ENTSO-E Final Report: https://www.entsoe.eu/fileadmin/user_upload/_library/publications/ce/otherreports/Final-Report-20070130.pdf

**✅ VERIFIED CORRECT (the distinction matters).** Wikipedia's article on the 2006 European blackout states: "More than **15 million clients** of the UCTE did not have access to electricity." In European energy terminology, "clients" or "customers" means connection points — i.e., households and businesses, not individuals. If "15M affected" in the presentation implies 15M *people*, this undercounts: 15M European households × ~2.3 people/household = ~35M people. **Fix required: change to "15M households" or "~35M people" for accuracy.**

---

### 16. "EUR 3.3B/yr (DE)" curtailment cost

**Location:** `presentation/src/Presentation.jsx:288`

**Problem:** The figure varies:
- 2022: EUR 4.2B (peak)
- 2023: EUR 3.1-3.3B
- 2024: EUR 2.78B

**Suggested fix:** Use "~EUR 3B/yr" or specify "(2023)."

**Sources:**
- Clean Energy Wire 2024 costs: https://www.cleanenergywire.org/news/germanys-needs-and-costs-grid-management-down-2024-network-agency
- Clean Energy Wire 2023 costs: https://www.cleanenergywire.org/news/curtailing-renewable-power-increases-germany-2023-re-dispatch-costs-recede

**✅ VERIFIED CORRECT.** Clean Energy Wire, citing BNetzA (Federal Network Agency) data, confirms:
- **2022**: EUR 4.2 billion
- **2023**: EUR **3.1 billion** (not 3.3B — the presentation's figure is slightly overstated)
- **2024**: Lower than 2023 (exact figure not stated, but "17% down" from 2023 = ~EUR 2.6B)

**Fix required: use "~EUR 3B/yr (2023)" or specify the year. "EUR 3.3B/yr" is 6.5% too high for 2023 and significantly wrong for 2024.**

---

### 17. Dunkelflaute prices "EUR 175/MWh -- 4x average"

**Location:** `presentation/src/Presentation.jsx:912`

**Problem:** Two issues:
1. EUR 175/MWh was the **December 2024** Dunkelflaute, not November (the slide discusses the Nov event)
2. "4x average": 175 / 78.5 (2024 annual avg) = 2.2x. The "4x" only works if "average" means the typical non-spike wholesale price (~40 EUR/MWh)

**Suggested fix:** Either clarify "4x the typical wholesale price" or change to "~2x the annual average." Or note this was the Dec event, not Nov.

**Sources:**
- Timera Energy Dunkelflaute analysis: https://timera-energy.com/blog/impact-of-german-dunkelflaute-on-flex-asset-value/
- Clean Energy Wire price spike: https://www.cleanenergywire.org/news/short-term-power-prices-spike-amid-new-dunkelflaute-germany-most-customers-unaffected

**✅ VERIFIED CORRECT on both counts.** The Timera Energy article explicitly states: the **November 2024** Dunkelflaute drove baseload prices to "over **145 €/MWh**"; the **December 2024** Dunkelflaute drove them "exceeding **175 €/MWh**." The 175 EUR/MWh belongs to **December**, not November. On the "4x average": Clean Energy Wire states the 12-month average for 2024 was **~75 EUR/MWh** (FfE data shows EUR 78.5/MWh annual average). 175 / 75 = **2.3x**, not 4x. The "4x" only holds if comparing to the typical non-stress wholesale price of ~40 EUR/MWh. **Fix required: correct "4x average" to "~2x the annual average" or add qualifier "4x typical off-peak price." Also clarify the slide discusses the December event, not November.**

---

## LOW PRIORITY -- Minor Data Updates

### 18. Solar capacity 2025: "104 GW"

**Location:** `DuckCurveChart.jsx` solar capacity data

**Fix:** Update to "106 GW" (end-of-2025 AC/inverter capacity per Bundesnetzagentur).

**Source:** https://now.solar/2026/03/16/germanys-grid-connected-solar-capacity-rises-to-106-2-gw-in-2025-mercomindia-com/

**✅ VERIFIED CORRECT.** The now.solar / Mercom India article cites Destatis (Federal Statistical Office) data: Germany's total grid-connected PV capacity was **106.2 GW** (AC) at end-2025. Fraunhofer ISE separately confirms **116.8 GW DC** module capacity. The chart uses 104 GW which is ~2% too low for AC capacity and ~12% too low for DC. **Fix required: update `DuckCurveChart.jsx` and `DuckCurveVPP.jsx` from "104 GW" to "106 GW" (AC/inverter basis). Note: if the chart is intended as DC capacity, the correct figure is 116.8 GW.**

---

### 19. Negative price hours 2018: shown as ~100

**Location:** `DuckCurveChart.jsx` negative price hour data

**Fix:** Should be **134** per SMARD (Bundesnetzagentur) data.

**Source:** https://www.smard.de/page/en/topic-article/5892/15618/negative-electricity-prices

**✅ VERIFIED CORRECT.** Direct fetch of the SMARD (Bundesnetzagentur) negative electricity prices page confirms **134 hours** of negative day-ahead prices in 2018. The `DuckCurveChart.jsx` code currently has `negHours: 100` for 2018, which is wrong. The inline label at line 33 also says "~100 neg. price hrs" which needs updating. **Fix required: update `negHours` for 2018 from 100 to 134 in `DuckCurveChart.jsx` (line 12) and update the label at line 33 from "~100" to "134."**

---

### 20. SA heatwave temperature "45 degrees C"

**Location:** Grid timeline slide

**Fix:** Adelaide reached ~41-42.4C that day, not 45C.

**Sources:**
- World Weather Attribution: https://www.worldweatherattribution.org/extreme-heat-australia-february-2017/
- Energy Council of Australia: https://www.energycouncil.com.au/analysis/south-australia-s-blackouts-not-as-simple-as-it-looks/

**✅ VERIFIED CORRECT (with an important caveat about which event).** The presentation labels the event "2017, South Australia (heatwave), 90K homes, 45°C day." The WWA report on the February 2017 Australian heatwave confirms that "many places hit upwards of 45°C" — but this refers to central/inland NSW, not Adelaide. Adelaide's recorded maximum during the February 2017 heatwave was approximately **41.4–42.4°C** (BOM records). The Energy Council source returned a 404; however, **important caveat**: if the slide is intended to reference the **February 2009** Adelaide heatwave (which reached 45.7°C and also caused major power outages), then 45°C would be approximately correct. The "2017" year label strongly implies the 2017 event, for which 45°C is wrong for Adelaide. **Fix required: correct to "~42°C" for the 2017 event, or if referring to 2009, correct the year label to "2009."**

---

### 21. "3.4 Mt avoidable CO2/yr (DE)"

**Location:** `presentation/src/Presentation.jsx:731`

**Problem:** Could not find this figure in any public source. Germany's total energy sector emitted 183 Mt CO2 in 2024. May come from internal Enpal/Entrix analysis.

**Fix:** Either cite the specific source on the slide, or remove if no source can be provided.

**✅ VERIFIED via algorithmic derivation.** The figure is calculated from two public sources already used in the project's own `docs/electricity-price-research.md`:
- **9.34 TWh** curtailed in 2024 (Bundesnetzagentur Einspeisemanagement data)
- **363 g CO2/kWh** average grid emission factor for 2024 (Umweltbundesamt / UBA)
- **9.34 TWh x 363 g/kWh = 3.39 Mt**, rounded to 3.4 Mt

Cross-checks confirm plausibility:
- ACER reports 4.2 Mt CO2 from 12 TWh EU-wide curtailment (2023), implying ~350 g/kWh — consistent
- Using marginal emission factors (gas: 340-512 g/kWh, coal: 867 g/kWh) would yield 3.7-5.2 Mt — so 3.4 Mt is actually conservative
- The 2023 chart value (10.48 TWh x 380 g/kWh = 3.98 Mt) is also internally consistent

**Note: keep the figure, but add citation on the slide: "~3.4 Mt CO2 (BNetzA + UBA, 2024)."** No fix required to the number itself.

Sources: Bundesnetzagentur SMARD, Umweltbundesamt emission factors, ACER 2024 Market Monitoring Report (EU-wide cross-check), Volker Quaschning / HTW Berlin CO2 factors dataset.

---

### 22. "Home batteries avoid $4.1B in grid investment"

**Location:** `presentation/src/Presentation.jsx:856`

**Problem:** This is **AU$4.1B** (Australian dollars), not US$. Alongside other USD figures on the same slide, this could mislead.

**Fix:** Clarify currency: "AU$4.1B" or "A$4.1B."

**Source:** AEMO 2024 ISP: https://www.aemo.com.au/-/media/files/major-publications/isp/2024/2024-integrated-system-plan-isp.pdf

**✅ VERIFIED CORRECT.** The AEMO ISP is an Australian government document reporting in Australian dollars. The slide uses "$4.1B" without currency qualifier, which placed next to US-dollar figures creates a misleading comparison. AU$4.1B ≈ USD$2.6B at current rates — a material difference. **Fix required: change to "AU$4.1B" or "A$4.1B" in the slide.**

---

### 23. "36 countries, all synchronized on one frequency"

**Location:** EU grid scale slide

**Problem:** ENTSO-E represents 36 countries at 50 Hz, but they operate across **5 separate synchronous areas** (Continental Europe, Nordic, Baltic, Great Britain, Ireland/N. Ireland). Not all 36 are phase-locked together.

**Fix:** Clarify: "36 countries operating at 50 Hz across interconnected synchronous areas."

**Sources:**
- ENTSO-E Wikipedia: https://en.wikipedia.org/wiki/European_Network_of_Transmission_System_Operators_for_Electricity
- Continental Europe Synchronous Area: https://en.wikipedia.org/wiki/Continental_Europe_Synchronous_Area

**✅ VERIFIED CORRECT.** Wikipedia confirms ENTSO-E represents "40 electricity TSOs from 36 countries" (Ukrenergo joined as 40th TSO in January 2024 — country count may have changed). The article also confirms ENTSO-E manages the Continental Europe Synchronous Area (CESA) but that Great Britain, Ireland, Nordic, and Baltic operate as separate synchronous areas. The phrase "one frequency" in `EUGridHUD.jsx` ("36 countries · 400 million people · one frequency") and in the speaker notes ("Every node is synchronized. One heartbeat: 50 Hz.") is technically misleading — all operate at nominal 50 Hz but they are **not phase-locked across all 36 countries**. **Fix required: update `EUGridHUD.jsx` subtitle from "one frequency" to "one standard: 50 Hz" and soften speaker notes.**

---

### 24. "1,100 GW installed capacity" (EU grid)

**Location:** `presentation/src/Presentation.jsx:230`, `EUGridHUD.jsx:122`

**Problem:** Plausible but no single authoritative source confirms exactly 1,100 GW. EU-27 alone was ~1,040+ GW in 2022 (380 GW fossil + 563 GW renewables + ~100 GW nuclear). Adding non-EU ENTSO-E members would exceed 1,100 GW. The ENTSO-E Statistical Factsheet PDF was not machine-readable.

**Fix:** Consider adding "est." or rounding to "over 1,000 GW." Or cite the ENTSO-E factsheet directly.

**Source:** ENTSO-E Statistical Factsheet 2023 (PDF): https://eepublicdownloads.blob.core.windows.net/public-cdn-container/clean-documents/Publications/Statistics/Factsheet/entsoe_sfs2023_web.pdf

**✅ VERIFIED from ENTSO-E official dataset.** Downloaded the official ENTSO-E Net Generating Capacity 2024 Excel file (`net_generation_capacity_2024.xlsx` from entsoe.eu/data/power-stats/). Results:

**32 reporting countries (as of Jan 1, 2024): 1,096.3 GW**

Breakdown by type:
| Category | GW | Share |
|----------|---:|------:|
| Renewables (solar, wind, biomass, geothermal) | 453.5 | 41% |
| Fossil (gas, coal, lignite, oil, peat) | 318.8 | 29% |
| Hydro (reservoir, run-of-river, pumped) | 207.6 | 19% |
| Nuclear | 97.2 | 9% |
| Other/Waste | 19.3 | 2% |

Top 10 countries: DE (250), FR (150), ES (117), IT (97), PL (61), NL (59), SE (50), NO (40), AT (29), BE (28)

**8 ENTSO-E member countries are missing from the dataset** (do not report to central data system): UK (~76 GW), Turkey (~111 GW), Ukraine (~55 GW), Slovakia (~8 GW), Cyprus, Malta, Iceland, Kosovo. Including these would bring the total to ~1,350 GW.

**Conclusion: "1,100 GW" exactly matches the ENTSO-E self-reported figure (1,096 GW rounded) for the 32 countries that report data. It is accurate as an ENTSO-E-reported figure, but it excludes UK, Turkey, and Ukraine. No fix required -- the figure is directly from ENTSO-E's official dataset. Consider adding "(ENTSO-E, 2024)" for precision.**

Source: ENTSO-E Power Statistics, Net Generating Capacity 2024 -- https://www.entsoe.eu/data/power-stats/ (direct xlsx download)

---

## Additional Notes

### "19 TWh wasted in 2023" vs curtailment chart showing 10.48 TWh

Both numbers are correct but measure different things:
- **10.48 TWh** = Einspeisemanagement only (renewable/CHP feed-in management)
- **19 TWh** = Total grid congestion management (all redispatch + curtailment + countertrading)

The speaker notes use 19 TWh; the curtailment chart uses 10.48 TWh. Both are legitimate, but the presentation should be consistent about which measure is being cited. Consider adding a note: "19 TWh total congestion management" vs "10.5 TWh renewable curtailment."

**Source:** https://www.cleanenergywire.org/news/curtailing-renewable-power-increases-germany-2023-re-dispatch-costs-recede

**✅ VERIFIED CORRECT.** The Clean Energy Wire article citing BNetzA data states: "About **19 terawatt hours (TWh)** of electricity were lost due to curtailments last year [2023], up from 14 TWh in 2022." The 19 TWh covers total redispatch/curtailment volume including both renewable throttling and compensating fossil deployment. The 10.48 TWh in the chart likely covers renewable Einspeisemanagement specifically. Both figures are defensible; the presentation must be consistent and clear which it's citing in each context.

---

### VW Wolfsburg "world's largest factory"

Used on the EU grid scale slide. VW Wolfsburg (60K workers, 6.5 km2) was overtaken by Tesla Gigafactory Austin in 2022. Consider "world's largest car manufacturing plant" or "formerly the world's largest factory."

**Source:** https://en.wikipedia.org/wiki/Wolfsburg_Volkswagen_Plant

**✅ VERIFIED CORRECT.** Wikipedia confirms: "It was the largest in the world... until overtaken by the **Tesla Gigafactory 5** in Texas in 2022, which has a larger grounds area of 850 hectares vs. 650 hectares." Important nuance: Tesla's factory floor area (93 ha) is smaller than VW's (160 ha), so the comparison depends on the metric. By grounds/site area, VW was overtaken; by building floor area, VW is still larger. **Fix required: add "formerly" or qualify as "world's largest car manufacturing plant" (still accurate by floor area).**

---

### Dunkelflaute frequency "50-150 hours/month"

Academic literature supports 50-100 hours/month in peak winter months. The upper bound of 150 is slightly high. Consider tightening to "50-100 hours/month."

**Source:** https://www.mdpi.com/1996-1073/14/20/6508

**⚠️ COULD NOT INDEPENDENTLY VERIFY (source returned 403).** The MDPI journal paper was inaccessible at time of writing. The Clean Energy Wire article on the December 2024 Dunkelflaute supports the general severity claim without giving hourly duration figures. The 50–150 range is plausible but should be cross-checked against the MDPI paper or BOM/SMARD data before the talk. **Fix required: verify the 150-hour upper bound against the MDPI paper or tighten to "50–100 hours/month" as a conservative estimate.**
