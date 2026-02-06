# 🏃 Smart Runners: Architecture & Implementation

This document details the architecture for the **Smart Runners** system in `prog`, specifically focusing on **Docker Sandboxing** (for heavy/complex environments) and **WebAssembly** (for lightweight/client-side execution).

---

## 🛑 The Problem

Currently, the `prog` tool relies on the student's local environment. This creates friction:
1.  **"It works on my machine"**: The student might have a different version of Go/Rust/Node installed than the instructor intended.
2.  **Security Risks**: A student could write `rm -rf /` in an exercise and damage their own system.
3.  **Setup Fatigue**: To learn "Kubernetes", a student shouldn't have to install a full cluster locally first.

**Solution:** Abstract the execution environment using Docker and Wasm.

---

## 🐳 Feature 1: Docker Runner

Use ephemeral Docker containers to execute student code in a controlled, isolated environment.

### 🎓 Student Flow
1.  User initializes a course: `prog init --lang python-data-science`.
2.  The UI opens. The exercise asks to "Read a CSV and plot a graph".
3.  Student writes code.
4.  Student clicks **"Run"**.
5.  *Behind the scenes*: The code runs inside a Docker container that already has `pandas`, `numpy`, and `matplotlib` installed.
6.  Student sees the result (text output + generated image) instantly.
    *   **Benefit**: The student **never installed Python or Pandas**.

### 👨‍🏫 Instructor Flow
1.  Instructor creates a standard `Dockerfile` for the course.
    ```dockerfile
    FROM python:3.11-slim
    RUN pip install pandas matplotlib
    WORKDIR /app
    ```
2.  Instructor builds and pushes the image: `docker push my-org/python-course:v1`.
3.  Instructor configures `course.json`:
    ```json
    {
      "runner": {
        "type": "docker",
        "image": "my-org/python-course:v1",
        "command": "python test_runner.py {{exercise}}"
      }
    }
    ```

### 🛠️ Technical Implementation

**Backend Logic (`apps/prog/src/backend/runner/docker.ts`)**:

When the server receives a run request:

1.  **Volume Mount**: Create a temporary directory on the host machine (`/tmp/prog-123/`).
    *   Write `student_code.py` to this directory.
    *   Write `test_file.py` (from lessons) to this directory.
2.  **Spawn Container**:
    ```typescript
    const child = spawn("docker", [
      "run",
      "--rm",                         // Delete container after run
      "--network", "none",            // No internet (optional security)
      "--memory", "512m",             // Limit RAM
      "-v", "/tmp/prog-123:/app",     // Mount code
      "my-org/python-course:v1",      // Image
      "python", "test_file.py"        // Command
    ]);
    ```
3.  **Stream Output**: Pipe `stdout` and `stderr` back to the frontend via WebSocket or HTTP response.
4.  **Cleanup**: Delete `/tmp/prog-123/`.

**Security Considerations:**
*   Use `--read-only` root filesystem where possible.
*   Set strict CPU/Memory limits.
*   Disable network access unless the lesson explicitly teaches networking.

---

## ⚡ Feature 2: WebAssembly (Wasm) Runner

Compile the language runtime or the exercise runner to WebAssembly to execute code **directly in the browser**.

### 🎓 Student Flow
1.  User opens `prog` (even potentially purely online, without a CLI).
2.  Student writes a simple Rust or Go algorithm.
3.  Student clicks **"Run"**.
4.  The code runs **instantly** (milliseconds).
    *   **Benefit**: Zero latency (no server round-trip).
    *   **Benefit**: Works offline.

### 👨‍🏫 Instructor Flow
1.  Instructor chooses a language that supports Wasm (Rust, Go, C, Python via Pyodide).
2.  Instructor configures `course.json`:
    ```json
    {
      "runner": {
        "type": "wasm",
        "url": "/runners/rust-playground.wasm"
      }
    }
    ```

### 🛠️ Technical Implementation

**Architecture:**

1.  **The Compilation Step (The Tricky Part)**:
    *   *Option A (Client-side)*: Some languages (like Python via Pyodide) interpret directly in Wasm. No compilation needed.
    *   *Option B (Server-side Compile)*: For Rust/Go, the `prog` server (local) acts as the compiler.
        *   Student clicks Run -> Server runs `rustc --target wasm32-unknown-unknown` -> Returns `.wasm` binary -> Browser runs it.

**Browser Implementation (React):**

```typescript
// Frontend Runner Component
async function runWasm(wasmBinary: ArrayBuffer) {
  const go = new Go(); // JS glue code provided by Go runtime
  const { instance } = await WebAssembly.instantiate(wasmBinary, go.importObject);

  // Capture stdout
  let output = "";
  const originalLog = console.log;
  console.log = (msg) => output += msg + "\n";

  await go.run(instance);

  console.log = originalLog; // Restore
  return output;
}
```

**Why this solves the problem:**
*   **Rust Course**: Instead of requiring `rustup` locally, the `prog` CLI can bundle a standardized toolchain or use a Wasm-based compiler (like the one used in Rust Playground) to allow students to learn basic syntax with zero installation.

---

## ⚔️ Comparison: When to use which?

| Feature | Best For... | Pros | Cons |
| :--- | :--- | :--- | :--- |
| **Local (Current)** | Simple scripts, OS interaction | Easiest to debug | Environment dependency hell |
| **Docker** | Data Science, DevOps, Databases | Perfect isolation, consistent env | Slower startup, requires Docker |
| **Wasm** | Algorithms, Syntax, Logic | Fastest, Secure, Offline-capable | Harder to setup, limited system access |

## 🚀 Recommended Roadmap

1.  **Phase 1 (Now)**: Stick to **Local Execution** (current implementation) but add `course.json` checks (e.g., "Check if `go` is installed").
2.  **Phase 2**: Implement **Docker Runner** for "Advanced Courses" (e.g., Cloudflare, Kubernetes).
    *   This is the highest value for complex topics.
3.  **Phase 3**: Experiment with **Wasm** for "Introductory Courses".
    *   Great for a "Try Rust in 5 minutes" experience.
