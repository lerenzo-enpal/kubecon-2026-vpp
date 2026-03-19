# The January 8, 2021 European Continental Grid Split

## Key Facts

| Parameter | Value |
|---|---|
| **Date** | Friday, January 8, 2021 |
| **Time of trigger** | 14:04:25.9 CET |
| **System separation complete** | 14:05:08.6 CET |
| **Duration of split** | 63 minutes (14:05 -- 15:08 CET) |
| **Resynchronization** | 15:07:31.6 CET |
| **Trigger location** | Ernestinovo substation, Croatia |
| **Trigger element** | 400 kV busbar coupler tripped by overcurrent protection |
| **Power imbalance** | ~6.3 GW |
| **NW island frequency nadir** | 49.74 Hz (initial drop), stabilized at ~49.84 Hz |
| **SE island frequency peak** | 50.6 Hz (initial spike), settled at 50.2--50.3 Hz |
| **Load shedding activated** | ~1.7 GW (France 1,300 MW + Italy 1,000 MW interruptible load) |
| **Consumer disconnections** | 233 MW total (70 MW NE area + 163 MW SE area) |
| **ICS classification** | Scale 2 (ENTSO-E Incident Classification Scale) |
| **Countries in SE island** | Croatia, Serbia, Bosnia-Herzegovina, Romania, Bulgaria, Greece, North Macedonia, Albania, Montenegro, Turkey |

---

## 1. Timeline: Minute-by-Minute Sequence

### Pre-Event Conditions

The Continental European synchronous area -- the world's largest interconnected AC power system spanning 25 countries and serving ~400 million people -- was operating with large power flows from Southeast to Northwest Europe. The system was in a "special load situation" with significant cross-border transfers.

### Cascade Sequence

| Timestamp (CET) | Event |
|---|---|
| **14:04:25.9** | 400 kV busbar coupler at Ernestinovo substation (Croatia) trips due to overcurrent protection. The two busbars decouple, separating NW-bound and SE-bound power flows through the substation. |
| **14:04:48.9** | 400 kV line Subotica -- Novi Sad (Serbia) trips due to overcurrent protection. Power flow shifts to remaining parallel paths. |
| **14:04:57** | 975 MW generator in Turkey automatically disconnects (overfrequency protection in SE area). |
| **~14:05:00--08** | Multiple additional lines trip due to distance protection relays as cascading overloads propagate across Croatia, Serbia, Hungary, Bosnia-Herzegovina, and Romania. |
| **14:05:07** | Grid frequency in NW area drops below 49.75 Hz. |
| **14:05:08.6** | **System separation complete.** Continental Europe splits into two asynchronous islands. |
| **14:05:09--25** | NW frequency reaches nadir of 49.74 Hz (a 260--270 mHz drop in ~15 seconds). |
| **~14:05:15** | Frequency containment reserves (FCR) and contracted interruptible services activate automatically in France (1,300 MW) and Italy (1,000 MW). |
| **~14:05:30** | Nordic synchronous area provides 420 MW of automatic support via HVDC interconnectors. Great Britain provides 60 MW. |
| **~14:09** | NW frequency deviation limited to +/- 0.1 Hz through reserve activation and manual measures. |
| **14:47** | Contracted interruptible services in Italy reconnected. |
| **14:48** | Contracted interruptible services in France reconnected. |
| **~15:05** | SE area frequency stabilized to within +0.1 Hz deviation. Both areas prepared for resynchronization. |
| **15:07:31.6** | **Resynchronization achieved.** NW and SE areas reconnected via transmission lines in Croatia, Bosnia-Herzegovina, and Serbia. |
| **15:08** | System fully reunified. Normal operations resume. |

### Phase Angle Forensics

Gridradar sensors detected an early phase angle shift at **14:04:18 CET** in Sibiu, Romania -- several seconds before the busbar coupler tripped at 14:04:25.9. This suggests the system was already under stress from the heavy SE-to-NW power flows before the protection relay operated.

---

## 2. Root Cause: The Ernestinovo Busbar Coupler

