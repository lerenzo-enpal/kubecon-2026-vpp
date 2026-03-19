# Adelaide Residential Coordinates

## Summary

Queried OpenStreetMap Overpass API for residential building coordinates across metropolitan Adelaide, South Australia. Sampled 10,000 points from 156,823 unique results for use in a deck.gl ScatterplotLayer visualization.

**Output file:** `presentation/src/data/adelaide-homes.json`
**Format:** JSON array of `{lat, lng}` objects
**File size:** ~350 KB
**Date queried:** 2026-03-19

## Bounding Box

Adelaide metro area:
- Latitude: -35.15 to -34.65
- Longitude: 138.44 to 138.78

## Overpass API Queries

Endpoint: `https://overpass-api.de/api/interpreter`

### Query 1: `building=residential` (ways/relations)

```
[out:json][timeout:120][bbox:-35.15,138.44,-34.65,138.78];
(way["building"="residential"]; relation["building"="residential"];);
out center;
```

**Result:** 553 elements

### Query 2: `building=house` (ways/relations)

```
[out:json][timeout:120][bbox:-35.15,138.44,-34.65,138.78];
(way["building"="house"]; relation["building"="house"];);
out center;
```

**Result:** 156,267 elements

### Query 3: `building=residential` (nodes)

```
[out:json][timeout:120][bbox:-35.15,138.44,-34.65,138.78];
node["building"="residential"];
out;
```

**Result:** 3 elements

### Totals

| Source | Count |
|---|---|
| building=residential (ways) | 553 |
| building=house (ways) | 156,267 |
| building=residential (nodes) | 3 |
| **Total raw** | **156,823** |
| **Unique (deduplicated)** | **156,823** |
| **Final (sampled)** | **10,000** |

## Sampling Method

Random sampling with `random.seed(42)` using Python's `random.sample()` to select 10,000 points from the 156,823 unique coordinates. This preserves the natural geographic distribution of homes across the metro area since each point has equal probability of selection.

## Coordinate Stats (final 10K)

- Lat range: -35.1501 to -34.6617
- Lng range: 138.4677 to 138.7574

## Adelaide Housing Statistics (ABS 2021 Census)

### Greater Adelaide (Metropolitan Area)

| Metric | Value |
|---|---|
| Total private dwellings | 593,881 |
| Occupied private dwellings | 536,048 (90.3%) |
| Population | 1,387,290 |

Source: [ABS 2021 Census -- Greater Adelaide](https://www.abs.gov.au/census/find-census-data/quickstats/2021/4GADE)

### South Australia (State)

| Metric | Value |
|---|---|
| Total private dwellings | 806,982 |
| Occupied private dwellings | 691,313 (89.2%) |

Source: [ABS 2021 Census -- South Australia](https://www.abs.gov.au/census/find-census-data/quickstats/2021/4)

### Northern Suburbs (SA VPP Program Heartland)

| Council Area | Total Dwellings | Occupied | Population |
|---|---|---|---|
| City of Salisbury | 57,079 | 54,223 (95.1%) | 145,806 |
| City of Playford (incl. Elizabeth) | 39,490 | 35,285 (93.6%) | 99,190 |
| **Combined** | **96,569** | **89,508** | **244,996** |

These two councils represent ~18% of Greater Adelaide's dwellings and are the primary target area for the SA VPP program (50,000 home target, 250 MW / 650 MWh).

Note: City of Elizabeth was amalgamated into City of Playford in 1997.

Sources:
- [ABS 2021 -- City of Playford](https://abs.gov.au/census/find-census-data/quickstats/2021/LGA45680)
- [ABS 2021 -- City of Salisbury](https://abs.gov.au/census/find-census-data/quickstats/2021/LGA47140)

### Representation

Our 10,000 OSM sample represents ~1.7% of actual Adelaide homes. The SA VPP program's 50,000-home target is ~8.4% of the metro area.

## Notes

- The vast majority of results (99.6%) came from `building=house` tagged ways in OSM. Adelaide has excellent building-level OSM coverage.
- Way center points were extracted using Overpass `out center` which returns the centroid of each building polygon.
- No fallback queries (addr:housenumber, building=yes) were needed since the first two queries returned ample data.
