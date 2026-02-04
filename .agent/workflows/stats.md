---
description: Show learning statistics and progress
---

# /stats Command

This command shows the user's learning statistics.

## Usage

```
/stats
```

## Steps for AI

1. Read `PROGRESS.md`

2. Display a summary:

   ```
   📊 Your Rust Learning Stats
   ═══════════════════════════

   📅 Day X of 30

   ✅ Exercises Completed: X / 252 total
   ⏱️ Total Time: Xh Xmin
   📈 Average: X min/exercise
   🔥 Current Streak: X days

   This Week's Progress:
   ━━━━━━━━━━━━━━━━━━━━━
   01_variables:    ████████░░ 8/24 (33%)
   02_functions:    ██████████ 12/12 (100%) ✅
   03_control_flow: ░░░░░░░░░░ 0/26 (0%)

   Keep going! You're doing great! 🦀
   ```

3. If user is behind schedule:

   ```
   ⚠️ You're a bit behind schedule.
   Recommended: Complete X more exercises today to stay on track.
   ```

4. If user is ahead:
   ```
   🎉 You're ahead of schedule! Great work!
   ```
