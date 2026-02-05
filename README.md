# 🦀 Rust Learning Flow

A comprehensive, interactive Rust learning experience.

## 🌟 Features

- **Interactive TUI**: A terminal-based UI to manage your learning journey.
- **Pre-baked Curriculum**: 20 modules covering everything from Variables to Async Rust.
- **AI-Augmented**: Use the AI assistant for explanations, hints, and custom challenges.
- **Progress Tracking**: Your state is saved automatically.

## 🚀 Getting Started

### Prerequisites

- [Rust](https://rustup.rs/) installed.

### Start Learning

1. **Clone the repo**:
   ```bash
   git clone https://github.com/fhorray/rust-flow
   cd rust-flow
   ```

2. **Launch the Runner**:
   ```bash
   cargo run
   ```
   This opens the **TUI (Text User Interface)**.

3. **Follow the TUI**:
   - The TUI tells you which exercise to work on (e.g., `src/exercises/01_variables/variables1.rs`).
   - Open that file in your editor (VS Code, Zed, etc.).
   - Follow the instructions in the file comments.
   - When ready, press **`r`** in the TUI to Run/Test your code.
   - If it passes, press **`n`** to load the Next exercise.

## 🎮 TUI Controls

| Key | Action |
| --- | --- |
| `r` | **Run** tests for the current exercise |
| `n` | Load the **Next** exercise (if passed) |
| `j` / `k` | Scroll output up/down |
| `q` | **Quit** |

## 🤖 Using the AI

This repository is designed to be used with an AI Editor (like Antigravity, Cursor, or Windsurf).

- **Stuck?** Ask: "Explain why this error is happening."
- **Too Easy?** Ask: "Give me a challenge based on this topic."
- **Code Review**: Ask: "Is this idiomatic Rust?"

## 📚 Curriculum

1. Variables
2. Functions
3. Control Flow
4. Ownership
5. Structs
6. Enums
7. Collections
8. Error Handling
9. Generics
10. Traits
11. Lifetimes
12. Iterators
13. Smart Pointers
14. Concurrency
15. Modules
16. Testing
17. Macros
18. Unsafe
19. Async
20. Final Projects

## 🛠️ Troubleshooting

If the TUI looks weird or exercises aren't loading:

```bash
# Reset progress
rm progress.json

# Resync exercises
cargo run -- sync
```