### What Is a Busbar Coupler?

A busbar coupler is a circuit breaker connecting two busbars (main electrical conductors) within a substation. It allows power to flow between bus sections and provides operational flexibility. At Ernestinovo, the 400 kV busbar coupler connected the NW-bound and SE-bound transmission paths.

### Why It Tripped

The Ernestinovo substation sits at a critical junction in the European grid, connecting:

- **Northwest-bound lines:** Ernestinovo to Zerjavinec (Croatia) and Ernestinovo to Pecs (Hungary)
- **Southeast-bound lines:** Ernestinovo to Ugljevik (Bosnia-Herzegovina) and Ernestinovo to Sremska Mitrovica (Serbia)

On January 8, heavy power transfers from Southeast to Northwest Europe created high loading on the busbar coupler. Manual calculations showed that a trip of the 400 kV line Novi Sad -- Subotica would result in the worst-case loading of the busbar coupler: **1,370 MW and a current of 1,930 A**. While this was technically within the coupler's rated capacity (~2,000 A), the overcurrent protection relay operated at 14:04:25.9, decoupling the two busbars.

### The Cascade Mechanism

Once the busbar coupler opened:

1. Power flows that had been passing through Ernestinovo shifted to neighboring transmission lines
2. These parallel paths became overloaded within seconds
3. The line Subotica -- Novi Sad (Serbia) tripped on overcurrent at 14:04:48.9 (23 seconds later)
4. Additional lines tripped on distance protection relays as the overload cascaded
5. Within **42.7 seconds** of the initial trip, the entire Continental European grid had split in two

---

## 3. Impact: Two Islands

### The Northwest Island (Deficit Area)

- **Countries:** France, Germany, Spain, Portugal, Italy, Switzerland, Austria (western part), Netherlands, Belgium, Luxembourg, Denmark, Poland, Czech Republic, Slovakia, Hungary (most of it)
- **Condition:** Generation deficit of ~6.3 GW
- **Frequency:** Dropped to 49.74 Hz in ~15 seconds, then stabilized at ~49.84 Hz through automatic reserve activation
- **Response:** FCR activation + 1,700 MW interruptible load shedding (France + Italy) + 420 MW Nordic support + 60 MW GB support

### The Southeast Island (Surplus Area)

- **Countries/territories:** Croatia (part), Serbia, Bosnia-Herzegovina, Montenegro, North Macedonia, Albania, Greece, Bulgaria, Romania, Turkey
- **TSOs in SE island:** HOPS (Croatia), EMS (Serbia), NOS BiH (Bosnia-Herzegovina), CGES (Montenegro), MEPSO (North Macedonia), OST (Albania), IPTO (Greece), ESO (Bulgaria), Transelectrica (Romania), TEiAS (Turkey)
- **Condition:** Generation surplus of ~6.3 GW
- **Frequency:** Spiked to 50.6 Hz initially, then settled at 50.2--50.3 Hz
- **Response:** Automatic generator disconnection (975 MW in Turkey at 14:04:57), plus manual generation reduction across SE area

### Consumer Impact

Despite the severity of the split, consumer impact was relatively contained:
- **70 MW** of load disconnected in the Northeast area
- **163 MW** of load disconnected in the Southeast area
- Total: **233 MW** of involuntary consumer disconnections
- Romania experienced localized outages in the northwestern part of the country, restored by ~16:45 CET

---

## 4. Technical Details

### Frequency Dynamics

**NW Island (underfrequency):**
- Pre-event baseline: ~50.02--50.03 Hz
- Rate of frequency decline: ~270 mHz in 13 seconds (~20.8 mHz/s RoCoF)
- Nadir: 49.74 Hz (reported by Gridradar; ENTSO-E reports a similar figure)
- Steady state after FCR: ~49.84 Hz
- Return to 50 Hz: through manual reserves and load reconnection over ~1 hour

**SE Island (overfrequency):**
- Peak: 50.6 Hz (~600 mHz above nominal)
- Steady state: 50.2--50.3 Hz
- Reduction: Through automatic and manual generation curtailment, including the 975 MW Turkish generator trip

