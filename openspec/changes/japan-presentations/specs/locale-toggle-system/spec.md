## ADDED Requirements

### Requirement: Locale strings file contains all EN slide text content
The system SHALL provide `presentation-japan/src/locales/en.js` exporting a flat object mapping string keys to English text values for all slide titles, subtitles, speaker section headings, and key stat callout labels. HUD overlay labels and chart axis annotations SHALL NOT be in this file (they are data, not UI text).

#### Scenario: All slide titles are in en.js
- **WHEN** `en.js` is imported
- **THEN** every slide title text used in `Keynote.jsx` and `MainTalk.jsx` has a corresponding key

#### Scenario: Chart annotations are NOT in en.js
- **WHEN** `en.js` is inspected
- **THEN** no keys reference internal chart labels, axis tick text, or HUD data readouts

---

### Requirement: useLocale hook reads, applies, and exposes locale state
The system SHALL provide `presentation-japan/src/hooks/useLocale.js` exporting a `useLocale` hook following the same pattern as `useTheme`:
1. Reads `?lang=` URL search param on mount
2. Falls back to `localStorage.getItem('vpp-lang')` if no URL param
3. Falls back to `'en'` if neither is set
4. Returns `{ locale, setLocale, t }` where `t(key)` returns the string for the active locale

At ship time, only `'en'` is a valid locale with complete strings. `'ja'` SHALL be recognized as a valid value without error but SHOULD fall back to `'en'` strings until a `ja.js` file is provided.

#### Scenario: URL param takes precedence over localStorage
- **WHEN** URL contains `?lang=ja` and localStorage has `vpp-lang=en`
- **THEN** `locale` resolves to `'ja'`

#### Scenario: Default is en when nothing is set
- **WHEN** URL has no `?lang=` param and localStorage has no `vpp-lang` key
- **THEN** `locale` resolves to `'en'`

#### Scenario: t(key) returns string for active locale
- **WHEN** `locale` is `'en'` and `t('keynote.opening.title')` is called
- **THEN** the English string for that key is returned

#### Scenario: t(key) falls back to en for unknown locale
- **WHEN** `locale` is `'ja'` and no `ja.js` file exists
- **THEN** `t(key)` returns the English string without throwing

#### Scenario: setLocale writes both URL and localStorage
- **WHEN** `setLocale('ja')` is called
- **THEN** the URL param `?lang=ja` is written and `localStorage.getItem('vpp-lang')` returns `'ja'`

---

### Requirement: Locale toggle UI button is visible in slide chrome
The system SHALL render a locale toggle button in the slide chrome alongside the theme toggle button. At ship time, the button SHALL display "EN" and MAY be visually disabled/dimmed since only EN is available. The button SHALL be clickable without errors even when only EN is available.

#### Scenario: Locale button is visible
- **WHEN** any slide is active
- **THEN** the locale toggle button is visible (top-right corner, adjacent to theme toggle)

#### Scenario: Clicking locale button does not throw
- **WHEN** the locale button is clicked while only EN is available
- **THEN** no JavaScript error is thrown

---

### Requirement: Slide text content uses t() calls not inline strings
All user-visible text in `Keynote.jsx` and `MainTalk.jsx` slide components (titles, subtitles, speaker labels, stat callouts) SHALL use `t('key')` rather than inline string literals, so that adding a `ja.js` locale file is sufficient to localize without touching JSX files.

#### Scenario: No bare string literals in slide titles
- **WHEN** `Keynote.jsx` and `MainTalk.jsx` are statically analyzed
- **THEN** `<Heading>` and `<Text>` components with slide content use `{t('...')}` not bare string literals

#### Scenario: Adding ja.js is sufficient for Japanese localization
- **WHEN** a `ja.js` file is created with the same keys as `en.js` and Japanese string values
- **THEN** setting `?lang=ja` renders all slide text in Japanese with no JSX changes required
