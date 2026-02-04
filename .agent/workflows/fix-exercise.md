---
description: Fix a broken exercise (incorrect tests or impossible to solve)
---

# /fix-exercise Command

Use this when an exercise has incorrect tests or is impossible to solve.

## Usage

```
/fix-exercise <exercise_name>
```

Or just `/fix-exercise` to fix the current active exercise.

## Steps for AI

1. **Identify Exercise**
   - Use provided name or get from `PROGRESS.md`.

2. **Analyze the Problem**
   - Read the exercise file.
   - Understand what the exercise is trying to teach.
   - Identify the issue (broken test, impossible constraint, typo, etc.).

3. **Write Correct Solution**
   - Implement the correct solution in the exercise.
     // turbo
   - Run `cargo run -p runner -- test <exercise_name>`.

4. **Fix Until Tests Pass**
   - If tests fail, fix either the solution OR the tests.
   - Re-run until all tests pass.
   - Document what was wrong.

5. **Restore Exercise State**
   - Remove the solution, leaving `// TODO` markers.
   - Ensure the exercise is now solvable.

6. **Report**
   - Tell user what was fixed.
   - Example: "Fixed test `equal_numbers` - was expecting wrong value."