### The 6.3 GW Imbalance

The 6.3 GW power deficit in the NW area (and corresponding surplus in the SE area) represented the net power transfer that had been flowing from Southeast to Northwest Europe at the moment of separation. This is the amount of generation the NW area suddenly "lost" and the SE area suddenly had in excess.

For perspective:
- 6.3 GW is roughly equivalent to the output of 6 large nuclear power plants
- It represents about 1.5--2% of typical Continental European total generation (~350--400 GW)
- The system frequency response (FCR + interruptible load) had to compensate for this deficit within seconds

### Automatic Countermeasures Activated

| Measure | Area | Amount | Timing |
|---|---|---|---|
| Frequency Containment Reserves (FCR) | NW | Automatic | Seconds |
| Interruptible industrial load -- France | NW | 1,300 MW | ~14:05 |
| Interruptible industrial load -- Italy | NW | 1,000 MW | ~14:05 |
| Nordic HVDC support | NW | 420 MW | Automatic |
| GB HVDC support | NW | 60 MW | Automatic |
| Generator trip (overfrequency) | SE (Turkey) | 975 MW | 14:04:57 |
| Manual generation reduction | SE | Various | Minutes |

---

## 5. Critical Danger: How Close to Collapse

### The 47.5 Hz Threshold

Under EU Regulation 2016/631 (Requirements for Generators network code) and the ENTSO-E Continental Europe operational standards, generators are required to remain connected down to **47.5 Hz**. Below this threshold:

- All generators are designed to disconnect from the grid for self-protection
- Once generators disconnect en masse, the frequency collapses further
- This creates an unrecoverable cascade leading to **total system blackout**
- A complete Continental European blackout would affect ~400 million people and could take days to fully restore through "black start" procedures

### How Close Did They Get?

The NW island frequency nadir of **49.74 Hz** was **2.24 Hz above the 47.5 Hz collapse threshold**. This sounds like a comfortable margin, but:

- The frequency dropped 270 mHz in just 13 seconds
- At that rate of decline (~20.8 mHz/s), the system would have reached 47.5 Hz in approximately **108 additional seconds** (under 2 minutes) if no countermeasures had activated
- The interruptible load shedding (1,700 MW in France and Italy) was the critical intervention that arrested the decline
- Had those contracted interruptible services not been available or had they failed to activate, automatic underfrequency load shedding (UFLS) would have engaged at lower frequency thresholds (typically starting at 49.0 Hz in Continental Europe), involuntarily disconnecting millions of consumers

### The SE Island Risk

The SE island faced the opposite problem -- overfrequency. At 50.6 Hz, generators begin to trip on overfrequency protection. The 975 MW Turkish generator that tripped at 14:04:57 was an example. If enough generators had tripped, the SE island could have oscillated between over- and underfrequency, potentially cascading into its own blackout.

### Perspective: 1.25 Hz from UFLS

The NW frequency nadir of 49.74 Hz was only **0.74 Hz** above the typical first stage of automatic UFLS in Continental Europe (49.0 Hz). UFLS involves involuntary disconnection of consumer load in progressive stages -- each stage shedding ~5--10% of total load. Once UFLS activates, the event moves from "managed incident" to "partial blackout."

---

## 6. Duration and Resynchronization

### The 63-Minute Split

The two islands operated asynchronously from 14:05:08.6 to 15:07:31.6 CET -- approximately **63 minutes**.

### Resynchronization Process

Resynchronizing two AC power islands requires:

1. **Frequency matching:** Both islands must be brought to nearly identical frequencies (~50 Hz)
2. **Voltage matching:** Voltage magnitudes must be aligned
3. **Phase angle alignment:** The AC waveforms must be synchronized (in phase) at the reconnection point
4. **Coordinated switching:** Circuit breakers must close at the precise moment of phase alignment

