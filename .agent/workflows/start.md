---
description: Start tracking time for an exercise
---

# /start Command

This command starts the timer for an exercise.

## Usage

```
/start <exercise_name>
```

Example: `/start variables1`

## Steps for AI

1. Read `PROGRESS.md` and check if there's already an active session
   - If there is, warn the user and ask if they want to `/done` the previous one first

2. Update the `Active Session` section in `PROGRESS.md`:

   ```json
   {
     "active": true,
     "exercise": "<exercise_name>",
     "started_at": "<current ISO timestamp>"
   }
   ```

3. Update `Current Exercise` to `<exercise_name>`

4. Confirm to the user:

   ```
   ⏱️ Timer started for `<exercise_name>`
   Started at: HH:MM

   When you're done, run `/done` to stop the timer.
   Good luck! 🦀
   ```

5. If the exercise file doesn't exist yet, ask if the user wants you to create it first
