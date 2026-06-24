export const en = {
  // ── Shared ─────────────────────────────────────────────────────────────────
  'speaker.lerenzo': 'LERENZO',
  'speaker.priyanka': 'PRIYANKA',
  'label.act1': 'ACT I: THE GRID',
  'label.act2': 'ACT II: THE RENEWABLES PROBLEM',
  'label.act3': 'ACT III: THE VPP SOLUTION',

  // ── Keynote ────────────────────────────────────────────────────────────────
  'keynote.title': 'What is a Virtual Power Plant?',
  'keynote.subtitle': 'KubeCon + CloudNativeCon Japan 2026',
  'keynote.presenter': 'LeRenzo Malcolm',

  'keynote.hormuz.eyebrow': 'February – March 2026',
  'keynote.hormuz.stat': '+¥15,000',
  'keynote.hormuz.unit': 'per household / year',
  'keynote.hormuz.label': 'Strait of Hormuz closure',
  'keynote.hormuz.context': 'Japan imports 97% of its LNG. The Hormuz crisis doubled prices overnight. You felt it on your April electricity bill.',

  'keynote.fragility.title': "Japan's Energy Fragility",
  'keynote.fragility.selfsufficiency.stat': '15.3%',
  'keynote.fragility.selfsufficiency.label': 'Energy self-sufficiency — lowest in the G7',
  'keynote.fragility.fossil.stat': '70%',
  'keynote.fragility.fossil.label': 'Primary energy from fossil fuels',
  'keynote.fragility.grid.title': 'An Island Grid',
  'keynote.fragility.grid.body': 'Ten regional utilities. No HVDC neighbors. East and west run on different frequencies. When supply drops, there is nowhere to import from.',

  'keynote.jepx.title': 'January 2021',
  'keynote.jepx.subtitle': "Japan's Texas Moment — No Natural Disaster Required",
  'keynote.jepx.stat': '10 → 251 JPY/kWh',
  'keynote.jepx.duration': '40 days',
  'keynote.jepx.body': 'A cold snap. Low wind. LNG tanker delays. Spot prices rose 25× in 40 days with no earthquake, no storm — just structural fragility.',

  'keynote.warning2022.title': 'March 2022',
  'keynote.warning2022.stat': '2.5%',
  'keynote.warning2022.label': "TEPCO reserve margin — Japan's first-ever power supply emergency warning",

  'keynote.demand.title': 'The Demand Accelerant',
  'keynote.demand.stat': '19 → 57 TWh',
  'keynote.demand.label': 'Data center electricity demand by 2034',
  'keynote.demand.footnote': 'OCCTO forecasts 14× growth from combined data center + semiconductor fab demand',

  'keynote.pivot.title': 'The grid IS a distributed system.',
  'keynote.pivot.subtitle': 'We know how to build those.',

  'keynote.arch.title': 'A Cloud-Native VPP',
  'keynote.arch.subtitle': 'Dapr · Kafka · MQTT · ArgoCD · Spark · OpenTelemetry',

  'keynote.closing.stat': '100,000',
  'keynote.closing.label': 'homes coordinated by software',
  'keynote.closing.equals': '= one power plant',

  // ── Main Talk ──────────────────────────────────────────────────────────────
  'main.title': 'How the Grid Became a Distributed System',
  'main.subtitle': 'KubeCon + CloudNativeCon Japan 2026',
  'main.presenters': 'LeRenzo Malcolm · Priyanka',

  'main.grid.title': "Japan's Power Grid",
  'main.grid.subtitle': 'Ten utilities. Two frequencies. One island.',
  'main.grid.hz.title': 'East vs West: The 50/60 Hz Seam',
  'main.grid.hz.body': 'Eastern Japan (TEPCO, Tohoku) runs at 50 Hz. Western Japan (Kansai, Kyushu) runs at 60 Hz. Only 1.2 GW of frequency conversion capacity connects them. During a crisis, you cannot move power freely east to west.',
  'main.grid.hvdc.label': 'HVDC interconnection capacity',
  'main.grid.selfsufficiency.title': 'The Lowest in the G7',

  'main.jepx.title': "Japan's Texas Moment",
  'main.jepx.subtitle': 'January 2021 JEPX price spike',
  'main.jepx.framing': 'Same fragility, different cause.',

  'main.renewables.title': 'The Renewables Problem',
  'main.renewables.duck.title': 'The Duck Curve — Kyushu Edition',
  'main.renewables.duck.body': 'Kyushu now generates more solar at noon than it can consume. Curtailment is the only option — wasting clean energy to protect grid frequency.',
  'main.renewables.curtailment.title': 'Curtailment Spreading North',
  'main.renewables.curtailment.stat': '1.74 TWh',
  'main.renewables.curtailment.label': 'wasted in Kyushu — H1 2025',
  'main.renewables.curtailment.tokyo': 'Curtailment reached Tokyo in March 2026.',
  'main.renewables.shizen.title': 'VPP in Japan Today',
  'main.renewables.shizen.body': 'Shizen Connect is aggregating EV batteries across Kansai. HEMS programs are dispatching residential batteries in Kyushu. The technology works.',

  'main.vpp.erab.title': 'The ERAB Framework',
  'main.vpp.erab.subtitle': 'Energy Resource Aggregation Business — Japan\'s aggregator license',
  'main.vpp.erab.body': 'Since 2020, Japan\'s OCCTO requires VPP aggregators to register as ERABs. The regulatory layer exists. The market exists. The missing piece is software that can coordinate at scale.',
  'main.vpp.arch.title': 'The Cloud-Native VPP Stack',
  'main.vpp.closing.title': 'The Grid Is a Distributed System.',
  'main.vpp.closing.body': 'And we already know how to operate distributed systems at scale.',
};