The process:
- TSOs in both areas manually adjusted generation to bring frequencies back to 50 Hz
- The ENTSO-E Awareness System (EAS) -- a real-time information exchange platform introduced after the 2006 event -- enabled TSOs to coordinate across countries
- Interruptible services in Italy were reconnected at 14:47, France at 14:48
- Resynchronization was achieved at 15:07:31.6 via transmission lines operated by the Croatian (HOPS), Bosnian (NOS BiH), and Serbian (EMS) TSOs
- The Monita DC link between Montenegro (CGES) and Italy (Terna) supported the process by providing controllable power transfer

---

## 7. Key Failures and Systemic Vulnerabilities

### Why Could a Single Substation Split Europe's Grid?

**1. Critical geographic bottleneck:**
Ernestinovo sits on the main transmission corridor between Southeast and Northwest Europe. With heavy SE-to-NW power flows, it was a critical chokepoint. Loss of the busbar coupler eliminated a key parallel path, overloading the remaining paths within seconds.

**2. Protection relay coordination issues:**
The busbar coupler's overcurrent protection tripped even though the current (~1,930 A) was technically within the coupler's rated capacity (~2,000 A). This suggests the protection relay settings may have been overly conservative, or the relay operated on a time-current characteristic that was not coordinated with the coupler's actual thermal rating.

**3. Insufficient N-1 margins:**
The N-1 security criterion requires that the system must withstand the loss of any single element without cascading failures. While TSOs had performed N-1 analysis and "no N-1 problems were identified" in pre-event security assessments, the actual event revealed that the analysis did not adequately account for the busbar coupler as a critical element, or that the protection relay settings were not aligned with the system's operational state.

**4. Large cross-border power flows:**
The ENTSO-E investigation found that "large pan-European electric power flows and the low stability margins in the system played a crucial role." The SE-to-NW transfer of ~6.3 GW was straining the transmission system before the event.

**5. Speed of cascade:**
The entire split occurred in 42.7 seconds. This is far too fast for any human operator to intervene. The cascade was driven entirely by automatic protection relay operations, each of which was correct in isolation (protecting individual equipment from overload) but collectively destabilizing.

**6. Inadequate busbar coupler monitoring:**
The busbar coupler was not being monitored with the same level of scrutiny as transmission lines in the N-1 security analysis. This is a systemic gap -- busbars and busbar couplers within substations are often treated differently from interconnecting lines in security assessments.

---

## 8. Aftermath: ENTSO-E Investigation

### Investigation Structure

An Expert Investigation Panel was established on March 4, 2021, under Commission Regulation (EU) 2017/1485 (System Operation Guideline). The panel comprised:
- Representatives of affected TSOs
- ENTSO-E staff
- Regional Security Coordinators (RSCs)
- National energy regulators
- ACER (EU Agency for the Cooperation of Energy Regulators)

### Report Timeline

| Date | Publication |
|---|---|
| January 8, 2021 | Initial ENTSO-E press release confirming system split and resolution |
| January 15, 2021 | First update with preliminary frequency and power flow data |
| January 26, 2021 | Second update identifying Ernestinovo as trigger location |
| February 25, 2021 | Interim report with detailed cascade sequence |
| July 15, 2021 | **Final report** with comprehensive analysis and 22 recommendations |
| October 2021 | Version 2.0 of the main report (updated) |

### Key Findings

1. **Root cause was not renewable energy:** ENTSO-E explicitly stated that the incident "was not caused by high shares of renewable energy sources." The trigger was a protection relay operation at a conventional substation.

2. **Large pan-European power flows were the underlying stress factor:** The heavy SE-to-NW transfers reduced stability margins.

3. **Protection relay settings played a critical role:** The busbar coupler tripped despite the current being technically within rated limits.

4. **System defense plans worked:** FCR activation, interruptible load shedding, and cross-border coordination prevented the incident from escalating to a blackout.

5. **The ENTSO-E Awareness System (EAS) proved its value:** Real-time cross-border information sharing enabled faster coordination than in 2006.

### The 22 Recommendations

The expert panel issued 22 recommendations across three categories:

