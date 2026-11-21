---
name: Unroll
tagline: Podcasts, minus the ad breaks
description: An iPhone app that finds the ads in your podcasts and skips them before you hear them. Everything happens on your phone — no account, nothing uploaded.
site: https://testflight.apple.com/join/1RdVtffd
lang: Swift
version: TestFlight
status: beta
platforms: [iOS, Web]
tags: [swift, ios, podcasts, ads, on-device]
license: Proprietary
noindex: true
---

Unroll finds the sponsor reads in your podcasts and skips them before you press play. Everything happens on your iPhone, with no account and nothing uploaded.

## How it works

Unroll checks each episode several different ways before it touches anything. It recognises ads it has heard before, listens for the pauses and jumps in sound where an ad was dropped in, and follows what's being said. It only skips when all of that agrees.

If there's any doubt, the audio stays in. You might hear the odd ad, but you won't lose part of your show — and the original audio is always kept, so nothing is ever permanently cut.

## Test results

Unroll was tested on 52 episodes — nearly 56 hours of real podcasts — including 33 where every ad had been marked by hand.

- **95.9%** of ad time removed
- **0** wrong cuts
- **0.0 seconds** of the actual show lost
- Includes eight episodes set aside until Unroll was finished, as a fair test on audio it had never heard

## Two ways to listen

| | How you listen | What Unroll does |
| --- | --- | --- |
| **In your own app** | Overcast, Pocket Casts, Apple Podcasts, Audiobookshelf | Gives you an ad-free version of the show's feed |
| **In the Unroll app** | A simple built-in player | Plays the original and skips the ads, with one tap to undo |

There's nothing to review or approve. Episodes show up ready to play. Listening in your own app is still early: for now it works one episode at a time, on the same Wi-Fi as your iPhone.

## Availability

In private beta for iPhone, through TestFlight. On iPhones with Apple Intelligence, Unroll can also add a short summary and topic list to each episode, without anything leaving your phone.
