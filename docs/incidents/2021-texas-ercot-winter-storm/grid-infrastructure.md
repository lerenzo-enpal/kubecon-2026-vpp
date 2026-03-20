# ERCOT Texas Grid Research — Cascading Failure Visualization

> Compiled March 2026 from web research. For building a geographically accurate cascading failure animation of the February 2021 Winter Storm Uri event.

---

## 1. ERCOT Load Zones (Settlement Zones)

ERCOT divides Texas into **4 competitive load zones** plus smaller non-opt-in entity zones:

| Load Zone | Approximate Geography | Major Cities |
|-----------|----------------------|--------------|
| **North** | North-central Texas, DFW metroplex and surroundings | Dallas, Fort Worth, Denton, Waco |
| **Houston** | Greater Houston metro and Gulf Coast | Houston, Galveston, Beaumont |
| **South** | South Texas, Rio Grande Valley, San Antonio area | San Antonio, Corpus Christi, Laredo, McAllen |
| **West** | West Texas, Permian Basin, Panhandle | Midland, Odessa, El Paso, Lubbock, Amarillo |

**Non-Opt-In Entity (NOIE) zones**: CPS Energy (San Antonio), LCRA (Lower Colorado River Authority), Austin Energy, RAYBN (Rayburn Electric Co-op).

**Note**: ERCOT also uses **8 Weather Zones** for forecasting: Coast, East, Far West, North, North Central, South, South Central, West.

---

## 2. Major Texas Cities — Approximate Positions (for map plotting)

| City | Latitude | Longitude | Region/Zone |
|------|----------|-----------|-------------|
| Houston | 29.76 | -95.37 | Houston zone |
| Dallas | 32.78 | -96.80 | North zone |
| Fort Worth | 32.75 | -97.33 | North zone |
| San Antonio | 29.42 | -98.49 | South zone (CPS NOIE) |
| Austin | 30.27 | -97.74 | South zone (Austin Energy NOIE) |
| El Paso | 31.76 | -106.44 | NOT in ERCOT (served by El Paso Electric, part of Western Interconnection) |
| Lubbock | 33.58 | -101.85 | West zone |
| Midland | 31.99 | -102.08 | West zone (Permian Basin) |
| Odessa | 31.85 | -102.35 | West zone (Permian Basin) |
| Corpus Christi | 27.80 | -97.40 | South zone (Coast weather zone) |
| Amarillo | 35.22 | -101.83 | West zone (Panhandle) |
| Abilene | 32.45 | -99.73 | West zone |
| Waco | 31.55 | -97.15 | North zone |
| Beaumont | 30.08 | -94.10 | Houston zone |
| Brownsville | 25.93 | -97.48 | South zone |

**Important**: El Paso is NOT part of the ERCOT grid. It is in the Western Interconnection. The ERCOT boundary roughly follows the western edge of the Panhandle and then cuts south, excluding El Paso County.

---

## 3. Major Power Generation Facilities

### Nuclear Plants (Both stayed critical during Feb 2021)

| Plant | Location | Capacity | Owner | Feb 2021 Status |
|-------|----------|----------|-------|-----------------|
| **Comanche Peak** (Units 1 & 2) | Glen Rose, Somervell County (~45 mi SW of Fort Worth) | 2,300-2,400 MW | Vistra/Luminant | **Both units ran at 100% throughout the storm** |
| **South Texas Project** (Units 1 & 2) | Matagorda County (Bay City area, ~90 mi SW of Houston) | ~2,700 MW (combined) | NRG/CPS/Austin Energy | **Unit 1 tripped at 05:37 Feb 15** due to frozen feedwater pressure sensing line (false signal). Unit 2 ran at 100%. Unit 1 back to full power Feb 18. |

### Major Coal/Lignite Plants

| Plant | Location (City/County) | Capacity (MW) | Owner | Notes |
|-------|----------------------|---------------|-------|-------|
| **W.A. Parish** | Thompsons, Fort Bend County (SW of Houston) | 3,653 (gas + coal) | NRG Energy | 2nd largest conventional plant in US. Coal portion ~2,697 MW. |
| **Martin Lake** | Tatum, Rusk County (East Texas) | 2,250 | Vistra/Luminant | Lignite-fired. One of the largest coal plants in Texas. |
| **Limestone** | Jewett, Limestone County (central-east TX) | 1,850 | NRG Energy | Lignite-fired. |
| **Oak Grove** | Franklin, Robertson County (central TX) | 1,796 | Vistra/Luminant | Lignite-fired. Opened 2010. |
| **Coleto Creek** | Goliad County (south TX, near Victoria) | 632 | Vistra | Coal-fired. |
| **San Miguel** | Christine, Atascosa County (south of San Antonio) | 410 | San Miguel Electric Co-op | Lignite-fired. |