**Operational Security Calculations:**
- Improve the methodology for assessing internal substation elements (busbars, busbar couplers) in N-1 security analysis
- Enhance real-time monitoring of substation-internal power flows
- Review and harmonize protection relay settings across borders
- Improve coordination between TSOs on cross-border security calculations

**Frequency Analysis and Support:**
- Review frequency containment reserve (FCR) adequacy
- Analyze the role of system inertia in limiting frequency deviations
- Assess the adequacy of automatic defense plans (UFLS, interruptible load)
- Improve frequency measurement and monitoring infrastructure

**TSO Communication and Coordination:**
- Enhance real-time communication protocols between TSOs during emergencies
- Improve coordination with Regional Security Coordinators
- Review and update the ENTSO-E Awareness System (EAS)
- Conduct regular pan-European system split exercises

---

## 9. Comparison: 2021 vs. 2006 UCTE Split

### The 2006 Event (November 4, 2006)

On the evening of November 4, 2006, the UCTE (predecessor to ENTSO-E Continental Europe synchronous area) experienced a far more severe system split, triggered by a planned disconnection of a 380 kV transmission line in northern Germany (E.ON Netz control area) to allow a cruise ship to pass under the Ems River crossing.

| Parameter | 2006 UCTE Split | 2021 CE Split |
|---|---|---|
| **Trigger** | Planned line disconnection (Ems crossing, Germany) | Overcurrent trip of busbar coupler (Ernestinovo, Croatia) |
| **Number of islands** | 3 (West, Northeast, Southeast) | 2 (Northwest, Southeast) |
| **Worst frequency deviation** | 49.0 Hz (West island, ~1 Hz drop) | 49.74 Hz (NW island, ~0.26 Hz drop) |
| **Overfrequency peak** | 51.4 Hz (NE island) | 50.6 Hz (SE island) |
| **Power imbalance** | ~10,000 MW (NE surplus, ~17% of area generation) | ~6,300 MW |
| **Consumer impact** | 15 million households, widespread blackouts | 233 MW disconnected, minimal consumer impact |
| **UFLS activation** | Yes, automatic load shedding in Western island | No, arrested by interruptible load before UFLS |
| **Wind generation impact** | 60% of wind generation tripped after frequency drop | Not a factor |
| **Duration of split** | ~38 minutes | ~63 minutes |
| **Full restoration** | <2 hours | ~1 hour |
| **Severity** | Near-catastrophic | Serious but well-managed |

### Key Differences

**1. Lessons learned from 2006 made 2021 better:**
- The ENTSO-E Awareness System (EAS), introduced after 2006, enabled real-time cross-border coordination
- Contracted interruptible load services (France, Italy) provided 1.7 GW of fast demand reduction
- System defense plans were better tested and maintained
- The binding EU legal framework (Regulation 2017/1485) established clear operational security requirements

**2. 2006 was much worse:**
- Three islands instead of two
- 15 million households lost power vs. 233 MW of load curtailed
- Frequency dropped to 49.0 Hz (West) -- triggering automatic UFLS and widespread blackouts
- The NE island reached 51.4 Hz overfrequency, far more dangerous than 2021's 50.6 Hz
- 60% of wind generation disconnected, worsening the deficit in the Western island

**3. 2021 was still classified as "one of the most critical near-blackout situations since 2006":**
- Despite better outcomes, the speed of the cascade (42.7 seconds) and the 6.3 GW imbalance demonstrated ongoing systemic risks
- The vulnerability of a single substation element exposing the entire grid was a sobering finding

---

## 10. Relevance to Virtual Power Plants (VPPs)

### The Core Problem VPPs Can Address

The 2021 grid split exposed a fundamental vulnerability: the Continental European grid relies on a relatively small number of large, centralized assets for frequency response. When the NW island lost 6.3 GW of generation in seconds, the defense depended on:

- A limited pool of contracted interruptible industrial loads (1.7 GW in two countries)
- Slow-responding conventional FCR (seconds to minutes)
- HVDC support from neighboring synchronous areas (480 MW total)

A large-scale VPP fleet with distributed battery storage could provide a fundamentally different -- and faster -- response.

