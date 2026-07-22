# Wattline Power-Console Product Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `/products/wattline/` so battery telemetry and power control are the page’s central story, with direct BLE and the router companion presented as supporting capabilities.

**Architecture:** Keep the existing Astro product route and `.ps-wattline` scope. Refactor the Wattline branch into a battery/control-first semantic sequence, then support it with a scoped power-console visual system and an expanded post-build contract. Reuse the reviewed captures; do not add fabricated telemetry or a fake TestFlight destination.

**Tech Stack:** Astro static templates, CSS, Node.js static-page contract validation, checked-in PNG captures.

## Global Constraints

- The exact hero headline is `Know what your battery is doing.`
- The order is battery state, output controls, schedules, direct/local connection, then optional router companion.
- GitHub remains the only actionable launch CTA; TestFlight remains a disabled `TestFlight coming soon` status until a genuine external testing URL exists.
- Do not claim an App Store release, deployed remote relay, hardware validation, or physical measurements from generated dashboard data.
- Use the current approved Wattline and openwrt-wattline captures only; preserve their exact dimensions and meaningful alt text.
- Keep `.ps-wattline` scoped and preserve PingScope, Starwatch, and generic product behavior.
- Retain keyboard focus, reduced-motion behavior, responsive single-column layouts, and no mobile horizontal overflow.

---

## File Structure

- `src/pages/products/[slug].astro` — Wattline-specific semantic content order and real image placement.
- `src/styles/global.css` — scoped power-console tokens, hero metric callouts, capability bands, and compact overlapping router composition.
- `scripts/validate-wattline-product-page.mjs` — static assertions for the new headline/content order, absence of BLE-first framing, image integrity, CTA safety, and route isolation.

### Task 1: Define the power-console static contract

**Files:**
- Modify: `scripts/validate-wattline-product-page.mjs`

**Consumes:** Existing built `dist/products/wattline/index.html` and the product page’s established image/CTA contract.

**Produces:** A deliberately failing assertion set that prevents a regression to BLE-first copy or a placeholder TestFlight link.

- [ ] **Step 1: Add failing semantic-order assertions**

  Add these required strings to the validator:

  ```js
  'Know what your battery is doing.',
  'See the charge',
  'Control the outputs',
  'Run on a schedule',
  'Direct and local',
  'Browser monitoring and automation',
  ```

  Add an ordered sequence assertion that requires their first occurrences to
  increase in exactly the listed order. Add `Direct Bluetooth control` and
  `Bluetooth is the everyday connection.` to the prohibited strings.

- [ ] **Step 2: Verify the current page fails for the intended reason**

  Run:

  ```bash
  npm run validate:wattline
  ```

  Expected: failure reporting the missing new hero/capability content; existing
  image, CTA, and route-isolation checks remain intact.

- [ ] **Step 3: Commit the red contract**

  ```bash
  git add scripts/validate-wattline-product-page.mjs
  git commit -m "test: define Wattline power-console contract"
  ```

### Task 2: Rebuild the Wattline narrative around battery and controls

**Files:**
- Modify: `src/pages/products/[slug].astro`

**Consumes:** Task 1’s required strings and the existing reviewed dashboard, onboarding, nearby-device, router-pairing, and router-panel assets.

**Produces:** A semantic Wattline page whose main content makes power state and control primary.

- [ ] **Step 1: Replace the hero copy and add metric callout markup**

  Change the eyebrow to `Live battery and output control`, set the hero H1 to
  `Know what your battery is doing.`, and use this lede:

  ```astro
  <p class="ps-lede">See charge, live output, and runtime at a glance—then control the ports and routines that keep your gear running.</p>
  ```

  Beside the existing dashboard image, add a `.wt-hero-metrics` list with only
  these clearly-presentational labels and values: `62% / Battery`, `44.8 W /
  Live output`, `2 h 7 m / Runtime`, and `DC port / Discharging`. Add a nearby
  text disclosure that dashboard values are generated Demo Mode examples, not
  physical readings.

