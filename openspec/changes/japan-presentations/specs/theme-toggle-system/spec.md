## ADDED Requirements

### Requirement: Theme token file defines all color and font CSS custom property values
The system SHALL provide `presentation-japan/src/theme.japan.js` exporting a `themes` object with keys `dark`, `light`, and `hybrid`. Each key maps to an object of CSS custom property values. Only the `dark` theme values are required to be complete at ship time; `light` and `hybrid` MAY be stubs that inherit dark values.

#### Scenario: Dark theme tokens are complete
- **WHEN** `themes.dark` is accessed
- **THEN** it contains values for all required tokens: `--color-bg`, `--color-surface`, `--color-heading`, `--color-text`, `--color-muted`, `--color-primary`, `--color-accent`, `--color-warm`, `--color-danger`, `--color-success`, `--font-heading`, `--font-body`, `--font-mono`

#### Scenario: Light and hybrid stubs exist
- **WHEN** `themes.light` or `themes.hybrid` is accessed
- **THEN** the object is defined (not undefined), even if values fall back to dark theme values

---

### Requirement: useTheme hook reads, applies, and exposes theme state
The system SHALL provide `presentation-japan/src/hooks/useTheme.js` exporting a `useTheme` hook that:
1. Reads `?theme=` URL search param on mount
2. Falls back to `localStorage.getItem('vpp-theme')` if no URL param
3. Falls back to `'dark'` if neither is set
4. Applies the resolved theme by setting all CSS custom properties on `document.documentElement`
5. Returns `{ theme, setTheme }` where `setTheme(value)` writes both the URL param and `localStorage`

#### Scenario: URL param takes precedence over localStorage
- **WHEN** URL contains `?theme=light` and localStorage has `vpp-theme=dark`
- **THEN** `theme` resolves to `'light'`

#### Scenario: localStorage is read when URL param is absent
- **WHEN** URL has no `?theme=` param and localStorage has `vpp-theme=light`
- **THEN** `theme` resolves to `'light'`

#### Scenario: Default is dark when nothing is set
- **WHEN** URL has no `?theme=` param and localStorage has no `vpp-theme` key
- **THEN** `theme` resolves to `'dark'`

#### Scenario: setTheme writes both URL and localStorage
- **WHEN** `setTheme('light')` is called
- **THEN** the URL param `?theme=light` is written and `localStorage.getItem('vpp-theme')` returns `'light'`

#### Scenario: CSS custom properties are applied to document root
- **WHEN** `useTheme` resolves to `'dark'`
- **THEN** `document.documentElement.style.getPropertyValue('--color-bg')` returns the dark theme bg value

---

### Requirement: Theme toggle UI button is visible in slide chrome
The system SHALL render a theme toggle button in the slide chrome (top-right corner overlay, outside the Spectacle slide area) on all slides. The button SHALL display the current theme name and cycle through `dark → light → hybrid → dark` on click. The button SHALL be positioned with `position: fixed` so it does not shift with slide content.

#### Scenario: Toggle button is visible on all slides
- **WHEN** any slide is active
- **THEN** the theme toggle button is visible in the top-right corner

#### Scenario: Button label reflects current theme
- **WHEN** the current theme is `'dark'`
- **THEN** the button displays text indicating the dark theme is active (e.g., "Dark" or a moon icon label)

#### Scenario: Clicking cycles to next theme
- **WHEN** the toggle button is clicked while theme is `'dark'`
- **THEN** theme transitions to `'light'` and the button label updates accordingly

#### Scenario: Button does not overlap slide navigation controls
- **WHEN** any slide is active
- **THEN** the toggle button does not obscure Spectacle's built-in navigation arrows or progress indicator

---

### Requirement: Spectacle Deck receives a computed theme object derived from active CSS tokens
The system SHALL pass a Spectacle-compatible theme object to `<Deck theme={}>` derived from the active theme tokens. The Spectacle theme object SHALL use `Space Grotesk` for `fonts.header`, `Inter` for `fonts.text`, and `JetBrains Mono` for `fonts.monospace`.

#### Scenario: Spectacle header font is Space Grotesk
- **WHEN** any slide with a `<Heading>` component is rendered
- **THEN** the computed font-family is Space Grotesk (not Inter or JetBrains Mono)

#### Scenario: Spectacle theme updates when theme is toggled
- **WHEN** the theme is changed via the toggle button
- **THEN** Spectacle's `<Deck>` re-renders with the updated theme object

---

### Requirement: Theme toggle ships with dark as the only complete implementation
At initial ship time, `setTheme('light')` and `setTheme('hybrid')` SHALL be callable without errors, but the visual result MAY be identical to dark until the light and hybrid theme token values are populated.

#### Scenario: Toggling to light does not throw
- **WHEN** `setTheme('light')` is called
- **THEN** no JavaScript error is thrown and the page does not crash