### How VPPs Could Have Helped

**1. Sub-second frequency response:**
Battery storage in a VPP can respond to frequency deviations within milliseconds (synthetic inertia) to seconds (fast frequency response / FFR). Compared to the ~15-second timeline over which the NW frequency dropped to 49.74 Hz, distributed batteries could have begun injecting power within the first 100--200 ms, significantly reducing the frequency nadir.

**2. Geographic distribution reduces cascade risk:**
Unlike the centralized interruptible loads in France and Italy, VPP assets distributed across thousands of homes and businesses in Germany, Austria, and elsewhere in the NW area would provide frequency support from within the affected area, reducing reliance on a few large industrial sites.

**3. Bidirectional response:**
In the SE island, the opposite problem existed -- excess generation causing overfrequency. VPP batteries could absorb excess energy (charge), reducing overfrequency without requiring generator trips. The 975 MW Turkish generator that disconnected could have remained online if distributed batteries had absorbed the surplus.

**4. Scaling the response:**
Consider the Enpal/Flexa VPP model at scale:
- 100,000 home batteries at 5 kW each = 500 MW of fast frequency response
- 500,000 home batteries = 2.5 GW -- more than the interruptible load in France and Italy combined
- Response time: milliseconds vs. seconds for interruptible load contracts
- No consumer disruption: batteries respond transparently, unlike disconnecting industrial loads

**5. Reduced dependence on geographic bottlenecks:**
VPPs by their nature are not concentrated at single substations or transmission corridors. A VPP fleet spread across Germany cannot be isolated by the trip of a single busbar coupler in Croatia.

### VPP Frequency Response in Practice

Modern VPPs already participate in Frequency Containment Reserve (FCR) markets:
- FCR requires response within 30 seconds of a frequency deviation
- Batteries can respond in <1 second, far exceeding the requirement
- Enhanced Frequency Response (EFR) / Fast Frequency Response (FFR) products are emerging that leverage battery speed
- Grid codes increasingly recognize sub-second response as a separate, higher-value product

### The Key Insight for the Presentation

The January 8, 2021 event demonstrates that **grid stability is no longer just a transmission-level problem solvable by a few large assets.** The speed of modern cascading failures (42.7 seconds from trigger to system split) demands faster, more distributed response capabilities.

A pan-European VPP fleet providing:
- **Synthetic inertia** (millisecond response)
- **Fast frequency response** (sub-second to seconds)
- **FCR** (seconds to 30 seconds)
- **aFRR** (automatic frequency restoration, minutes)

...would fundamentally change the grid's resilience profile, making events like January 8, 2021 far less dangerous and potentially preventing the cascade from escalating to a system split in the first place.

---

## 11. Sources

### ENTSO-E Official Reports and Communications

