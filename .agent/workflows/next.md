---
description: Automatically setup and start the next exercise
---

# /next Command

This workflow automates the transition to the next exercise.

## Steps for AI

1. **Analyze Progress**
   - Read `PROGRESS.md` to find the last completed exercise.
   - Determine the module and the next exercise number.
   - If starting a new module, read the module's `README.md` first.

2. **Create Exercise WITH Solution First**
   - Generate the exercise `.rs` file WITH the complete working solution.
   - Include all tests as per the template in `AGENT.md`.
   - **IMPORTANT**: The solution must be fully implemented at this stage.

3. **Validate Tests**
   // turbo
   - Run `cargo run -- test <exercise_name>` to verify tests pass.
   - **If tests FAIL**: Fix the code/tests and re-run until they pass.
   - **If tests PASS**: Proceed to step 4.

4. **Break the Exercise**
   - Remove or comment out the solution, leaving `// TODO` markers.
   - For "fix compilation" exercises: introduce the intentional bug.
   - For "implement function" exercises: replace body with `// TODO`.

5. **Start Timer**
   - Update `PROGRESS.md` with the new active exercise.

6. **Handover**
   - Present the exercise to the user (do NOT open file in IDE).
   - Brief intro to the concept.
   - Message: "All set! Time to practice <concept>. Go!"

## Why Validate First?

This ensures the AI doesn't create broken tests. By writing and validating
the solution first, we guarantee the exercise is solvable.
