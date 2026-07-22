# Wattline product page design

**Date:** 2026-07-22
**Status:** Approved for implementation planning

## Reader and outcome

The reader is a prospective Wattline owner landing on keithah.com. After
reading the page, they understand that Wattline is an Apple app for compatible
power devices, that direct Bluetooth Low Energy is its everyday connection
path, and that they can follow development on GitHub. They can also recognize
that a router running `wattlined` is optional rather than a requirement.

## Scope

Create `/products/wattline/` inside the existing keithah.com Astro site. The
page follows PingScope's dedicated product-page rhythm without copying its
diagnostic product identity. It uses a Wattline-specific electric
violet-and-blue treatment, real Wattline app captures, a working GitHub CTA,
and a clearly non-actionable TestFlight “coming soon” status.

## Information architecture

1. A compact product subnavigation and hero introduce Wattline with direct BLE
   as the default route.
2. The hero places the real app dashboard beside a subtle Bluetooth signal
   treatment. Its primary CTA links to https://github.com/keithah/wattline.
3. A direct-BLE section explains nearby discovery, live status, and controls
   without a router or cloud prerequisite.
4. A screens section uses real iPhone app states, including a clearly labeled
   demo-safe dashboard.
5. A secondary router section explains that `wattlined` on an OpenWrt or
   GL.iNet router can add LAN access, automation, and an optional remote route.
   It links to https://github.com/keithah/openwrt-wattline instead of copying
   deployment instructions.
6. The final CTA invites readers to follow development on GitHub. TestFlight
   remains visually present but explicitly unavailable until it has a real
   destination.

## Visual system

Reuse the PingScope page's dark full-bleed surface, editorial hierarchy,
oversized typography, numbered sections, responsive real-app imagery, and
keyboard-focus treatment. Wattline replaces PingScope's green diagnostic
language with electric violet and blue accents. The layout gives BLE the
highest visual priority; router context appears later and has less visual
weight.

The page may reuse privacy-safe screenshots from the Wattline documentation
branch where their crop works. All images have meaningful alt text and contain
no personal, account, router, token, device, or Bluetooth identifiers.

## Implementation and validation

Add a Wattline product content record, route-specific product template branch,
scoped style rules, and public product assets. Add a dedicated static-page
contract test that verifies the route, GitHub CTA, non-actionable TestFlight
label, BLE-before-router content order, companion link, image references, and
asset existence. Build the existing Astro site before publishing.

## Constraints

- GitHub is the only actionable launch CTA.
- TestFlight must not look active or link to a placeholder.
- Do not claim a released app, App Store listing, deployed remote relay, or
  hardware validation.
- Keep the router section accurate and secondary to BLE.
- Preserve the existing PingScope page and site-wide product behavior.