1. **Initial press release (January 8, 2021):**
   [System split registered in the synchronous area of Continental Europe -- Incident now resolved](https://www.entsoe.eu/news/2021/01/08/system-split-registered-in-the-synchronous-area-of-continental-europe-incident-now-resolved/)

2. **First update (January 15, 2021):**
   [System Separation in the Continental Europe Synchronous Area on 8 January 2021 -- update](https://www.entsoe.eu/news/2021/01/15/system-separation-in-the-continental-europe-synchronous-area-on-8-january-2021-update/)

3. **Second update (January 26, 2021):**
   [System separation in the Continental Europe Synchronous Area on 8 January 2021 -- 2nd update](https://www.entsoe.eu/news/2021/01/26/system-separation-in-the-continental-europe-synchronous-area-on-8-january-2021-2nd-update/)

4. **Interim report (February 25, 2021):**
   [ENTSO-E Interim Report (PDF)](https://eepublicdownloads.azureedge.net/clean-documents/Publications/Position%20papers%20and%20reports/entso-e_CESysSep_interim_report_210225.pdf)

5. **Final report announcement (July 15, 2021):**
   [Final report on the separation of the Continental Europe power system on 8 January 2021](https://www.entsoe.eu/news/2021/07/15/final-report-on-the-separation-of-the-continental-europe-power-system-on-8-january-2021/)

6. **Final report main document (PDF, updated October 2021):**
   [Continental Europe Synchronous Area Separation on 08 January 2021 -- Main Report](https://eepublicdownloads.entsoe.eu/clean-documents/SOC%20documents/SOC%20Reports/Continental%20Europe%20Synchronous%20Area%20Separation%20on%2008%20January%202021%20-%20Main%20Report_updated.pdf)

7. **Final report annexes (PDF):**
   [Continental Europe Synchronous Area Separation on 08 January 2021 -- Annexes](https://eepublicdownloads.azureedge.net/clean-documents/SOC%20documents/SOC%20Reports/Continental_Europe_Synchronous_Area_Separation_on_08_January_2021_-_Annexes_updated.pdf)

8. **ACER-ENTSO-E joint investigation announcement:**
   [ACER and ENTSO-E investigate the 8 January electricity system separation](https://www.entsoe.eu/news/2021/02/26/acer-and-entso-e-investigate-the-8-january-electricity-system-separation/)

### Third-Party Analysis and Reporting

9. **Gridradar frequency analysis:**
   [System split grid frequency below 49.75 Hz 08.01.2021](https://gridradar.net/en/blog/post/underfrequency_january_2021)

10. **Balkan Green Energy News -- split analysis:**
    [How the Continental Europe synchronous area was split into two grid regions](https://balkangreenenergynews.com/how-the-continental-europe-synchronous-area-was-split-into-two-grid-regions/)

11. **Balkan Green Energy News -- resynchronization:**
    [How BiH, Croatia, Serbia TSOs united two grid regions](https://balkangreenenergynews.com/how-bih-croatia-serbia-tsos-reconnected-two-grid-regions-of-continental-europe-synchronous-area/)

12. **Balkan Green Energy News -- initial report:**
    [Breakdown of Continental Europe synchronous area started in Croatia](https://balkangreenenergynews.com/breakdown-of-continental-europe-synchronous-area-started-in-croatia/)

13. **CE Energy News -- near-blackout analysis:**
    [One of the most critical near-blackout since 2006](https://ceenergynews.com/electricity/one-of-the-most-critical-near-blackout-since-2006-system-separation-in-continental-europe/)

14. **CE Energy News -- RES not the cause:**
    [ENTSO-E: January's system separation was not caused by high shares of RES](https://ceenergynews.com/electricity/entso-e-januarys-system-separation-in-continental-europe-was-not-caused-by-high-shares-of-res/)

15. **Swissgrid analysis:**
    [The systems and processes worked correctly](https://www.swissgrid.ch/en/home/newsroom/blog/2021/the-systems-and-processes-worked-correctly.html)

16. **European Parliament question:**
    [EU power supply failure -- Parliamentary question P-000225/2021](https://www.europarl.europa.eu/doceo/document/P-9-2021-000225_EN.html)

17. **IENE analysis:**
    [Special IENE News Analysis following the Electricity System Separation Incident](https://www.iene.eu/special-iene-news-analysis-following-the-electricity-system-separation-incident-of-january-8-p6114.html)

### 2006 UCTE Event References

18. **UCTE Final Report (2006 event, PDF):**
    [Final Report -- System Disturbance on 4 November 2006](https://eepublicdownloads.entsoe.eu/clean-documents/pre2015/publications/ce/otherreports/Final-Report-20070130.pdf)

19. **UCTE Annual Report 2006 -- Lessons Learned:**
    [UCTE Annual Report 2006 -- Lessons learnt from the disturbance](https://eepublicdownloads.entsoe.eu/clean-documents/pre2015/publications/ce/report_2006_5.pdf)

### EU Regulatory Framework

20. **EU Regulation 2016/631 -- Requirements for Generators (RfG):**
    [Commission Regulation (EU) 2016/631](https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:32016R0631)

21. **ENTSO-E System Operations Reports:**
    [System Operations Reports](https://www.entsoe.eu/publications/system-operations-reports/)