**Retired before 2021**: Big Brown (1,150 MW, Fairfield) and Sandow (1,137 MW, Rockdale) — both closed in 2018.

### Major Natural Gas Plants (Many failed in Feb 2021)

| Plant | Location | Capacity (MW) | Owner | Notes |
|-------|----------|---------------|-------|-------|
| **Deer Park Energy Center** | Deer Park (Houston area) | ~1,000+ | Calpine | Houston Ship Channel area |
| **Cedar Bayou** | Baytown (Houston area) | 1,495 | Calpine | |
| **Forney Energy Center** | Forney (east of Dallas) | 1,912 | Kelson Energy | One of the largest gas plants in TX |
| **Midlothian Power Plant** | Midlothian (south of DFW) | 1,596 | Vistra | Ran at only ~30% during storm due to gas supply cuts |
| **Graham** | Graham (NW of Fort Worth) | 630 | Vistra | |
| **Stryker Creek** | Rusk County (East TX) | 685 | Vistra | |
| **Morgan Creek** | Colorado City (West TX) | 390 | Vistra | |
| **Odessa-Ector** | Odessa (Permian Basin) | 1,054 | Vistra | |
| **Trinidad** | Trinidad (NE of Waco) | 244 | Vistra | |
| **Lamar** | Paris (NE Texas) | ~1,000 | Vistra | |
| **Hays Energy** | San Marcos area | ~1,000 | Vistra | |
| **Lake Hubbard** | Dallas area | ~900 | Vistra | |
| **Decordova** | Granbury (near Comanche Peak) | ~800 | Vistra | |
| **Wolf Hollow** | Granbury | ~720 | |  |
| **Brazos Valley** | near College Station | ~600 | |  |
| **Colorado Bend** | Wharton County | ~600 | |  |

### Major Wind Farms (West TX / Panhandle)

| Farm | Location | Capacity (MW) | Notes |
|------|----------|---------------|-------|
| **Roscoe Wind Farm** | Roscoe, Nolan County (West TX) | 781 | One of world's largest at time of construction |
| **Horse Hollow** | Taylor/Nolan Counties | 736 | |
| **Capricorn Ridge** | Sterling/Coke Counties | 662 | |
| **Sweetwater Wind** | Nolan County | 585 | |
| **Gulf Wind** | Kenedy County (South TX coast) | 283 | Coastal wind farm |
| **Panhandle Wind Farms** | Carson, Gray, Wheeler Counties (Panhandle) | Multiple GW total | Multiple farms in the region |

**During Feb 2021**: ~16 GW of wind was offline (mostly in the Panhandle and West TX due to icing), while another ~15 GW continued generating. Wind losses were significant but accounted for only ~13% of total outages.

---

## 4. ERCOT Transmission Grid Topology

### Grid Basics
- **46,500 miles** of transmission lines
- **550+ generation units**
- Highest existing voltage: **345 kV** (a new 765 kV backbone is under construction as of 2025-2026)
- ERCOT is its own interconnection — **isolated from the rest of the US** except for limited DC ties

### DC Ties to Other Grids (Limited)
| Tie | Capacity | Connects To |
|-----|----------|-------------|
| Oklaunion (near Vernon, N TX) | 220 MW | Eastern Interconnection (SPP) |
| Monticello (NE Texas) | 600 MW | Eastern Interconnection (SPP) |
| Railroad (Eagle Pass area) | 36 MW | CFE Mexico |
| Laredo VFT | 100 MW | CFE Mexico |
| Sharyland/McAllen | 300 MW | CFE Mexico |

**Total DC tie capacity: ~1,256 MW** — far too little to help during a 30+ GW shortfall.

### Major 345 kV Transmission Corridors

