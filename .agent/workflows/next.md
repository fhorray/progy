---
description: Advance to the next step (Test -> Done -> Create Next)
---

# /next Command

This is the main command to progress through the curriculum. It handles the entire lifecycle: testing the current exercise, marking it done, and creating the next one.

## Steps for AI

1. **Check Current State**
   - Read `PROGRESS.md`.
   - Is there an active exercise that is NOT marked as completing?

2. **Branch A: Active Exercise Exists**
   // turbo
   - Run `cargo run -p runner -- test <current_exercise>`
   - **If Tests Fail**:
     - Stop and show errors.
     - "❌ Tests failed. Fix them before moving on."
   - **If Tests Pass**:
     - Run `/done` workflow (update stats).
     - Proceed to **Branch B**.

3. **Branch B: Create Next Exercise**
   - Identify the next exercise/module from `PROGRESS.md` and module `README.md`.
   - **Step 1: Create Complete Solution**
     - Generate file with FULL solution + Tests.
   - **Step 2: Sync and Validate**
     // turbo
     - Run `cargo run -p runner -- sync`
     - Run `cargo run -p runner -- test <next_exercise>`
     - If fails, fix self until passes.
   - **Step 3: Break the Exercise**
     - Replace solution with `// TODO` or intentional bugs.
   - **Step 4: Update Progress**
     - Update `PROGRESS.md` (set as active).
   - **Step 5: Handover**
     - "✅ Previous exercise completed!" (if applicable)
     - "🚀 Created <next_exercise>. Time to practice <topic>!"

## Usage

- **User**: "I think I'm done" -> `/next`
- **User**: "Start next one" -> `/next`
