// Custom Protomaps flavor tuned to match the CARTO dark-matter aesthetic.
//
// CARTO dark-matter renders all parks, landuse, and landcover as near-black
// (#0e0e0e), giving the map a clean black canvas look. The default Protomaps
// "dark" flavor uses subtle greenish tints for parks which are distracting
// in a presentation context. This flavor removes all color from landmass
// features and matches the CARTO road/boundary/label palette as closely as
// possible using the Protomaps layer vocabulary.

export const cartoDarkFlavor = {
  // ── Background + earth ──────────────────────────────────────────────────────
  background:  '#0e0e0e',
  earth:       '#0e0e0e',

  // ── Landuse / landcover — all collapsed to near-black (CARTO style) ─────────
  park_a:      '#0e0e0e',
  park_b:      '#0e0e0e',
  hospital:    '#0e0e0e',
  industrial:  '#0e0e0e',
  school:      '#0e0e0e',
  wood_a:      '#0e0e0e',
  wood_b:      '#0e0e0e',
  pedestrian:  '#0e0e0e',
  scrub_a:     '#0e0e0e',
  scrub_b:     '#0e0e0e',
  glacier:     '#0e0e0e',
  sand:        '#0e0e0e',
  beach:       '#0e0e0e',
  aerodrome:   '#0e0e0e',
  runway:      '#111111',
  zoo:         '#0e0e0e',
  military:    '#0e0e0e',
  landcover:   '#0e0e0e',

  // ── Water ────────────────────────────────────────────────────────────────────
  water:       '#2C353C',

  // ── Buildings ────────────────────────────────────────────────────────────────
  buildings:   '#393939',

  // ── Boundaries ───────────────────────────────────────────────────────────────
  boundaries:  '#676372',

  // ── Tunnels ──────────────────────────────────────────────────────────────────
  tunnel_other_casing:    '#1a1a1a',
  tunnel_minor_casing:    '#1a1a1a',
  tunnel_link_casing:     '#1a1a1a',
  tunnel_major_casing:    '#232323',
  tunnel_highway_casing:  '#232323',
  tunnel_other:           '#161616',
  tunnel_minor:           '#161616',
  tunnel_link:            '#161616',
  tunnel_major:           '#414758',
  tunnel_highway:         '#414758',

  // ── Roads ────────────────────────────────────────────────────────────────────
  pier:                   '#0b0b0b',
  minor_service_casing:   '#1c1c1c',
  minor_casing:           '#414758',
  link_casing:            '#232323',
  major_casing_late:      '#232323',
  highway_casing_late:    '#232323',
  other:                  '#414758',
  minor_service:          '#1c1c1c',
  minor_a:                '#414758',
  minor_b:                '#414758',
  link:                   '#535666',
  major_casing_early:     '#232323',
  major:                  '#535666',
  highway_casing_early:   '#232323',
  highway:                '#494949',
  railway:                '#1a1a1a',

  // ── Bridges ──────────────────────────────────────────────────────────────────
  bridges_other_casing:   '#1c1c1c',
  bridges_minor_casing:   '#1c1c1c',
  bridges_link_casing:    '#232323',
  bridges_major_casing:   '#232323',
  bridges_highway_casing: '#232323',
  bridges_other:          '#414758',
  bridges_minor:          '#414758',
  bridges_link:           '#535666',
  bridges_major:          '#535666',
  bridges_highway:        '#414758',

  // ── Labels ───────────────────────────────────────────────────────────────────
  roads_label_minor:       '#b5b4b4',
  roads_label_minor_halo:  '#1f1f1f',
  roads_label_major:       '#bdbdbd',
  roads_label_major_halo:  '#1f1f1f',
  ocean_label:             '#717784',
  subplace_label:          '#525252',
  subplace_label_halo:     '#1f1f1f',
  city_label:              '#e9eff6',
  city_label_halo:         '#0e0e0e',
  state_label:             '#cbe6e6',
  state_label_halo:        '#0e0e0e',
  country_label:           '#788d93',
  address_label:           'transparent',
  address_label_halo:      'transparent',
  pois:                    '#515151',
};
