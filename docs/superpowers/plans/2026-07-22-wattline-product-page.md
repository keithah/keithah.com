# Wattline Product Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a BLE-first Wattline product page at `/products/wattline/` with real app screens, a GitHub CTA, and clearly-secondary optional router context.

**Architecture:** Add a `wattline` product record to make the static Astro route available, then add a route-specific branch beside the existing PingScope and Starwatch branches in `src/pages/products/[slug].astro`. Keep its CSS scoped under `.ps-wattline`; reuse the shared product primitives only where they do not import PingScope’s green identity. A standalone post-build Node contract validates copy, link safety, content order, asset references, and route isolation.

**Tech Stack:** Astro content collections and static routing, Astro templates, CSS, Node.js post-build validation, real iOS simulator PNG captures.

## Global Constraints

- GitHub (`https://github.com/keithah/wattline`) is the only actionable launch CTA.
- Show TestFlight only as an unavailable status: it has no `href`, is disabled, and says “TestFlight coming soon”.
- Treat direct BLE as the primary connection path; do not require a router or cloud account.
- Router copy is secondary, links to `https://github.com/keithah/openwrt-wattline`, and does not claim a deployed remote relay or hardware validation.
- Do not claim a released app or App Store listing.
- Use only the three reviewed public, privacy-safe captures from `/Users/keith/.codex/worktrees/wattline-docs/docs/images/`.
- Preserve the PingScope, Starwatch, generic product routes, site-wide navigation behavior, and existing product-page styles.
- Every non-decorative image needs meaningful alt text, explicit dimensions, `loading="lazy"`, and `decoding="async"`, except the hero image which is eager.

---

## File Structure

- `src/content/products/wattline.md` — content collection record that creates the `/products/wattline/` path and owns durable product metadata.
- `src/pages/products/[slug].astro` — declares `isWattline`, scopes font loading/navigation behavior, and renders Wattline’s BLE-first page branch before the generic product fallback.
- `src/styles/global.css` — contains `.ps-wattline`-scoped violet/blue design tokens, layout, focus styles, and responsive behavior.
- `public/products/wattline/{onboarding,nearby-devices,dashboard}.png` — reviewed real app captures copied without resampling from the documentation worktree.
- `scripts/validate-wattline-product-page.mjs` — post-build contract that guards the static page’s release claims, CTA behavior, asset integrity, and BLE-before-router hierarchy.
- `package.json` — adds the precise Wattline validation command, leaving `build` unchanged.

### Task 1: Establish the Wattline route and test contract

**Files:**
- Create: `src/content/products/wattline.md`
- Create: `scripts/validate-wattline-product-page.mjs`
- Modify: `package.json`

**Consumes:** Astro’s `products` collection schema in `src/content/config.ts` and the existing `dist/` static output produced by `npm run build`.

**Produces:** `/products/wattline/` as a generated route and `npm run validate:wattline`, which fails until the dedicated template, assets, and safe launch UX exist.

- [ ] **Step 1: Write the content record and failing static-page contract**

  Create `src/content/products/wattline.md` with this front matter and short BLE-first body:

  ```md
  ---
  name: Wattline
  tagline: Direct Bluetooth control for compatible power devices
  description: An Apple companion app for nearby compatible power devices, built around direct Bluetooth Low Energy control.
  repo: https://github.com/keithah/wattline
  lang: Swift
  version: Development
  status: beta
  platforms: [iPhone, iPad, Mac]
  tags: [bluetooth, power, swift, apple]
  ---

  Wattline is in active development. Connect directly to a compatible nearby power device over Bluetooth Low Energy; the optional router companion belongs later in the setup.
  ```

  Create `scripts/validate-wattline-product-page.mjs` with imports from `node:fs/promises`, `node:url`, and `node:path`. It must read `dist/products/wattline/index.html`; at minimum, require these strings and fail when any is absent:

  ```js
  const required = [
    'Wattline',
    'https://github.com/keithah/wattline',
    'Bluetooth Low Energy',
    'TestFlight coming soon',
    'https://github.com/keithah/openwrt-wattline',
    '/products/wattline/onboarding.png',
    '/products/wattline/nearby-devices.png',
    '/products/wattline/dashboard.png',
  ];
  ```

  It must also assert that the first occurrence of `Bluetooth Low Energy` precedes the first occurrence of `openwrt-wattline`, reject `https://testflight.apple.com`, `App Store`, `remote relay is ready`, and `hardware validated`, and print `PASS: Wattline product page contract` only on success. Add `"validate:wattline": "node scripts/validate-wattline-product-page.mjs"` to `package.json`.