1. **CREZ (Competitive Renewable Energy Zone) Lines** — The most important transmission build in ERCOT history:
   - $6.8 billion, 2,500+ miles of 345 kV lines
   - Purpose: Move wind power from West TX / Panhandle to DFW, Austin, San Antonio load centers
   - Runs roughly along a **north-south backbone west of I-35**
   - Key substations: Ogallala, Windmill, AJ Swope, Alibates (Panhandle); connects south through Abilene area toward Temple/Killeen and San Antonio

2. **West-to-DFW Corridor**: Panhandle / Lubbock area -> Abilene -> DFW (carries wind generation east)

3. **West-to-San Antonio Corridor**: Permian Basin -> Junction area -> San Antonio

4. **Houston Radial Network**: Multiple 345 kV lines radiate from Houston metro to generation sources (Parish to the SW, Cedar Bayou/Deer Park to the E, transmission from South TX Project to the S)

5. **North-South Backbone** (along I-35 corridor): DFW -> Waco/Temple -> Austin -> San Antonio

6. **East Texas Corridor**: DFW -> Tyler/Longview area (serving Martin Lake, lignite plants)

### New 765 kV Strategic Transmission Expansion Plan (2025-2026)
- **Eastern Backbone**: Substations in Bexar (San Antonio), Dallas, Bell (Temple), Kleberg (Kingsville), Rusk (East TX), Wharton counties
- **Permian Basin Import Path**: ~300 miles from Fort Stockton area to San Antonio (AEP Texas)
- Total plan: ~$9 billion

---

## 5. February 2021 Cascade Sequence — Timeline

### Pre-Storm (Feb 10-13)
- ERCOT aware by Feb 13 that blackouts were likely
- Arctic air mass pushing south into Texas, temperatures dropping well below freezing statewide
- Some generators already beginning to have issues

### Phase 1: Wind Generation Loss (Feb 14, morning-afternoon)
- Wind generation in the Panhandle and West Texas begins dropping as turbines ice up
- ~16 GW of wind eventually offline (of ~31 GW installed)
- **Geographic focus**: Panhandle (Amarillo, Lubbock), West TX (Abilene, Sweetwater)

### Phase 2: Gas Supply Crisis Begins (Feb 14, evening)
- **Permian Basin** gas wells and gathering lines begin freezing
- Pumps lifting gas from wells lose electricity
- Gas field production cut roughly in half
- **Geographic focus**: Midland/Odessa, Permian Basin (West zone)

### Phase 3: Thermal Generator Trips Accelerate (Feb 14 night - Feb 15 early morning)
- Natural gas plants across the state cannot get fuel or have frozen equipment
- Coal plants experiencing frozen coal piles, conveyor issues, instrumentation failures
- **South Texas Project Unit 1 trips at 05:37 Feb 15** (feedwater sensing line frozen)
- **Comanche Peak stays at 100%** through the entire event
- Gas plants affected statewide: Midlothian (DFW area) running at only 30% capacity due to gas shortage

### Phase 4: Emergency and Load Shedding (Feb 15, 01:25 AM)
- ERCOT initiates **rotating outages at 1:25 AM on Feb 15**
- Demand: 69,692 MW on Feb 14 (record); peaked at 76,819 MW on Feb 16
- Available supply plummeted: **52,277 MW of generation capacity unavailable** at peak (48.6% of total)
- The grid was **4 minutes and 37 seconds from total collapse**
- Load shedding was NOT rotating as intended — many areas lost power continuously

### Phase 5: Sustained Crisis (Feb 15-18)
- Vicious cycle: power cuts disable gas compressors -> less gas -> more plant trips -> more power cuts
- Over 4.5 million homes without power
- Load shedding lasted **over 70 hours** before full restoration
- Geographic spread: **statewide** — North, South, Houston, and West zones all affected
- Worst-hit areas included Dallas-Fort Worth suburbs, Houston suburbs, Austin, San Antonio

### Phase 6: Recovery (Feb 18-19)
- Temperatures slowly rising
- Gas supply recovering
- STP Unit 1 returns to full power Feb 18
- ERCOT ends emergency conditions **Feb 19**

### Generation Loss Breakdown by Fuel Type
| Fuel Type | % of Unplanned Outages | Approximate MW Lost |
|-----------|----------------------|---------------------|
| Natural Gas | 58% | ~30,000+ MW |
| Wind | 27% | ~16,000 MW |
| Coal | 6% | ~3,000+ MW |
| Solar | 2% | ~1,000 MW |
| Nuclear | <1% | ~1,350 MW (STP Unit 1 only) |
| Other | 7% | ~3,000+ MW |

