---
name: PingScope
tagline: Network latency monitoring for macOS and iOS
description: Per-interface latency breakdown, Starlink dish telemetry via local gRPC API, and an intelligent fault classification system that explains what's actually wrong and why.
repo: https://github.com/keithah/pingscope
lang: Swift 6.2
version: 0.9-beta
status: beta
platforms: [macOS 14+, iOS 17+]
tags: [networking, starlink, swift, macos, ios]
---

PingScope gives you real-time visibility into what's happening with your network — not just "something's slow" but which interface, which hop, and likely why.

## Features

- **Starlink dish telemetry** — live obstruction, latency, SNR, and uptime via local gRPC
- **Fault classification** — NetworkPerspectiveDiagnoser maps symptoms to root causes automatically
- **Multi-interface view** — compare Wi-Fi, Ethernet, and cellular side-by-side
- **Menu bar native** — always-on visibility, zero friction