- [ ] **Step 2: Replace the BLE-first panel with three capability bands**

  Replace `#ble` with `#power`, containing three semantic articles in this
  exact order and with these headings:

  ```text
  See the charge
  Control the outputs
  Run on a schedule
  ```

  Each article must cover only its promised capability: battery telemetry;
  DC/USB-C, bypass, and limits; then device-resident schedules. Use the
  dashboard capture as the large visual evidence, not invented graphs or
  measurements.

- [ ] **Step 3: Make the direct connection supporting content**

  Replace the onboarding-first section heading with `Direct and local`. Keep
  onboarding and discovery images, explain Bluetooth Low Energy, no account,
  and no cloud in one concise supporting paragraph. Do not use a BLE-first
  hero headline or repeat discovery as the primary product value.

- [ ] **Step 4: Compact and reframe the router section**

  Change the router lead to `Browser monitoring and automation` and preserve
  the OpenWrt companion link plus the constrained remote-validation sentence.
  Retain both router images and their existing alt text, but wrap them in one
  `.wt-router-stack` composition so the pairing image acts as a smaller
  overlapping supporting screen on desktop rather than an equal column.

- [ ] **Step 5: Verify the contract turns green**

  Run:

  ```bash
  npm run validate:wattline
  git diff --check
  ```

  Expected: `PASS: Wattline product page contract` with no whitespace errors.

- [ ] **Step 6: Commit the content restructure**

  ```bash
  git add src/pages/products/'[slug].astro'
  git commit -m "feat: center Wattline on battery control"
  ```

### Task 3: Apply the power-console visual system and verify regressions

**Files:**
- Modify: `src/styles/global.css`
- Modify: `scripts/validate-wattline-product-page.mjs`

**Consumes:** Task 2’s `.wt-hero-metrics`, `#power`, `.wt-router-stack`, and existing responsive/focus conventions.

**Produces:** A distinct control-forward page that is clean at desktop and mobile sizes without changing unrelated product styling.

- [ ] **Step 1: Add scoped battery and draw tokens**

  In `.ps-wattline`, add:

  ```css
  --wt-charge: #47d17a;
  --wt-draw: #ffab3d;
  ```

  Use them only for state-bearing metric accents. Keep `--ps-dim: #817b98` and
  reviewed focus color behavior unchanged.

- [ ] **Step 2: Style the hero as one coherent power surface**

  Use `.wt-hero-metrics` to layer small readable panels around the dominant
  dashboard screen. The dashboard remains the largest element. The metric list
  must not obscure key dashboard content; on screens at or below 900px it
  becomes a compact two-column grid below the capture, and at or below 560px it
  becomes a single visible flow without absolute positioning.

- [ ] **Step 3: Style capability bands and router stack**

  Replace the existing equal card-wall effect with three full-width capability
  bands that pair a large number/short label with concise copy. Make
  `.wt-router-stack` relative, with the panel capture as its main screen and
  the pairing capture at roughly 42% width, overlapping only at desktop sizes.
  Collapse to a readable non-overlapping flow under 900px. Remove obsolete
  `.wt-router-captures` equal-column rules.

- [ ] **Step 4: Extend the contract for the integrated router composition**

  Require `wt-router-stack` in Wattline HTML and reject `wt-router-captures`.
  Preserve exact image existence, dimensions, alt, lazy/eager, decoding, safe
  TestFlight, and product-isolation assertions.

- [ ] **Step 5: Run complete validation**

  Run:

  ```bash
  npm run build
  npm run validate:wattline
  npm run validate:pingscope
  git diff --check main...HEAD
  ```

  Expected: both product contracts print `PASS`; Astro emits the Wattline route;
  no diff whitespace error appears. The pre-existing empty-posts collection
  notice may appear but must not make the build fail.

- [ ] **Step 6: Commit the finished visual redesign**

  ```bash
  git add src/styles/global.css scripts/validate-wattline-product-page.mjs src/pages/products/'[slug].astro'
  git commit -m "feat: redesign Wattline as a power console"
  ```

## TestFlight Follow-up

Do not add a TestFlight link during this page plan. The release task starts
only after the user supplies/selects an Apple development team and App Store
Connect access for `com.keithah.wattline`. Its separate plan must cover archive
signing, upload, Apple processing/external review, tester-group enablement,
and only then replacement of the disabled page status with the issued public
URL.