### Root Causes of Generator Failures
| Cause | % of Failures |
|-------|--------------|
| Freezing issues (equipment, instruments, pipes) | 44.2% |
| Fuel supply issues (gas curtailments) | 31.4% |
| Frequency/voltage issues (grid instability) | ~1,800 MW worth |
| Other mechanical/electrical | Remainder |

---

## 6. Visualization Cascade Sequence (Recommended Animation Order)

For a geographically accurate cascading failure animation:

### Frame 1: Normal Operations (Feb 13)
- All zones green
- ~80 GW total capacity available
- Wind spinning in Panhandle/West

### Frame 2: Wind Drops (Feb 14 morning)
- Panhandle and West TX wind icons go amber/red
- CREZ transmission lines from west show reduced flow
- -16 GW wind capacity

### Frame 3: Gas Supply Collapse (Feb 14 evening)
- Permian Basin (Midland/Odessa) gas wells go dark
- Gas pipeline icons from West TX start failing
- Gas plants across the state begin flickering

### Frame 4: Thermal Cascade (Feb 14 night - Feb 15 dawn)
- Gas plants across North zone (DFW area) go offline — Midlothian, Forney, Graham
- East TX plants struggling — Stryker Creek, Martin Lake
- Coal plants going offline — Limestone, Oak Grove
- South TX Project Unit 1 trips (red flash near Bay City)
- Comanche Peak stays bright green (highlight this)
- Houston zone gas plants failing — Cedar Bayou, Deer Park

### Frame 5: Grid Emergency (Feb 15 01:25 AM)
- ERCOT emergency signal
- "4 minutes 37 seconds from total collapse" callout
- Load shedding begins — residential areas across ALL zones go dark
- 52,277 MW unavailable — show capacity bar draining

### Frame 6: Sustained Blackout (Feb 15-18)
- Feedback loop animation: power cuts -> gas compressor failures -> more plant trips
- 4.5 million homes dark
- Show pulsing darkness spreading across all zones
- Only Comanche Peak and STP Unit 2 remain as bright spots

### Frame 7: Recovery (Feb 18-19)
- Gradual re-illumination starting from plants with local fuel (nuclear, some coal)
- Gas supply slowly recovering
- 70+ hours of load shedding total

---

## 7. Key Facts for Visualization Callouts

- **ERCOT is an island**: Only ~1,256 MW of DC ties to outside grids. When internal generation fails, there is almost no help available.
- **4 minutes 37 seconds**: How close the entire Texas grid came to total collapse (a cold restart would have taken weeks/months).
- **52,277 MW lost**: Nearly half of all generation capacity.
- **4.5 million homes**: Lost power, many for days.
- **246 deaths**: Attributed to the storm (hypothermia, CO poisoning, etc.).
- **Vicious cycle**: The gas-electricity interdependency — gas plants need electricity to compress gas, but electricity needs gas to run plants.
- **Comanche Peak was the hero**: Both nuclear units ran at 100% throughout — reliable baseload that doesn't depend on fuel delivery during a crisis.

---

## 8. ERCOT Grid Approximate Topology for Visualization

```
                    AMARILLO (Panhandle)
                         |
                    [CREZ 345kV]
                         |
                      LUBBOCK
                         |
                    [CREZ 345kV]
                         |
    MIDLAND/ODESSA --- ABILENE --------- DALLAS/FT WORTH
    (Permian Basin)      |              /    |
         |          [CREZ 345kV]   [345kV]   |
         |               |       /           |
         |           WACO/TEMPLE         TYLER/E.TX
         |               |              (Martin Lake)
         |              AUSTIN
         |               |
    [345kV West]    [I-35 345kV]
         |               |
         +------  SAN ANTONIO  -------- HOUSTON
                         |              /  |  \
                    [345kV South]  Parish Cedar Bayou
                         |              Deer Park
                   CORPUS CHRISTI
                         |
                    [345kV Coast]
                         |
                  STP Nuclear (Bay City)
                         |
                    BROWNSVILLE/RGV
```

