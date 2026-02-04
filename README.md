# 🦀 Rust Learning

A comprehensive, AI-guided Rust learning curriculum designed to take you from beginner to proficient level.

## 📋 Overview

This project provides a structured approach to learning Rust with:

- **20 progressive modules** covering all essential Rust concepts
- **250+ exercises** with increasing difficulty levels
- **AI-powered guidance** with pedagogy-aware hints and explanations
- **Time tracking** to monitor your progress and study habits
- **Slash commands** for streamlined workflow

## 🚀 Getting Started

### Prerequisites

- [Rust](https://rustup.rs/) installed (stable toolchain)
- [Antigravity Editor](https://antigravity.dev/) with AI assistant enabled
- Basic programming knowledge (any language)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/fhorray/rust-flow
cd rust-flow

# 2. Create your learning branch
git checkout -b learning

# 3. Open in Antigravity Editor and run /next to start!
```

### Starting Fresh

If you want to reset your progress and start over:

```bash
# Go back to main (clean template)
git checkout main

# Create a new learning branch
git checkout -b learning-v2  # or any name you like
```

> 💡 The `main` branch always contains the clean template. Your progress is saved in your learning branch.

### Saving Your Progress to GitHub

If you want to save your progress to your own GitHub repository:

```bash
# 1. Create a new repository on GitHub (empty)

# 2. Point remote to your repository
git remote set-url origin https://github.com/YOUR_USERNAME/my-rust-learning.git

# 3. Push your learning branch
git push -u origin learning
```

## 🏃 How to Study (Quick Start)

Once you have everything set up, follow this simple loop to learn efficiently:

### Step 1: Start a New Exercise

Type `/next` in the chat.

- The AI will generate a new exercise file for you (e.g., `variables1.rs`).
- A timer will start automatically.

### Step 2: Solve the Exercise

Open the generated file and read the instructions inside.

- Fix the code or implement the requested function.
- **Verification**: Run `.\scripts\test.ps1` (or `cargo r -- test <exercise_name>`) in the terminal to verify your solution.
  - ❌ **Fail**: Read the errors, fix the code, run test again.
  - ✅ **Pass**: You are ready to move on!

### Step 3: Complete & Advance

When the tests pass, type `/next` again in the chat.

- The AI will verify your tests passed.
- It scans your completion time and updates your stats.
- It immediately generates the **next exercise** for you.

> **Stuck?** Type `/hint` for a clue or `/why` for a concept explanation.

## �🎮 Commands

### Antigravity Chat Commands

Use these slash commands in the Antigravity chat:

| Command             | Description                                      |
| ------------------- | ------------------------------------------------ |
| `/next`             | Auto-create and start the next exercise          |
| `/next`             | Test Current -> Done -> Create Next (All-in-one) |
| `/run`              | Run the current exercise                         |
| `/hint`             | Get a progressive hint (won't spoil the answer)  |
| `/why`              | Deep conceptual explanation with analogies       |
| `/fix-exercise`     | Fix broken tests or exercises                    |
| `/practice <topic>` | Create an extra practice exercise                |
| `/daily`            | Create a review challenge from past modules      |
| `/redo <module>`    | Reset module and archive old work                |
| `/review`           | Check your code for idiomatic Rust patterns      |
| `/done`             | Stop timer, verify solution, update stats        |
| `/stats`            | View your learning statistics                    |

### Terminal Commands

You can run exercises directly from the terminal without needing the AI:

```powershell
# Run the current active exercise
cargo run

# Test an exercise (validates with #[test] functions)
cargo run -- test variables1

# Run without tests
cargo run -- run variables1

# List all exercises
cargo run -- list
```

### PowerShell Script (Recommended)

For faster workflow without AI tokens:

```powershell
# Test current active exercise
.\scripts\test.ps1

# Test specific exercise
.\scripts\test.ps1 variables1
```

## 📚 Curriculum

### Week 1: Fundamentals (Days 1-7)

| Module | Topic                       | Exercises |
| ------ | --------------------------- | --------- |
| 01     | Variables & Primitive Types | 24        |
| 02     | Functions                   | 12        |
| 03     | Control Flow                | 26        |
| 04     | **Ownership** ⚠️            | 23        |

### Week 2: Data Structures (Days 8-14)

| Module | Topic                    | Exercises |
| ------ | ------------------------ | --------- |
| 05     | Structs                  | 14        |
| 06     | Enums & Pattern Matching | 23        |
| 07     | Collections              | 23        |
| 08     | Error Handling           | 10        |
| 09     | Generics                 | 10        |

### Week 3: Advanced Concepts (Days 15-21)

| Module | Topic                | Exercises |
| ------ | -------------------- | --------- |
| 10     | **Traits** ⚠️        | 25        |
| 11     | **Lifetimes** ⚠️     | 10        |
| 12     | Iterators & Closures | 20        |
| 13     | Smart Pointers       | 14        |

### Week 4: Specialization & Projects (Days 22-30)

| Module | Topic              | Exercises |
| ------ | ------------------ | --------- |
| 14     | Concurrency        | 13        |
| 15     | Modules & Packages | 9         |
| 16     | Testing            | 8         |
| 17     | Macros             | 7         |
| 18     | Unsafe Rust        | 6         |
| 19     | Async/Await        | 10        |
| 20     | Final Projects     | 5         |

> ⚠️ = Critical modules that require extra attention

## 🔄 Typical Workflow

```
┌─────────────────────────────────────────────────────┐
│  1. Run /next                                       │
│     → AI creates the exercise (validated first!)    │
│     → Timer starts automatically                    │
├─────────────────────────────────────────────────────┤
│  2. Work on the exercise                            │
│     → Use .\test.ps1 or cargo run -- test to verify │
│     → Use /hint if stuck                            │
│     → Use /why to understand concepts               │
├─────────────────────────────────────────────────────┤
```

┌─────────────────────────────────────────────────────┐
│ 1. Run /next │
│ → If active exercise: Tests it │
│ → Pass: Marks done, creates next, starts timer│
│ → Fail: Tells you to fix errors │
│ → If no active: Creates next, starts timer │
├─────────────────────────────────────────────────────┤
│ 2. Work on the exercise │
│ → Use .\scripts\test.ps1 or cargo run -p runner -- test │
│ → Use /hint if stuck │
│ → Use /why to understand concepts │
└─────────────────────────────────────────────────────┘

```

```

## 📁 Project Structure

```
rust-learning/
├── AGENT.md              # AI instructor configuration
├── PROGRESS.md           # Your progress tracker (auto-updated)
├── Cargo.toml            # Workspace configuration
├── runner/               # CLI Tool (the "runner")
│   ├── Cargo.toml
│   └── src/main.rs
├── src/                  # Exercise Library (where code lives)
│   ├── lib.rs            # Library entry point (for IDE support)
│   └── exercises/
│       ├── 01_variables/
│       │   ├── mod.rs    # Auto-generated module definition
│       │   ├── variables1.rs
│       │   └── ...
│       └── ...
└── .agent/
    └── workflows/
        └── ...
```

## ⭐ Difficulty Levels

Each exercise is marked with a difficulty level:

| Level      | Meaning                         | Estimated Time |
| ---------- | ------------------------------- | -------------- |
| ⭐         | Basic concept introduction      | 5-10 min       |
| ⭐⭐       | Applying the concept            | 10-15 min      |
| ⭐⭐⭐     | Combining concepts              | 15-20 min      |
| ⭐⭐⭐⭐   | Challenge / Edge cases          | 20-30 min      |
| ⭐⭐⭐⭐⭐ | Advanced real-world application | 30-60 min      |

## 📊 Tracking Progress

Your progress is automatically tracked in `PROGRESS.md`:

- **Time spent** on each exercise
- **Completion status** per module
- **Session history**
- **Statistics** (average time, streak, etc.)

Run `/stats` at any time to see a visual summary.

## 🎓 Learning Tips

1. **Don't skip Ownership (Module 04)** — It's the foundation of Rust
2. **Use `/why` liberally** — Understanding "why" is more valuable than just fixing errors
3. **Take breaks** — Rust's learning curve is steep; spaced repetition helps
4. **Review before `/done`** — Run `/review` to learn idiomatic patterns early
5. **Track your time** — Use the timer to identify concepts that need more practice

## 🤝 Contributing

This curriculum is designed to be extensible. To add new exercises:

1. Read the module's `README.md` for guidelines
2. Follow the exercise template in `AGENT.md`
3. Maintain progressive difficulty within each module

## 📖 Resources

- [The Rust Programming Language Book](https://doc.rust-lang.org/book/)
- [Rust by Example](https://doc.rust-lang.org/rust-by-example/)
- [Rustlings](https://github.com/rust-lang/rustlings) (inspiration for this project)

## 📝 License

MIT License - Feel free to use this for your own learning journey!

---

**Ready to start?** Open this project in Antigravity and run `/next` 🦀