- [ ] **Step 2: Run the new contract to verify the red state**

  Run:

  ```bash
  npm run build && npm run validate:wattline
  ```

  Expected: the build completes, then validation fails because the dedicated Wattline markup/assets do not yet exist (for example, missing `Bluetooth Low Energy` or a Wattline screenshot path).

- [ ] **Step 3: Verify the new metadata type-checks without adding template behavior**

  Run:

  ```bash
  npm run build
  ```

  Expected: Astro emits `dist/products/wattline/index.html`; the generic page is acceptable temporarily, and the dedicated validator remains red until Task 2.

- [ ] **Step 4: Commit the independent red-test foundation**

  ```bash
  git add src/content/products/wattline.md scripts/validate-wattline-product-page.mjs package.json
  git commit -m "test: define Wattline product page contract"
  ```

### Task 2: Implement the BLE-first page and public app imagery

**Files:**
- Modify: `src/pages/products/[slug].astro`
- Modify: `src/styles/global.css`
- Create: `public/products/wattline/onboarding.png`
- Create: `public/products/wattline/nearby-devices.png`
- Create: `public/products/wattline/dashboard.png`

**Consumes:** The `wattline` content record and the failing strings from `scripts/validate-wattline-product-page.mjs`; exact source captures at `/Users/keith/.codex/worktrees/wattline-docs/docs/images/{onboarding,nearby-devices,dashboard}.png`.

**Produces:** The route-specific `.ps-wattline` page with no active TestFlight link, real captures, BLE-leading narrative, and the optional router companion section.

- [ ] **Step 1: Copy the approved images byte-for-byte and record their dimensions**

  Make `public/products/wattline/`, then copy only these known source files:

  ```bash
  mkdir -p public/products/wattline
  cp /Users/keith/.codex/worktrees/wattline-docs/docs/images/onboarding.png public/products/wattline/onboarding.png
  cp /Users/keith/.codex/worktrees/wattline-docs/docs/images/nearby-devices.png public/products/wattline/nearby-devices.png
  cp /Users/keith/.codex/worktrees/wattline-docs/docs/images/dashboard.png public/products/wattline/dashboard.png
  sips -g pixelWidth -g pixelHeight public/products/wattline/*.png
  ```

  Expected: all three images are 1206×2622 PNGs. Do not crop, manufacture data, or substitute a mock device screen.

- [ ] **Step 2: Add the Wattline template branch before the generic fallback**

  In `src/pages/products/[slug].astro`, add `const isWattline = product.slug === 'wattline';`, include it in `hidePrimaryNav`, and load the existing Archivo Black/IBM Plex Sans request for `isPingScope || isWattline` only. Insert `) : isWattline ? (` after the PingScope branch and before the generic `) : (` fallback.

  The page branch must use `<div class="ps-page ps-wattline">`, a compact subnav linking `#ble`, `#screens`, `#router`, and `#follow`, and these exact, safe launch controls:

  ```astro
  <a class="ps-btn ps-primary" href={d.repo} target="_blank" rel="noopener">View on GitHub</a>
  <span class="ps-btn wt-pending" aria-disabled="true">TestFlight coming soon</span>
  ```

  Render these semantic sections in this exact order:

  1. Hero: eyebrow `Direct Bluetooth control`, title `Power, close at hand.`, an explicit `Bluetooth Low Energy` paragraph, the GitHub CTA, unavailable TestFlight status, and eager `dashboard.png` at width `1206` / height `2622` with alt `Wattline Demo Mode dashboard with a DEMO badge and generated power status readings.`
  2. `#ble`: heading `Bluetooth is the everyday connection.` and three cards for discover, connect, and view status. State that a router and cloud account are not prerequisites.
  3. `#screens`: the onboarding and nearby-device screenshots at width `1206` / height `2622`, with these alts: `Wattline welcome screen offering Connect a device and Try Demo Mode.` and `Wattline Devices screen looking for nearby compatible power devices.` Include visible copy that labels the dashboard as Demo Mode generated data, not a physical measurement.
  4. `#router`: heading `Optional router, broader reach.` with constrained language: `wattlined` runs on an OpenWrt or GL.iNet router and can add local-network access and automation; link the companion repository; say remote access remains under hardware validation.
  5. `#follow`: final GitHub CTA and `TestFlight coming soon` plain status.

