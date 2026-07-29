# Washi ComfyUI — next-step plans

Generated 6-panel 512×512 mood-board landed in `~/ComfyUI-Installs/ComfyUI/ComfyUI/output/`
(p01_opening, p05_oneday, p06_kyushu, p13_metaphor, p20_fleet, p26_close).
Workflow: `/tmp/washi_batch.py` (Z-Image Turbo + qwen_3_4b CLIP + ae.safetensors VAE, 8 steps, res_multistep/simple, cfg=1, shift=3).

---

## Option A — Use current 6 as slide backgrounds

**Goal:** drop the mood-board panels behind matching slides as low-opacity texture.

**Steps:**
1. `mkdir docs/planning/washi-mood/` and copy the 6 PNGs in (versioned with talk).
2. Pick 2–3 slides that map cleanly (opening, one-day arc, close).
3. In the slide component, add `<img>` with `opacity: 0.15–0.25`, `object-fit: cover`, `position: absolute`, `z-index: -1`.
4. Verify text contrast on cream/amber background — bump text weight or add subtle white scrim if needed.
5. Screenshot check on projector-gamma.

**Time:** ~30 min. **Risk:** low. **Reversible:** yes.

---

## Option B — Scale to full 26-panel washi board

**Goal:** one washi image per storyboard panel in `main-talk-slide-storyboard.svg`.

**Steps:**
1. Extract all 26 panel titles + one-line concepts from `docs/planning/main-talk-slide-storyboard.svg`.
2. Extend `PANELS` list in `/tmp/washi_batch.py` (or copy into `scripts/gen_washi_board.py` in-repo).
3. Keep 512×512, 8 steps → ~1 min/panel on MPS → ~30 min wall time.
4. Queue overnight or in background; ComfyUI handles the queue serially.
5. Review, regen the misses with tweaked prompts (seed bump + concept rewrite).
6. Assemble contact-sheet SVG (6×5 grid) as `docs/planning/main-talk-washi-board.svg` for side-by-side with storyboard.

**Time:** ~45 min work + ~30 min gen. **Risk:** some panels will need a re-roll. **Reversible:** yes.

---

## Option C — Upgrade hero panels to 1024×1024

**Goal:** print-quality opener + closer (p01, p26) — the two panels the audience stares at longest.

**Steps:**
1. Duplicate `washi_batch.py` → `washi_hero.py`, set `width/height` to 1024 in `EmptySD3LatentImage`.
2. Keep step count at 8 (turbo); expect ~5–6 min/panel on MPS.
3. Queue p01_opening + p26_close only; leave the machine alone.
4. Compare 1024 vs 512 at slide-projected size; if 512 already reads clean at projector distance, skip 1024 entirely.
5. Optional: bump steps to 12–16 for detail if turbo output looks under-baked at 1024.

**Time:** ~15 min work + ~12 min gen. **Risk:** MPS OOM at 1024 is possible — fall back to 768 if it crashes. **Reversible:** yes.

---

## Option D — Paid Seedance/OpenAI storyboard→video

**Goal:** feed a talk description in, get storyboard PNGs + animated MP4 clips out.

**Steps:**
1. Locate the `seedance2_storyboard_to_video` workflow in ComfyUI templates.
2. Confirm API keys are needed: OpenAI (GPT-Image-V2 for storyboard step) + ByteDance Seedance 2.0 (video step). **Both are paid.** Budget check before running.
3. Write a one-paragraph talk synopsis (opening → constraint → proof → close) as the input prompt.
4. Run Step 1 (storyboard-only) first — cheaper, produces PNGs. Review before spending on video.
5. If storyboards look promising, run Step 2 on selected panels only — not all of them, to control cost.
6. Compare against hand-authored `main-talk-slide-storyboard.svg`; if the AI storyboard is worse, the exercise still validates the human version.

**Time:** ~1 hr including cost-review pause. **Risk:** ¥¥¥ if run naively. **Reversible:** no (spent tokens are spent).

**Guardrail:** set a hard budget cap (e.g. $5) before starting; abort if the workflow can't be scoped to that.

---

## Suggested order

1. **A** while slides are being updated anyway (cheapest, biggest visual payoff).
2. **B** once A proves the aesthetic works on-slide.
3. **C** only if projector test shows 512 is too soft.
4. **D** last, only if there's budget appetite and curiosity — the mood-board approach may already cover the need.
