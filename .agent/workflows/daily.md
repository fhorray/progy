---
description: Create a daily review challenge from past modules
---

# /daily Command

Spaced repetition system: Pick a concept from a _completed_ module and generate a review exercise.

## Steps for AI

1. **Analyze History**
   - Read `PROGRESS.md` to find completed modules.
   - Pick one random completed module (prefer older ones for spaced repetition).
   - Pick one key concept from that module's `README.md`.

2. **Generate Challenge**
   - Create `src/practice/daily_<YYYYMMDD>.rs`.
   - Create an exercise that tests that concept _from memory_.
   - Description: "Daily Challenge: Re-implement <concept> without looking at docs first."

3. **Start**
   - Invoke `/start daily_<YYYYMMDD>`.

4. **Motivation**
   - "Good morning! Time for your daily brain warmup."
   - "Topic: **<concept>** (from Module <module>)."
