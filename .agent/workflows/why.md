---
description: Explain the 'why' behind a concept or error
---

# /why Command

This workflow focuses on deep conceptual understanding, ignoring simple fixes.

## Steps for AI

1. **Identify Concept**
   - Look at the user's cursor position or recent error.
   - extract the core Rust concept (e.g., Move Semantics, Lifetimes, Borrowing).

2. **Visual Explanation**
   - Use ASCII art to visualize Memory (Stack vs Heap) if relevant.
   - Use ASCII diagrams for Ownership transfer.

3. **Analogies**
   - Consult `AGENT.md` "Pedagogia" section.
   - Use the specific analogy defined there (e.g., "Library Book" for Borrowing).

4. **Deep Dive**
   - Explain what the compiler is doing "under the hood".
   - Explain the safety guarantee provided by this restriction.

5. **No Fixes**
   - Do NOT provide the code solution. The goal is understanding, not passing the test.
