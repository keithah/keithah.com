---
name: Unroll
tagline: Podcast ads, skipped before you hear them
description: An iOS podcast app and self-hosted RSS proxy that detects and removes sponsor reads on-device, so episodes play without the ad break — no account, no cloud processing.
site: https://testflight.apple.com/join/1RdVtffd
lang: Swift
version: TestFlight
status: beta
platforms: [iOS, Web]
tags: [swift, ios, podcasts, ads, on-device]
license: Proprietary
noindex: true
---

Unroll removes podcast advertising from the episode before you press play. The active product is a native iOS app that runs the whole pipeline on-device; a frozen Python reference remains in the repository as the behaviour contract the Swift port is tested against.

## How it works

Detection runs as a cascade rather than a single model. Known recurring audio fingerprints and show-specific cue templates come first, then splice, loudness, silence and transition candidates, then transcript-aware sponsor segmentation, and finally a strict versioned policy gate before anything is cut or skipped.

The gate is the point. A conservative rule that passes an ad through is a better outcome than a wrong cut, so uncertain segments are kept intact by default and the original audio is preserved so a later policy correction can re-render rather than permanently damage an episode.

## Measured detection

Detection is evaluated, not sampled: 33 hand-annotated episodes across five corpora, plus 19 unannotated episodes used for false-positive auditing — 52 episodes, 55.9 hours.

- **95.9%** of annotated advertising removed
- **Precision 1.000** across that annotated set
- **0.0 seconds** of programme cut
- Includes an eight-episode set built and annotated *after* the detector was frozen

The methodology and the four distinct ways this project previously produced a meaningless number are documented in the repository, because a detection figure you cannot audit is worth nothing.

## Two delivery modes

| Mode | Listener uses | What Unroll delivers |
| --- | --- | --- |
| **Proxy feed** | Their existing podcast app | A rewritten RSS feed plus rendered audio with accepted intervals removed |
| **Simple player** | A narrow first-party app | Original audio plus persisted skip zones, with one-tap undo |

Automatic or pass-through, never a review queue: a listener must never have to approve individual episodes to get a usable feed. The proxy path works with Overcast, Pocket Casts, Apple Podcasts and Audiobookshelf. The same-Wi-Fi server is still a one-episode probe — if a player fetches from its own servers rather than the device, the LAN URL is unreachable, and that failure branch is documented rather than hidden.

## Availability

In TestFlight, iOS-first. Episode enrichment — summaries, topics and action items — runs through Apple Intelligence on-device and fails closed to empty fields when unavailable, while discovery uses Apple Podcasts and publisher RSS, so no Podcast Index credentials are involved.
