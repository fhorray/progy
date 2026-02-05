---
description: Create a random practice exercise for a specific topic
---

# /practice Command

Generates a new, isolated practice exercise for a specific topic, without affecting the main curriculum progress.

## Steps for AI

1. **Understand Topic**
   - Identify the requested topic (e.g., "structs", "lifetimes", "match").
   - If user doesn't specify, look at the last completed module in `PROGRESS.md`.

2. **Generate Content**
   - Create a unique filename: `src/practice/practice_<timestamp>_<topic>.rs`
   - Use the standard exercise template from `AGENTS.md`.
   - **Crucial**: The exercise must be _different_ from the curriculum ones. Focus on a specific edge case or common confusion point for that topic.
   - Add comments explaining _why_ this specific practice is useful.

3. **Sync Configuration**
   // turbo
   - Run `cargo run -p runner -- sync` to ensure IDE support for the new practice file.

4. **Set Active**
   - Tell the user the exercise is created.
   - Invoke `/start <filename>` to track it.

5. **Instructions**
   - "Created a practice exercise for **<topic>**!"
   - "Test it with: `cargo run -p runner -- test practice_<timestamp>_<topic>`"