### Key Generation Clusters
- **Permian Basin cluster**: Gas plants (Odessa-Ector, Morgan Creek), wind farms
- **DFW cluster**: Midlothian, Forney, Lake Hubbard, Graham, Comanche Peak nuclear
- **East TX cluster**: Martin Lake, Stryker Creek, Trinidad, Monticello DC tie
- **Houston cluster**: W.A. Parish, Cedar Bayou, Deer Park
- **Central TX cluster**: Limestone, Oak Grove (lignite belt along Brazos River)
- **South TX cluster**: STP Nuclear, Coleto Creek, San Miguel
- **Panhandle/West TX**: Wind farms (Roscoe, Horse Hollow, Sweetwater), CREZ corridors

---

## Sources

- [UT Austin Energy Institute — ERCOT Blackout 2021](https://energy.utexas.edu/research/ercot-blackout-2021)
- [UT Austin — Timeline and Events of February 2021 Texas Electric Grid Blackout (PDF)](https://energy.utexas.edu/sites/default/files/UTAustin%20(2021)%20EventsFebruary2021TexasBlackout%2020210714.pdf)
- [2021 Texas Power Crisis — Wikipedia](https://en.wikipedia.org/wiki/2021_Texas_power_crisis)
- [FERC Final Report on February 2021 Freeze](https://www.ferc.gov/news-events/news/final-report-february-2021-freeze-underscores-winterization-recommendations)
- [ERCOT Grid Information](https://www.ercot.com/gridinfo)
- [ERCOT Maps](https://www.ercot.com/news/mediakit/maps)
- [ERCOT Hubs and Load Zones — PCI Energy Solutions](https://www.pcienergysolutions.com/2024/05/22/ercot-hubs-and-load-zones-a-look-at-the-impact-of-texas-energy-market/)
- [Texas Interconnection — Wikipedia](https://en.wikipedia.org/wiki/Texas_Interconnection)
- [List of Power Stations in Texas — Wikipedia](https://en.wikipedia.org/wiki/List_of_power_stations_in_Texas)
- [Comanche Peak Nuclear Power Plant — Wikipedia](https://en.wikipedia.org/wiki/Comanche_Peak_Nuclear_Power_Plant)
- [South Texas Project Unit 1 Trip — Atomic Insights](https://atomicinsights.com/south-texas-project-unit-1-tripped-at-0537-on-feb-15-2021/)
- [WA Parish Generating Station — Wikipedia](https://en.wikipedia.org/wiki/WA_Parish_Generating_Station)
- [Martin Lake Steam Station — Global Energy Monitor](https://www.gem.wiki/Martin_Lake_Steam_Station)
- [Oak Grove Power Plant — Wikipedia](https://en.wikipedia.org/wiki/Oak_Grove_Power_Plant)
- [ERCOT Winter Storm Generator Outages Report (PDF)](https://www.ercot.com/files/docs/2021/04/28/ERCOT_Winter_Storm_Generator_Outages_By_Cause_Updated_Report_4.27.21.pdf)
- [Baker Institute — ERCOT Froze in February 2021 Working Paper (PDF)](https://www.bakerinstitute.org/sites/default/files/2022-02/import/ces-ercot-wp-020222_cnO6uiA.pdf)
- [Cascading Risks: Understanding the 2021 Winter Blackout in Texas — ScienceDirect](https://www.sciencedirect.com/science/article/pii/S2214629621001997)
- [Texas Tribune — Frozen Wind Turbines Not Main Culprit](https://www.texastribune.org/2021/02/16/texas-wind-turbines-frozen/)
- [ERCOT 765-kV Strategic Transmission Expansion Plan](https://www.ercot.com/files/docs/2025/01/27/2024-regional-transmission-plan-rtp-345-kv-plan-and-texas-765-kv-strategic-transmission-expans.pdf)
- [Lone Star Transmission — 345kV Lines](https://newsroom.nexteraenergy.com/Lone-Star-Transmission-energizes-330-miles-of-new-345-kilovolt-transmission-lines-in-Texas)
- [ANL Report — Feb 2021 Electricity Blackouts and Natural Gas Shortages in Texas (PDF)](https://publications.anl.gov/anlpubs/2021/07/169454.pdf)
- [Texas Comptroller — Winter Storm Uri 2021](https://comptroller.texas.gov/economy/fiscal-notes/archive/2021/oct/winter-storm-impact.php)
- [ERCOT February 2021 Extreme Weather Event](https://www.ercot.com/news/february2021)
