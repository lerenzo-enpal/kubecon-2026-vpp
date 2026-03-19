# Berlin Residential Coordinates

## Summary

Queried OpenStreetMap Overpass API for residential building coordinates across Berlin, Germany. Focused on suburban/detached housing types most likely to have rooftop solar installations. All 134,040 unique coordinates were retained (no sampling).

**Output file:** `presentation/public/data/berlin-homes.json`
**Format:** JSON array of `[lng, lat]` arrays (GeoJSON coordinate order)
**File size:** 2.78 MB (2,918,908 bytes)
**Date queried:** 2026-03-19

## Bounding Box

Berlin city area:
- Latitude: 52.33 to 52.68
- Longitude: 13.08 to 13.76

## Overpass API Queries

Endpoint: `https://overpass-api.de/api/interpreter`

### Query 1: `building=house` (suburban houses)

```
[out:json][timeout:120][bbox:52.33,13.08,52.68,13.76];
(way["building"="house"];);
out center;
```

**Result:** 63,747 elements

### Query 2: `building=detached` (detached houses)

```
[out:json][timeout:120][bbox:52.33,13.08,52.68,13.76];
(way["building"="detached"];);
out center;
```

**Result:** 52,969 elements

### Query 3: `building=semidetached_house` (semi-detached houses)

```
[out:json][timeout:120][bbox:52.33,13.08,52.68,13.76];
(way["building"="semidetached_house"];);
out center;
```

**Result:** 17,324 elements

### Totals

| Source | Count |
|---|---|
| building=house (ways) | 63,747 |
| building=detached (ways) | 52,969 |
| building=semidetached_house (ways) | 17,324 |
| **Total raw** | **134,040** |
| **Unique (5dp dedup)** | **134,040** |
| **Final (no sampling)** | **134,040** |

## Methodology

- Queried three OSM building tags that represent suburban/residential houses most likely to have rooftop solar: `house`, `detached`, and `semidetached_house`.
- Deliberately excluded `building=apartments`, `building=residential` (generic), and `building=yes` since Berlin is predominantly an apartment city and we want to show individual homes suitable for rooftop solar (Enpal's target market).
- Way center points were extracted using Overpass `out center` which returns the centroid of each building polygon.
- Coordinates were deduplicated by rounding to 5 decimal places (~1.1m precision at Berlin's latitude). No duplicates were found -- all 134,040 coordinates were unique.
- Output uses GeoJSON coordinate order: `[longitude, latitude]`.

## Coordinate Stats

- Latitude range: 52.32995 to 52.68005
- Longitude range: 13.07992 to 13.76013
- Lat center (mean): 52.48640
- Lng center (mean): 13.42218

## Berlin Housing Context

### Why These Tags

Berlin is dominated by large multi-family apartment buildings (Mietshaeuser), particularly in the inner city districts (Mitte, Kreuzberg, Friedrichshain, Neukoelln, etc.). However, the outer districts contain substantial numbers of single-family and semi-detached houses:

- **Western suburbs:** Zehlendorf, Steglitz, Spandau, Reinickendorf
- **Eastern suburbs:** Marzahn-Hellersdorf (Siedlungen), Treptow-Koepenick, Pankow outskirts
- **Southern fringe:** Rudow, Buckow, Lichtenrade, Marienfelde

These are the homes where Enpal installs rooftop solar + battery systems.

### Berlin Housing Statistics (Statistisches Bundesamt / Amt fuer Statistik Berlin-Brandenburg)

| Metric | Value |
|---|---|
| Population (2023) | ~3.85 million |
| Total dwellings | ~2.07 million |
| One/two-family houses | ~131,000 buildings |
| Share of apartments in multi-family buildings | ~85% |
| Average household size | 1.8 persons |

Berlin has one of the lowest homeownership rates in Germany (~17% vs ~50% national average), but the outer districts with detached housing have significantly higher ownership rates. The German government's solar subsidy programs (EEG feed-in tariffs, KfW loans) have driven adoption in these suburban areas.

### Representation

Our 134,040 OSM building coordinates align reasonably well with the ~131,000 one/two-family house buildings reported in official statistics, suggesting near-complete OSM coverage of Berlin's suburban housing stock.

## Notes

- The `building=house` tag is the most common (47.6% of results), followed by `building=detached` (39.5%) and `building=semidetached_house` (12.9%).
- The bounding box extends slightly beyond Berlin's administrative boundary, so a small number of coordinates may be in Brandenburg. This is intentional for visualization purposes.
- Berlin has excellent OSM building coverage due to Germany's active OSM community and government data imports.
- No elements were missing center coordinates (all 134,040 had valid centers).
