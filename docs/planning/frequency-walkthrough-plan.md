# Frequency Walkthrough — Technical Plan

Slide 9: "The Grid: A Balancing Act"

## Grid Setup

Three power plants (left) → Substation (center) → Six houses (right)

| Plant | Type | Role | Always Running? |
|-------|------|------|-----------------|
| **Gas CCGT** | Combined Cycle Gas Turbine | Spinning reserve — runs at partial load with headroom to ramp | Yes, at ~60% |
| **Gas Peaker** | Open Cycle Gas Turbine | Emergency backup — sits cold, fires on demand | No, completely OFF |
| **Coal Baseload** | Coal-fired with cooling tower | Baseload — steady output 24/7 | Yes, at ~85% |

## Step Sequence

### Step 0: 50.000 Hz — LOCKED
- **Display**: Big "50.000 Hz" with spy-tech scramble animation
- **Grid**: Not visible yet
- **Narrative**: "Supply and demand must balance every single second."

### Step 1: 49.800 Hz — NOMINAL (Normal Operating Band)
- **What's happening**: Small frequency deviation, within the ±0.2 Hz normal band. This happens constantly — the grid is never perfectly at 50.000 Hz.
- **CCGT**: 60% output, PARTIAL LOAD — running normally with 40% headroom. Smoke rising. Cyan glow.
- **Peaker**: IDLE — completely off, cold iron. No smoke, no flow, dark.
- **Coal**: 85% output, BASELOAD — steady. Smoke from stack and cooling tower.
- **Energy flow**: Coal → substation → houses (steady). CCGT → substation (steady at partial rate). No peaker flow.
- **Scenario text**: "Normal operating band. Spinning reserves on standby."
- **Key insight**: The CCGT headroom IS the spinning reserve. It's already burning fuel at 60% just to be ready.

### Step 2: 49.500 Hz — WARNING (Reserves Activate)
- **What's happening**: A generator has tripped or demand spiked beyond normal. Frequency dropping. FCR/aFRR activated.
- **CCGT**: Ramps 60% → 100%, MAX OUTPUT — this is the reserve response. Takes seconds since it's already spinning. Glows amber. Smoke increases.
- **Peaker**: Still IDLE — reserves are handling it. Still dark, no flow.
- **Coal**: 85% BASELOAD — unchanged, it can't ramp fast.
- **Energy flow**: CCGT flow speeds up (amber, faster dashes). Coal unchanged. No peaker.
- **Scenario text**: "Reserves activate. Gas CCGT ramps to max output."
- **Key insight**: The spinning reserve worked — but now there's zero headroom left.

### Step 3: 49.000 Hz — EMERGENCY (Load Shedding)
- **What's happening**: Reserves maxed out but frequency still dropping. UFLS Stage 1 triggers at 49.0 Hz.
- **CCGT**: Still at 100% MAX OUTPUT — nothing more to give.
- **Peaker**: NOW fires — RAMPING. Takes 10-30 min for cold start. Amber glow, smoke starts. Line draws, flow begins (slow, speeding up).
- **Coal**: 85% BASELOAD — unchanged.
- **Houses**: Bottom 2 go dark (X marks) — UFLS disconnects load to save the grid.
- **Energy flow**: All flowing but lines to shed houses go dark/red. Peaker flow starts slow.
- **Scenario text**: "Load shedding begins. Deliberate blackouts to save the grid."
- **Key insight**: Even with reserves maxed AND peaker firing, it's not enough — homes must be sacrificed.

### Step 4: 47.500 Hz — SYSTEM FAILURE (Total Collapse)
- **What's happening**: Protection relays at 47.5 Hz disconnect generators to prevent physical damage to turbines. Cascading collapse.
- **All plants**: OFFLINE — bars drop to 0. All dark.
- **All houses**: Dark.
- **All flow**: Stops.
- **Grid**: Entire SVG dims to 25% opacity.
- **Scenario text**: "Generators disconnect to self-protect. Total collapse."
- **Key insight**: Below 47.5 Hz, the mechanical stress would destroy turbine blades and shafts. Generators save themselves by disconnecting — which kills the grid.

### Step 5: Punchline — 2.5 Hz
- **Display**: "The difference between 'everything is fine' and 'total collapse' is **2.5 Hz** — less than you can hear."
- **Grid**: Fades to invisible.
- **HUD**: Exits left.

## Cost Context (for the following slide)

| Tool | What it costs | Why it's expensive |
|------|--------------|-------------------|
| Spinning reserves (CCGT at 60%) | Burns fuel 24/7 at partial load producing nothing useful with the headroom | ~15% of all generation capacity is "wasted" on standby |
| Peaker plants | EUR 6.5B/yr in EU capacity mechanisms | 261 GW of gas turbines idle 95% of the year |
| Load shedding | EUR 11B/yr in EU to prevent it | When it fails: Texas $195B, 246 deaths |
| Curtailment | EUR 3B/yr in Germany alone | 19 TWh of clean energy thrown away |

**Total**: The old playbook costs the EU ~EUR 20B/year in direct costs, plus incalculable damage when it fails.

## Technical Sources
- ENTSO-E SOGL: FCR dimensioned for 3,000 MW reference incident
- FCR full activation: 30 seconds
- aFRR full activation: 5 minutes
- UFLS Stage 1: 49.0 Hz (ENTSO-E NC RfG)
- Generator protection relay: 47.5 Hz
- Gas peaker cold start: 10-30 minutes (EIA)
- CCGT ramp rate from partial load: seconds (already synchronized)
