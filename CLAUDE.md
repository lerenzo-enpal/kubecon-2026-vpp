# Project: KubeCon 2026 VPP Presentation

## Style
- **No emoji** in slide components or visualizations. The presentation uses a dark, cinematic "Hollywood spy" UI aesthetic — clean monospace type, glowing accents, subtle grid backgrounds. Emoji breaks this tone.
- Color palette defined in `presentation/src/theme.js` — use those tokens, not hardcoded colors (except Databricks orange `#FF3621` / `#E25A1C`).
- Font: JetBrains Mono for all diagram/canvas text. Inter for slide headings/body.

## Architecture
- **Flexa** is the VPP Controller (joint venture Enpal + Entrix). Previously mislabeled "Flexor" in some places — always use "Flexa."
- Spark does NOT connect to EMQX directly.
- See `docs/architecture-data-flow.md` for the canonical data flow reference.

## Tech Stack
- React 18 + Spectacle (presentation framework)
- Vite build, TailwindCSS v4
- Canvas API for animated diagrams
- Deployed via Netlify

## Styling
- **Prefer Tailwind utility classes over inline styles.** Use `className="h-32"` not `style={{ height: 128 }}`. Use `text-xl` not `text-[22px]`. Only use inline styles for dynamic values that depend on JS variables (e.g. theme colors).
- **Use Tailwind's built-in size scale** (`text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, etc.) instead of arbitrary values like `text-[20px]`. Arbitrary values should be the exception, not the default.

## Visual Validation
- **Use the Playwright MCP tools** (`browser_navigate`, `browser_take_screenshot`, `browser_press_key`) for visual validation of slides. Do not write Node scripts for screenshots.
- Navigate to slides via `http://localhost:5199/?slideIndex=N` (0-indexed).
- If the Playwright MCP server is not available, ask the user to install it before proceeding with visual work.
- Always screenshot after making visual changes to verify before asking the user to review.

## Speaker Notes
- **Bullets and main ideas, not a script.** Notes should be concise talking points the speaker can glance at.
- Include backup points for anticipated audience questions.
- Never write notes as full sentences meant to be read verbatim.

## Performance
- **Wrap heavy components in `<LazyContent>`** so they only mount when their slide is active. This prevents idle WebGL contexts, RAF loops, and tile loading on off-screen slides.
- **Components using Spectacle's `useSteps`** cannot be wrapped directly in `<LazyContent>` (unmounting deregisters steps). Use `<StepBridge count={N}>` instead — it owns the `useSteps` registration and passes the step value via a render prop. The child component receives a `step` prop instead of calling `useSteps` internally.
- **Gate RAF loops with `slideContext?.isSlideActive`** — import `SlideContext` from Spectacle and check `isSlideActive` before calling `requestAnimationFrame`. Add it to `useEffect` dependency arrays so loops restart when the slide becomes active.
- **Avoid `setState` inside RAF loops** — use `useRef` for animation values that change every frame. Only call `setState` at meaningful thresholds or when the animation completes.

## Testing
- **Minimize browser round-trips** when using Playwright/Chrome DevTools MCP. Make the change, take ONE screenshot, assess. Don't navigate/screenshot/read repeatedly.
- **Don't remove React-owned DOM nodes** via `evaluate_script` — it crashes React's reconciler. Dismiss overlays by triggering the React dismiss handler (e.g. pressing the expected key) instead.
- **HMR is fast (<1s)** — the bottleneck is MCP tool call latency, not the dev server. Trust code changes for non-visual logic; only screenshot for layout/visual issues.

## Git Workflow
- **Never push without explicit permission.** Commit freely when asked, but always wait for the user to say "push" before running `git push`.
- **Never commit without explicit permission.** Always wait for the user to say "commit" before running `git commit`.
- No `Co-Authored-By` lines in commits.
