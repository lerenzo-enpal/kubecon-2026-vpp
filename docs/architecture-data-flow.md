# VPP Architecture — Data Flow Channels

> Source-of-truth for the "Inside the Architecture" slide.
> IoT HEMS = IoT Hub + Home Energy Management System (merged, same device: Enpal.One)

## Components

### Home System

| Component | Role |
|-----------|------|
| **IoT HEMS** | Merged IoT Hub + Local HEMS (Enpal.One). Edge gateway and on-premise energy management. |
| **Inverter** | DC↔AC conversion, manages PV and battery |
| **PV** | Solar panels (DC input to inverter) |
| **Battery** | Home storage (DC, managed by inverter) |
| **Wallbox** | EV charger, controlled by IoT HEMS |
| **Heat Pump** | Heating/cooling, controlled by IoT HEMS |
| **Steuerbox** | Certified §14a control box in meter cabinet. DSO → Smart Meter Gateway → Steuerbox → IoT HEMS. Allows grid operator to throttle loads. |
| **Meter** | Bidirectional smart meter (Zweirichtungszähler) in Zählerschrank |
| **Grid** | Public low-voltage grid via Hausanschluss |

#### Home connections
- IoT HEMS manages: Inverter, Steuerbox, Heat Pump, Wallbox
- Inverter manages: PV, Battery
- Power chain: Inverter → Meter → Grid (bidirectional)

### Cloud Platform

| Component | Role |
|-----------|------|
| **EMQX** | MQTT message broker — central routing hub |
| **Cloud HEMS** | Cloud-side orchestration layer |
| **Azure Event Hub** | Message bridge between Cloud HEMS and Flexa |

### Data Pipeline

| Component | Role |
|-----------|------|
| **Data Ingestion** | Receives telemetry (Protobuf, 20s intervals) |
| **Databricks** | Data lakehouse (Raw → Bronze → Silver → Gold) |
| **Spark Streaming** | Real-time aggregation, pattern detection |

### VPP Controller

| Component | Role |
|-----------|------|
| **Flexa** | VPP controller. Joint venture Enpal + Entrix. Runs on Kubernetes. (Previously mislabeled "Flexor".) |

---

## Data Flow Paths

### Path 1: Telemetry (Home → Data Pipeline)

```
[Home Devices] → IoT HEMS → EMQX → Data Ingestion → Databricks → Spark Streaming
```

- Measurements every **20 seconds**
- MQTT: IoT HEMS → EMQX
- Protobuf serialization for ingestion
- Databricks layers: Raw → Bronze → Silver → Gold
- Spark produces real-time streaming aggregates

### Path 2: Processed Data to Flexa (Spark → Flexa)

```
Spark Streaming → Azure Event Hub → Flexa
```

- Spark sends aggregated data to Azure Event Hub
- Flexa consumes from Event Hub
- **Spark does NOT connect to EMQX directly**

### Path 3: Dispatch / Control (Flexa → Home)

```
Flexa → Azure Event Hub → Cloud HEMS → EMQX → IoT HEMS → [Home Devices]
```

- **Flexa does NOT talk directly to IoT HEMS**
- Commands flow back through the **same Event Hub**
- Cloud HEMS routes dispatch through EMQX/MQTT
- IoT HEMS distributes commands to individual devices

### §14a Grid Regulation (separate channel)

```
Grid Operator (DSO) → Smart Meter Gateway → Steuerbox → IoT HEMS
```

- Steuerbox is BSI-certified hardware in the Zählerschrank
- Can throttle loads but never below 4.2 kW minimum
- Uses CLS interface + EEBUS LPC protocol

---

## Key Points

- **IoT HEMS** = IoT Hub + Local HEMS (same physical device)
- **EMQX** is the central MQTT routing hub
- **Azure Event Hub** bridges the EMQX/Cloud HEMS world and Flexa
- **Cloud HEMS** sits between EMQX and Event Hub in both directions
- **Flexa = VPP Controller** (not "Flexor")
- All Flexa ↔ device communication goes through: **Event Hub ↔ Cloud HEMS ↔ EMQX ↔ IoT HEMS**
- **Spark does NOT connect to EMQX** — only to Event Hub

---

## Visual Summary

```
  PV ──┐
       ├── Inverter ── Meter ── Grid
  Bat ──┘      │
               │
  Steuerbox ── IoT HEMS ── EMQX ── Ingestion ── Databricks ── Spark
               │                                                 │
  HP ──────────┤         Cloud HEMS ──── Event Hub ──────────────┘
               │                              │
  Wallbox ─────┘                            Flexa
```

- Solid = telemetry (left → right)
- Dashed = dispatch (Flexa → Event Hub → Cloud HEMS → EMQX → IoT HEMS)
