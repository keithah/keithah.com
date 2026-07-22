# Wattline power-console product page design

**Date:** 2026-07-22
**Status:** Approved for implementation planning

## Outcome

Make Wattline read first as a power-station companion: a reader should quickly
understand battery state, live power, port control, limits, and schedules. BLE
is the private direct connection behind that experience, not the page's central
message. The primary hero headline is: **“Know what your battery is doing.”**

## Audience and hierarchy

The page is for a Link-Power owner who needs to know whether their equipment
can keep running and wants direct control over the battery's DC and USB-C
outputs. The information hierarchy is:

1. battery level, live watts, estimated runtime, and charging/discharging
   state;
2. output controls, bypass, and USB-C power limits;
3. schedules and on-device automation;
4. direct local BLE connection, no account, no cloud;
5. the optional OpenWrt/GL.iNet companion for browser-based pairing,
   monitoring, and automation.

## Page composition

### Hero: one power surface

The hero combines the existing real Wattline dashboard with a small, layered
set of CSS metric callouts: battery percentage, live watts, runtime, and a
port-state pill. Keep the actual app capture dominant. Use battery green for
healthy/charging state and amber for active draw; the site’s violet/blue stays
as an ambient brand accent rather than a telemetry color. The hero copy leads
with the approved headline and a concise promise about seeing and controlling
power locally.

The primary CTA remains GitHub. TestFlight stays a clearly non-actionable
status until an external testing URL genuinely exists; do not introduce a
placeholder link, App Store claim, release claim, or hardware-validation claim.

### Core capabilities: battery to control

Replace the BLE-first feature sequence with three large capability panels in
this order:

1. **See the charge** — capacity, voltage, current, direction, and runtime.
2. **Control the outputs** — DC and USB-C switching, bypass, and limits.
3. **Run on a schedule** — on-device timers and deliberate power routines.

Use the real dashboard and app screens as evidence; present short copy beside
large numbers rather than a dense generic card grid. Do not make up a live
device reading—dashboard values remain clearly identified as generated demo
data wherever their origin could be confused.

### Connection and router: supporting, not competing

Follow the control story with a compact direct-local section: Bluetooth LE,
no account, no cloud. It must not visually outweigh battery/control content.

The router remains an optional companion section. Reframe it around browser
monitoring and automation, then display the real `openwrt-wattline` pairing and
panel captures as a small, overlapping hero-like composition rather than two
equal card columns. Keep the companion link; say that remote access remains
under hardware validation.

## Visual system and accessibility

- Preserve the dark editorial page surface and the existing scoped
  `.ps-wattline` namespace.
- Add semantic battery green and amber only for state-bearing visual details;
  retain the reviewed AA-contrast text tokens.
- Avoid card-wall density: use one hero composition, three capability bands,
  and a smaller overlapping router composition.
- Keep all non-decorative images meaningful, with explicit dimensions and
  appropriate eager/lazy loading.
- Keep keyboard focus, reduced-motion behavior, responsive single-column
  layouts, and no horizontal overflow at mobile widths.

## TestFlight release path

External TestFlight cannot be represented honestly until the iOS target has a
selected Apple development team, an App Store Connect app for
`com.keithah.wattline`, and an authenticated upload path. Once those exist,
archive/upload an iPhone/iPad build, wait for Apple processing and external
beta review where required, enable an external tester group, then use the
issued public TestFlight URL in the page. This is a separate release task from
the visual redesign; it must not block the page from retaining its safe pending
state.

## Acceptance checks

- The first page content is battery/control, not Bluetooth discovery.
- The exact hero headline is “Know what your battery is doing.”
- Battery, output control, and schedules precede the compact BLE explanation.
- The router captures are visibly smaller and more integrated than the current
  equal-card presentation.
- Existing Wattline and PingScope static contracts pass after their explicit
  expected updates.
- No TestFlight placeholder URL, App Store, release, remote-ready, or
  hardware-validated claim appears.
