---
description: Analyze code for idiomatic Rust patterns
---

# /review Command

This workflow acts as a code reviewer to ensure idiomatic Rust.

## Steps for AI

1. **Linter Check**
   // turbo
   - Run `cargo clippy --bin <exercise_name>`
   - Report any clippy warnings.

2. **Idiomatic Analysis**
   - Read the user's code.
   - Look for non-idiomatic patterns (e.g., C-style loops `for i in 0..len()` instead of iterators).
   - Check naming conventions.

3. **Scoring**
   - Give a "Rustician Score" from 0 to 10.
   - 10/10 requires: Compiles + No Clippy Warnings + Idiomatic Code + Proper Formatting.

4. **Feedback**
   - If not 10/10, suggest specific refactors.
   - "Iterators would be more idiomatic here because..."
   - "You can use pattern matching to simplify this..."