- [ ] **Step 3: Add a visually distinct but compatible Wattline CSS scope**

  Add `.ps-wattline` rules in `src/styles/global.css` immediately after the PingScope product rules. Define only scoped tokens:

  ```css
  .ps-wattline {
    --wt-violet: #a78bfa;
    --wt-blue: #52a8ff;
    --wt-panel: #11101b;
    --wt-line: rgba(218, 210, 255, 0.16);
  }
  ```

  Use the existing `.ps-*` layout vocabulary where safe, but scope every color override, focus ring, decorative Bluetooth signal, hero capture, screenshot grid, router panel, pending status, and media query under `.ps-wattline`. The pending control must use `cursor: not-allowed` and must not get an interactive hover transform. Provide `prefers-reduced-motion: reduce` and small-screen single-column layouts without modifying `.ps-pingscope` styles.

- [ ] **Step 4: Run the page contract, build, and static checks to verify green**

  Run:

  ```bash
  npm run build
  npm run validate:wattline
  git diff --check
  ```

  Expected: `PASS: Wattline product page contract`; the route exists, images resolve from `/products/wattline/`, TestFlight has no link, BLE text precedes router text, and no whitespace errors are reported.

- [ ] **Step 5: Commit the complete product experience**

  ```bash
  git add src/pages/products/'[slug].astro' src/styles/global.css public/products/wattline
  git commit -m "feat: add Wattline product page"
  ```

### Task 3: Strengthen the static contract and verify page isolation

**Files:**
- Modify: `scripts/validate-wattline-product-page.mjs`
- Modify: `package.json`

**Consumes:** The completed static Wattline route and unrelated static product pages emitted by `npm run build`.

**Produces:** A durable check of meaningful accessibility, asset dimensions/lazy behavior, disabled TestFlight semantics, and isolation from PingScope/Starwatch.

- [ ] **Step 1: Extend the validator with failing isolation and accessibility assertions**

  Add reads for `dist/products/pingscope/index.html` and `dist/products/starwatch/index.html`. For each Wattline asset, use `access()` and `stat()` to require a nonzero file larger than 10,000 bytes. Find its `<img>` tag in the Wattline HTML and assert its exact `width="1206" height="2622"`, meaningful six-word-or-longer `alt`, and `decoding="async"`; assert `loading="lazy"` for onboarding/nearby and no lazy attribute for the hero dashboard. Require a literal `<span class="ps-btn wt-pending" aria-disabled="true">TestFlight coming soon</span>` and reject any TestFlight href. Assert `.ps-wattline` appears only on the Wattline page and `/products/wattline/` assets do not leak into PingScope or Starwatch pages.

- [ ] **Step 2: Run the contract before and after its finalized assertion set**

  Run:

  ```bash
  npm run build && npm run validate:wattline
  ```

  Expected: the first run reveals any missed required HTML detail; make only the minimal template/CSS correction required by the failed assertion, then rerun to `PASS: Wattline product page contract`.

- [ ] **Step 3: Run the site’s existing product regression check**

  Run:

  ```bash
  npm run validate:pingscope
  git diff --check
  git status --short
  ```

  Expected: PingScope contract passes unchanged; no whitespace error; only the intended committed product-page changes remain.

- [ ] **Step 4: Commit the final regression protection**

  ```bash
  git add scripts/validate-wattline-product-page.mjs package.json src/pages/products/'[slug].astro' src/styles/global.css
  git commit -m "test: harden Wattline product page validation"
  ```

## Final Verification

- [ ] Run `npm run build`, `npm run validate:wattline`, and `npm run validate:pingscope` from `/Users/keith/.codex/worktrees/keithah-wattline`.
- [ ] Inspect `dist/products/wattline/index.html` to confirm GitHub is the only launch anchor and the product carries no App Store, external TestFlight, remote-ready, or hardware-validated claim.
- [ ] Open each `public/products/wattline/*.png` at original size and verify the images remain real, privacy-safe app screens.
- [ ] Review `git diff main...HEAD --check` and ensure `git status --short` is empty.
