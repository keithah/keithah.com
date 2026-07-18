---
name: Starwatch
tagline: Starlink monitoring & control for OpenWrt routers
description: An offline-first Starlink observatory that runs on your OpenWrt or GL.iNet router — dish telemetry, tiered history, alerts, guarded controls, and a dashboard in LuCI and the GL.iNet panel.
repo: https://github.com/keithah/openwrt-starwatch
lang: Go
version: 0.1.0
status: beta
platforms: [OpenWrt 23.05+, GL.iNet SDK4]
tags: [starlink, openwrt, glinet, opkg, networking, monitoring]
license: AGPL-3.0
---

Starwatch turns the router that already sits behind your Starlink dish into a full-time monitor and control panel. A small Go daemon reads the dish's local gRPC API, keeps history the dish itself can't, watches the WAN path, raises alerts, and serves a responsive dashboard — all on the router, with no Starlink account and no cloud.

## Features

- **Dish telemetry & controls** — latency, throughput, drop rate, power draw, obstruction map, alignment, GPS/PNT status, plus audited controls: reboot, stow/unstow, snow-melt, sleep schedule, and speed test.
- **History that outlives the dish's 15-minute buffer** — 1 Hz RAM rings downsampled to on-router SQLite for 30 days of graphs and a persistent outage log, tuned to be gentle on flash.
- **Merged outage timeline** — distinguishes a dish outage from a dish that's simply unreachable from an upstream path problem — the sharpest diagnostic neither the app nor the dish gives you.
- **Alerts** — outage, obstruction, thermal, water, drop-rate and more, pushed over webhook or ntfy with in-UI history.
- **VPN-proof dish access** — a self-healing `192.168.100.1/32` host route keeps the dish reachable even when a VPN owns the default route, and never touches your general routing or firewall.
- **Guarded Starlink-router management** — on double-NAT setups, read the router's clients, radios, and Wi-Fi, and make guarded, readback-confirmed changes. Wi-Fi passphrases are write-only and network edits refuse to erase another network's credentials.
- **Speedify-grade dashboard** — a seven-section icon-rail UI, embedded in **LuCI** and the **GL.iNet Applications** panel, with a customizable Overview. Everything is offline, token-authenticated, and local.

## Install

One line over SSH, from a signed opkg feed (currently `aarch64_cortex-a53`, e.g. GL-X3000):

```sh
wget -qO- https://keithah.github.io/openwrt-starwatch/install.sh | sh
```

The installer checks your architecture, picks the GL.iNet or LuCI package automatically, pins the feed's signing key, and never forces a downgrade. Then open **Applications → Starwatch** (GL.iNet), **Services → Starwatch** (LuCI), or `http://<router>:9633`.
