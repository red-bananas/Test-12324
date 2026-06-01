# Rewarded-ad UX patterns

Concrete, player-positive placements. The test for every one: **would the user tap it even if it weren't an ad?** If yes, it's a reward. If it interrupts, it's spam.

## Universal rules

- Opt-in button labels the reward: `Watch ad → +1 Hint`.
- Triggered at a moment of desire, never mid-action.
- Always a free path remains (cooldown refill, fewer per day, or just play on).
- Cap and cooldown so power users aren't milked.
- "Remove ads" IAP visible; settings honest.

## Reward placement catalog (games)

| Placement | Trigger (moment of desire) | Reward | Free path |
|-----------|---------------------------|--------|-----------|
| **Continue / revive** | After game over | Resume from last state | New game is always free |
| **Undo move** | Player taps Undo when out of free undos | +1 undo | N free undos per game |
| **Hint** | Player stuck, taps Hint | Suggest best move | 1 free hint per game/day |
| **Remove one tile** | Board crowded | Clear a chosen tile | Earned occasionally via play |
| **2× score/coins** | End of a good run | Double this run's reward | 1× always kept |
| **Daily bonus boost** | Daily reward claim | 2–3× the daily coins | Base daily is free |
| **Unlock theme/skin** | Cosmetics screen | Temporary or permanent cosmetic | Some free themes |
| **Skip wait / energy** | Hit a timer/energy gate | Refill now | Timer expires free |
| **Offer wall** | Coin shop | Currency for a video | Earn by playing |

Pick 3–5 for a given game — not all. Cosmetic and "more of a good thing" rewards age best; avoid rewards that trivialize the challenge.

## Interstitial placement (use sparingly)

- After game over → before the **next** game (not the retry the player just chose).
- Every Nth game (e.g., 3rd) or every 2–3 minutes, whichever is rarer.
- Never two ads back-to-back; never after a rewarded video.
- Skip entirely on a player's first session (let them fall in love first).

## Tile Merge — worked monetization map

Model: **rewarded ads primary + Remove-ads IAP + optional tip.** Maps the user's ideas.

| Feature | Type | Detail |
|---------|------|--------|
| Undo | Rewarded | Free undos scale with difficulty (see modes); beyond the allowance = `Watch → +1 Undo` |
| Hint ("best move") | Rewarded | 1 free hint/game on Easy–Medium; ad-gated on Hard/AURA |
| Remove one tile | Rewarded | Crowded-board helper; ad-gated, balance-safe |
| Continue after no moves | Rewarded | `Watch → keep your board` once per run; new game free |
| 2× run score | Rewarded | Offered on the game-over screen |
| Interstitial | Interstitial | After every 3rd completed game, 1/2-min cooldown, skipped on session 1 |
| Remove ads | IAP | $2.99 one-time → disables interstitials, keeps rewarded optional |
| Buy me a coffee | Tip | Quiet link in Settings/About |

### Difficulty modes (user's idea — product, not ad)

| Mode | Free undos | Twist | Rewarded hook |
|------|-----------|-------|---------------|
| Easy | 5 | 5×5 board, slow spawns | Generous free hints; ads rarely needed (build trust) |
| Medium | 3 | Classic 4×4 | Standard undo/hint ad after allowance |
| Hard | 1 | 4×4, faster spawns | Continue + extra-undo ads more tempting |
| **AURA** | 0 | Signature trending mode — timed + special tiles, **daily seed everyone shares** | Every undo is opt-in rewarded; 2× score + share hook for virality |

**Undo design rationale:** generous on Easy so new/casual players feel safe and discover the feature (trust before any ask); scarce on Hard/AURA so the rescue is *genuinely wanted* exactly when stakes are high — that's the moment an opt-in ad feels like a gift, not a tax. Core loop stays free at every difficulty (new game costs nothing).

`AURA` doubles as the **distribution** lever (shareable daily seed) — remember, reach > placement.

## Pre-ship UX checklist

- [ ] Every ad is opt-in OR a capped, between-session interstitial.
- [ ] Each button states the reward before the ad plays.
- [ ] Core loop fully playable with zero ads watched.
- [ ] Frequency caps + cooldowns implemented and tested.
- [ ] No-op fallback when ad SDK unavailable (offline/Expo Go/tests) — free path still works.
- [ ] "Remove ads" present; reduce/again controls honest.
- [ ] First session is ad-light (earn trust before asking attention).
