# /advance Command

This workflow runs the exercise tests, and if all tests pass, marks the exercise as done and moves to the next one.

## Steps for AI

1. **Identify Exercise**
   - Check `PROGRESS.md` for the active exercise.
   - If no active exercise, abort and tell the user to `/start` one.

2. **Run Tests**
   // turbo
   - Run `cargo run -- test <exercise_name>`
   - **Verification Logic**:
     - **Test Result**: All tests must pass (exit code 0).
     - **"I AM NOT DONE" check**: The marker should still be present (user removes it manually when done).

3. **Decision**
   - **If All Tests Pass**:
     - Run `/done` workflow (update progress, stats).
     - Run `/next` workflow (find next exercise, create file, start timer).
     - Output: "✅ All tests passed! Moving to next exercise..."
   - **If Tests Fail**:
     - Show the test failure output.
     - Do NOT run `/done`. Do NOT run `/next`.
     - Suggest: "Need help? Run `/hint` for a hint."

## Usage

User types `/advance` to attempt to move forward.
