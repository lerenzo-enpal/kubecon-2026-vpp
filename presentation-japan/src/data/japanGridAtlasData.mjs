export const ATLAS_LAYER_IDS = ['mix', 'plants', 'areas', 'transmission', 'demand', 'jepx'];

export const ATLAS_SOURCES = [
  { id: 'regions', url: 'https://github.com/FraserTooth/japan-electrical-region-maps', licence: 'CC BY 4.0 MapSVG-derived reference; attribution required', retrievedAt: '2026-07-24', scope: 'Utility-region names and boundary deviations; the bundled polygons are schematic, not legal boundaries.' },
  { id: 'grid', url: 'https://www.cigre.org/userfiles/files/Community/National%20Power%20System/Pr%C3%A9sentation%20PowerPoint%20-%202020_National_power_system_Japan_r4.pdf', licence: 'Research reference', retrievedAt: '2026-07-24', scope: 'Frequency split and interconnection context.' },
  { id: 'mix', url: 'https://www.enecho.meti.go.jp/en/category/electricity_and_gas/electric/summary/', licence: 'Public government statistics', retrievedAt: '2026-07-24', scope: 'FY2023 national generation mix; rounded display values.' },
  { id: 'plants', url: 'https://world-nuclear.org/information-library/country-profiles/countries-g-n/japan-nuclear-power', licence: 'Research reference', retrievedAt: '2026-07-24', scope: 'Representative nuclear-station locations and rounded installed capacity.' },
];

const region = (id, name, frequency, polygon, position) => ({ id, name, frequency, polygon, position });

export const ATLAS_FEATURES = {
  mix: [
    { label: 'FY2023 generation mix', position: [146.5, 31.4], values: 'Coal 31% · LNG 33% · Renewables 23% · Nuclear 9% · Oil 4%' },
  ],
  plants: [
    { name: 'Kashiwazaki-Kariwa', fuel: 'Nuclear', capacity: '8.2 GW', position: [138.6, 37.4] },
    { name: 'Ohi', fuel: 'Nuclear', capacity: '4.7 GW', position: [135.6, 35.5] },
    { name: 'Takahama', fuel: 'Nuclear', capacity: '3.4 GW', position: [135.5, 35.5] },
    { name: 'Genkai', fuel: 'Nuclear', capacity: '2.4 GW', position: [129.8, 33.5] },
    { name: 'Sendai', fuel: 'Nuclear', capacity: '1.8 GW', position: [130.2, 31.8] },
  ],
  areas: [
    region('hokkaido', 'Hokkaido', '50 Hz', [[139, 41.4], [146, 41.4], [146, 45.7], [139, 45.7]], [142.4, 43.2]),
    region('tohoku', 'Tohoku', '50 Hz', [[139, 37.0], [142.5, 37.0], [142.5, 41.5], [139, 41.5]], [140.9, 39.3]),
    region('tokyo', 'Tokyo / TEPCO', '50 Hz', [[138.2, 34.5], [141.4, 34.5], [141.4, 37.4], [138.2, 37.4]], [139.7, 35.8]),
    region('chubu', 'Chubu', '60 Hz', [[136, 34.5], [139, 34.5], [139, 37.5], [136, 37.5]], [137, 35.6]),
    region('hokuriku', 'Hokuriku', '60 Hz', [[135.4, 36.0], [137.3, 36.0], [137.3, 37.8], [135.4, 37.8]], [136.2, 36.8]),
    region('kansai', 'Kansai', '60 Hz', [[134.3, 33.6], [136.5, 33.6], [136.5, 35.7], [134.3, 35.7]], [135.5, 34.8]),
    region('chugoku', 'Chugoku', '60 Hz', [[130.5, 33.5], [134.5, 33.5], [134.5, 35.4], [130.5, 35.4]], [132.4, 34.5]),
    region('shikoku', 'Shikoku', '60 Hz', [[132, 32.6], [134.6, 32.6], [134.6, 34.5], [132, 34.5]], [133.6, 33.8]),
    region('kyushu', 'Kyushu', '60 Hz', [[128.4, 30.3], [132, 30.3], [132, 34.3], [128.4, 34.3]], [130.5, 33.2]),
    region('okinawa', 'Okinawa', '60 Hz', [[126.4, 25.7], [128.8, 25.7], [128.8, 27.3], [126.4, 27.3]], [127.8, 26.4]),
  ],
  transmission: [
    { path: [[140.9, 38.3], [139.7, 35.7]], label: '50 Hz' },
    { path: [[139.7, 35.7], [136.9, 35.2]], label: '50 ⇄ 60 Hz · 1.2 GW' },
    { path: [[136.9, 35.2], [135.5, 34.7], [132.5, 34.4], [130.4, 33.6]], label: '60 Hz' },
    { path: [[137, 37.2], [137.3, 36.5], [137.6, 36], [137.8, 35.5], [138, 35.2]], label: 'Frequency seam' },
  ],
};
