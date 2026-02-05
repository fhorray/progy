---
description: Explain the 'why' behind a concept or error
---

1.  **Context Analysis**:
    - Read the currently active file (or the file specified by the user).
    - Look for the `// ???:` comment at the bottom of the file (if it exists).
    - Look for the specific compilation error or logic bug the user is facing.

2.  **Pedagogical Explanation**:
    - **Do not just give the fix.**
    - Explain the _underlying Rust concept_ (e.g., Ownership, Borrow Checker rules, Type System).
    - Use analogies if helpful (e.g., "Think of a Reference as a pointer with a guarantee...").
    - Answer the specific `// ???:` question if present.

3.  **Format**:
    - Use a "Concept" section for the theory.
    - Use a "Reason for Error" section for the specific issue.
    - Provide a "Hint" that leads to the solution.

Example Output:

### Concept: Move Semantics

In Rust, when you assign a non-Copy value (like String) to a new variable, ownership is transferred. The old variable becomes invalid.

### Why this fails

You tried to use `s1` after it was moved to `s2`.

### Hint

Since `s2` now owns the data, try printing `s2` instead.
