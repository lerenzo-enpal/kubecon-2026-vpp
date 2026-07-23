const assert = require('node:assert/strict');

(async () => {
  const { MAIN_TALK_EVIDENCE } = await import('../src/data/mainTalkEvidence.mjs');

  assert.equal(MAIN_TALK_EVIDENCE.japanEnergy.value, '15.3%');
  assert.equal(MAIN_TALK_EVIDENCE.jepx2021.value, '<10 → 251 JPY/kWh');
  assert.equal(MAIN_TALK_EVIDENCE.kyushuControl.value, '5.09 GW');
  assert.equal(MAIN_TALK_EVIDENCE.kyushuControl.sourceUrl, 'https://www.kyuden.co.jp/td_power_usages/out_ctrl_history.html');
  assert.equal(MAIN_TALK_EVIDENCE.shizenV2H.value, '186 household EVs via V2H');
  assert.match(MAIN_TALK_EVIDENCE.shizenV2H.notes, /company-reported 90% control accuracy/i);
  assert.equal(MAIN_TALK_EVIDENCE.kansaiHems.value, 'HEMS-controlled residential batteries');

  for (const [name, evidence] of Object.entries(MAIN_TALK_EVIDENCE)) {
    for (const field of ['value', 'label', 'sourceLabel', 'sourceUrl', 'sourceYear', 'reference', 'notes', 'researchAnchor']) {
      assert.ok(evidence[field], `${name} requires ${field}`);
    }
    assert.match(evidence.sourceUrl, /^https:\/\//, `${name} requires an HTTPS source URL`);
    assert.match(evidence.researchAnchor, /^#[-a-z0-9]+$/, `${name} requires a stable research anchor`);
  }

  const evidenceJson = JSON.stringify(MAIN_TALK_EVIDENCE);
  assert.doesNotMatch(evidenceJson, /97% LNG via Hormuz/i);
  assert.doesNotMatch(evidenceJson, /1\.7[46] TWh/i, 'Do not publish an annual curtailment total without the exact primary bulletin.');
})();
