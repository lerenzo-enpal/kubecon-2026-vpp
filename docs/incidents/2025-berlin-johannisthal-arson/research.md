# Berlin Power Grid Arson -- Johannisthal -- 2025

## Quick Reference

| Field | Value |
|-------|-------|
| **Date** | September 9, 2025 |
| **Location** | Berlin, Johannisthal / Adlershof district (Treptow-Kopenick) |
| **Duration** | ~60 hours (restored Sept 11, 4:37 PM) |
| **People Affected** | ~42,000-50,000 households + ~3,000 businesses |
| **Deaths** | 0 |
| **Economic Cost** | Not publicly quantified |
| **Root Cause** | Arson -- deliberate attack on two 110 kV transmission pylons at overhead-to-underground cable transition |
| **Grid Frequency Impact** | Localized (not a frequency event) |
| **Load Shed** | ~50,000 endpoints disconnected |
| **Slides Referenced** | Slide 12 (Not an Isolated Incident -- "Berlin Arson (x2)") |

**See also:** [2026 Berlin Teltow Canal Arson](../2026-berlin-teltow-canal-arson/research.md) -- the second attack in this series, by Vulkangruppe.

## Timeline

| Time | Event |
|------|-------|
| **~3:30 AM, Sept 9, 2025** | Unknown perpetrators set fire to two 110 kV overhead line pylons in Johannisthal |
| **Sept 9, morning** | Fires destroy multiple 110 kV high-voltage cables, severing power to several distribution substations |
| **By 10:21 AM, Sept 9** | 14,000 customers reconnected |
| **By 4:28 PM, Sept 9** | Additional 3,000 restored |
| **Evening, Sept 9** | 31,000 customers remain without power |
| **Sept 9-11** | Stromnetz Berlin establishes temporary connection between two lines near the damaged pylons |
| **Sept 11, 4:37 PM** | Full restoration -- power to all affected areas |

## Root Cause Analysis

Deliberate arson targeting two 110 kV transmission pylons at the **transition point from overhead lines to underground cables** -- a critical junction in the grid topology. The attackers reportedly wrapped steel chains around the cable insulation and ignited accelerants, causing a massive short circuit that cascaded through the network.

### Infrastructure Targeted

- **Two 110 kV transmission pylons** at the overhead-to-underground cable transition
- Located near the **Adlershof Technology Park** (WISTA), Berlin's largest tech and science campus
- The Neukolln district heating plant also lost power as a secondary effect

### Contributing Factors

- Vulnerable above-ground infrastructure at a critical transition point
- Physically accessible with minimal security
- Required **"insider knowledge"** per SPD official -- the pylons' connection to Adlershof's power supply was not obvious
- Multiple critical cables sharing a single physical path (no redundancy for concentrated crossings)
- Heavy cable replacement requires civil engineering, not just electrical work (slow repair)

### Cascade Mechanism

Not a technical cascade -- direct physical destruction of infrastructure at a concentrated junction point. Destroying the overhead-to-underground transition point severed power to several downstream distribution substations simultaneously.

## Claim of Responsibility

An anonymous communique posted on **Indymedia** (a left-wing media platform) claimed the action, stating it was "an attack on the military-industrial complex" targeting the Adlershof technology park. The group named specific companies: **Atos, Jenoptik, Siemens, and the German Aerospace Centre (DLR)**, accusing them of supplying militaries, enabling border surveillance, and environmental destruction.

The communique stated it was "by no means our intention" to cut residential power -- the goal was to "turn off the juice to the military-industrial complex."

**Note:** The September 2025 attack was attributed but not formally claimed by Vulkangruppe. The January 2026 Teltow Canal attack was explicitly claimed by the Vulkangruppe.

## Investigation

Berlin police confirmed arson and the State Security division took over the investigation. Authorities described the attack as "possibly politically motivated."

## Grid Context

Berlin's distribution grid has been subject to multiple deliberate attacks. This was the first major arson incident, preceding the [2026 Teltow Canal attack](../2026-berlin-teltow-canal-arson/research.md) by approximately 4 months. Together they represent an escalating pattern of infrastructure sabotage in Berlin.

### Infrastructure Vulnerability

Both attacks (September 2025 and January 2026) targeted **exposed, above-ground infrastructure junctions**:

1. **Transition pylons** (Johannisthal): where overhead lines meet underground cables -- a single point of failure
2. **Cable bridges** (Teltow Canal): concentrated cable runs crossing waterways in accessible, unprotected locations

These junctions are:
- Physically accessible with minimal security
- Structurally concentrated -- destroying one point severs multiple circuits
- Slow to repair -- heavy cable replacement requires civil engineering
- Cascading -- losing transmission-level cables (110 kV) blacks out entire distribution networks downstream

## Response & Recovery

