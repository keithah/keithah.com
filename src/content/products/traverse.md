---
name: Traverse
tagline: Travel eSIMs at one flat price, not a daily roaming fee
description: A travel eSIM storefront for unlocked, eSIM-compatible phones — pick a destination and a trip length, pay once, and install before you fly instead of paying your carrier $10–15 a day.
site: https://traverse.quest
lang: TypeScript
version: Live
status: active
platforms: [Web, iOS, Android]
tags: [esim, travel, cloudflare-workers, stripe, react]
license: Proprietary
---

Traverse is a travel eSIM storefront, live at [traverse.quest](https://traverse.quest). The premise is blunt: a carrier roaming pass bills $10–15 for every day you use data, while a travel eSIM is one price for the whole trip. Traverse turns that into a guided flow — check the phone, pick a plan, pay once, install with screenshots.

## Features

- **Quote in three questions** — destination, trip length, and roughly how much data. The catalog is normalized and priced server-side, so the number you see is the number you pay.
- **Flat trip pricing** — a fixed-data plan (1 GB to 100 GB) or a daily plan, with multi-country add-ons and regional passes covering Europe (35 countries) and Global (117 countries).
- **Setup you can actually follow** — a five-step install guide rendered as annotated phone screens, including the roaming settings that avoid carrier fees, plus a phone-readiness check before you buy.
- **Keep your number if you want** — Traverse can be your only active line, or run alongside your home line for carrier texts and calls, with per-carrier guidance on what can cost extra.
- **Checkout that reconciles** — immutable quotes that expire after 15 minutes, Stripe Checkout for cards and wallets, guest checkout and email recovery, plus supplier-confirmed cancellations with refunds.
- **Built for support, not just sales** — eSIM sharing and gifts, paid top-ups, an AI assistant, WhatsApp and email support threads, and an admin console for catalog, orders, refunds and financial reconciliation.

## How it runs

A single Cloudflare Worker serves the React storefront and the API, backed by D1. The supplier catalog refreshes every six hours to stay inside its freshness window, and a ten-minute cron reconciles pending orders and top-ups, drains notification outboxes, and runs operations monitoring. Payments provision only when the Stripe signature is valid and the paid amount matches the order; anything else goes to review. A Capacitor companion app carries the offline install guides and checklist.
