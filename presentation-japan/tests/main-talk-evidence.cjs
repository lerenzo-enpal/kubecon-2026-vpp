const assert = require('node:assert/strict');

(async () => {
  const { MAIN_TALK_EVIDENCE } = await import('../src/data/mainTalkEvidence.mjs');
  assert.equal(MAIN_TALK_EVIDENCE.kyushuControl.value, '5.09 GW');
  assert.equal(MAIN_TALK_EVIDENCE.kyushuControl.sourceUrl, 'https://www.kyuden.co.jp/td_power_usages/out_ctrl_history.html');
  for (const [name, evidence] of Object.entries(MAIN_TALK_EVIDENCE)) {
    assert.ok(evidence.value, `${name} requires a value`);
    assert.ok(evidence.sourceLabel, `${name} requires a visible source label`);
    assert.match(evidence.sourceUrl, /^https:\/\//, `${name} requires an HTTPS source URL`);
    assert.ok(evidence.sourceYear, `${name} requires a source year`);
  }
})();