Full restoration required approximately 60 hours. Stromnetz Berlin established a temporary connection between two lines near the damaged pylons as an interim solution. Restoration was sequential:
- 14,000 customers by 10:21 AM on Sept 9
- Additional 3,000 by 4:28 PM on Sept 9
- Remaining 31,000 customers over the following two days

Heightened security awareness but limited physical hardening of distribution assets.

## Vulkangruppe: Background

The **Vulkangruppe** (Volcano Group) is a far-left, eco-anarchist militant group that has conducted infrastructure sabotage operations in the Berlin-Brandenburg region since at least **2011**.

### Ideology

- Anti-capitalist, anti-fossil fuel, eco-anarchist
- Opposes what they term the "military-industrial complex"
- Insurrectionary anarchist tradition: non-hierarchical cell structure with independent attacks
- Has labeled Tesla CEO Elon Musk a "techno-fascist"
- Connects environmental destruction to colonialism and patriarchy

### Known Attacks

| Date | Target | Impact |
|------|--------|--------|
| October 2011 | Railway infrastructure (Berlin area) | Major rail disruptions; claimed as "Hekla-Empfangskomitee" |
| March 5, 2024 | Electricity pylon near Tesla Gigafactory, Grunheide | Factory halted for days; ~$1 billion in damages |
| September 9, 2025 | 110 kV pylons, Johannisthal (attributed, not formally claimed by Vulkangruppe) | 50,000 endpoints, 60-hour outage |
| January 3, 2026 | Cable bridge, Teltow Canal / Lichterfelde | 45,000 households, 4-5 day outage |

### Organizational Structure

German authorities report the group's "organisational structure, size, and membership demographics are unknown." They operate with non-hierarchical structures that privilege independent attacks and limit information known by each member -- consistent with insurrectionary anarchist operational security. The group has been active for over a decade with **11 known arson attacks** but no arrests, suggesting sophisticated operational discipline.

## VPP Relevance

- **Response time gap:** N/A -- physical destruction, not frequency event
- **Flexibility gap:** Homes with batteries and islanding capability could have maintained power during the 60-hour outage. Solar + battery systems could island and maintain critical loads even when the grid is physically severed.
- **Architecture lesson:** Distributed energy resources provide resilience against physical attacks on centralized infrastructure. A VPP with islanding-capable homes could have kept a significant portion of affected households powered. Centralized distribution with single points of failure (transition pylons, cable bridges, substations) is vulnerable to deliberate attack in ways that distributed generation + storage cannot be.

## Key Statistics for Presentation

| Stat | Value | Source | Confidence |
|------|-------|--------|------------|
| Households affected | ~42,000-50,000 | Stromnetz Berlin / media reports | Medium-High |
| Businesses affected | ~3,000 | Media reports | Medium |
| Outage duration | ~60 hours | Stromnetz Berlin | High |
| Infrastructure destroyed | Two 110 kV pylons | Stromnetz Berlin / police | High |
| Affected neighborhoods | Johannisthal, Adlershof, Altglienicke, Bohnsdorf, Niederschoneweide, Grunau | Stromnetz Berlin | High |

## Fact-Check Notes

- Presentation shows "Berlin Arson (x2)" -- this is one of the two incidents (along with 2026 Teltow Canal)
- Earlier versions of the presentation incorrectly stated 3 attacks; confirmed count is 2 major incidents
- Household count varies across sources: 42,000-50,000 range; use ~50,000 for consistency with Stromnetz Berlin peak figure

## Sources

1. [Stromnetz Berlin: Update on Power Outage Treptow-Kopenick](https://www.stromnetz.berlin/en/about-us/press/press-releases-2025/update-on-power-outage-treptow-kopenick/)
2. [Stromnetz Berlin: End of Power Outage Treptow-Kopenick](https://www.stromnetz.berlin/en/about-us/press/press-releases-2025/5-updateend-of-power-outage-storung-treptow-kopenick/)
3. [Berlin.de: Power Supply Restored in Treptow-Kopenick](https://www.berlin.de/en/news/9890881-5559700-power-supply-restored-in-treptowkoepenic.en.html)
4. [The Berliner: 50,000 Households Without Power Due to Fire](https://www.the-berliner.com/english-news-berlin/50000-households-johannisthal-without-power-due-to-fire-police-suspect-arson/)
5. [Brussels Signal: Politically Motivated Arson Attack](https://brusselssignal.eu/2025/09/possibly-politically-motivated-arson-attack-leaves-20000-berliners-without-electricity/)
6. [Freedom News: Berlin Blackout -- Anarchists Claim Attack](https://freedomnews.org.uk/2025/09/10/berlin-blackout-anarchists-claim-attack-on-industrial-park/)
7. Berlin police and fire department reports
8. Media coverage (Tagesspiegel, RBB)

## Related Research Files

- [docs/fact-check-report.md](../../fact-check-report.md) -- Item 10 (arson count correction: x2 not x3)
- [2026 Berlin Teltow Canal Arson](../2026-berlin-teltow-canal-arson/research.md) -- second attack in the series
