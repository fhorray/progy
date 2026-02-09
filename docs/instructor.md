# Progy Instructor Guide

Welcome to the Progy Instructor Guide. This document is the definitive reference for creating, structuring, and distributing interactive coding courses on the Progy platform. Whether you are building a simple "Hello World" tutorial or a complex microservices architecture course, this guide will walk you through every concept.

---

## 1. Introduction

A Progy Course is more than just a collection of Markdown files. It is an interactive learning environment that combines:

- **Structured Content**: Lessons and modules organized logically.
- **Live Code Execution**: Students run code directly in their environment.
- **Smart Feedback**: Automated tests and diagnostics (Smart Runner Protocol).
- **Rich Media**: Quizzes, diagrams, and explanations.

Progy courses are designed to be **git-native**. Students clone a repository, and the Progy CLI layers interactive content on top of their workspace.

---

## 2. Project Structure

A standard Progy course follows a strict directory structure to ensure the CLI can parse and run it correctly.

```text
my-awesome-course/
├── course.json          # Main configuration file (The "Manifest")
├── progy.toml           # Workspace configuration (Student's state)
├── Dockerfile           # (Optional) For custom environments
├── runner.py            # (Optional) Wrapper script for SRP
├── content/             # (Optional) Static content like images
└── content/           # The core learning material
    ├── 01_intro/        # Module 1
    │   ├── 01_hello/    # Exercise 1
    │   │   ├── main.py  # Starter code
    │   │   ├── README.md# Instructions
    │   │   └── quiz.json# (Optional) Quiz
    │   └── info.toml    # Module metadata
    └── 02_advanced/     # Module 2
        └── ...
```

### Key Files

- **`course.json`**: Defines the runner type, command to execute code, and course metadata.
- **`content/`**: Contains the actual lessons. The folder structure dictates the menu in the UI.
- **`README.md` (inside exercise)**: The lesson text displayed to the student. Supports standard Markdown.
- **`main.*` (inside exercise)**: The entry point file the student will edit.

---

## 3. Course Configuration (`course.json`)

This is the heart of your course. It tells Progy how to run the student's code.

### Schema

```json
{
  "id": "python-mastery",
  "name": "Python Mastery: From Zero to Hero",
  "description": "A comprehensive guide to modern Python.",
  "runner": {
    "type": "process",
    "command": "python3 {{exercise}}"
  },
  "content": {
    "exercises": "exercises"
  }
}
```

### Runner Types

The `runner.type` field determines _where_ and _how_ the code executes.

1.  **`process` (Default)**: Runs directly on the student's host machine.
    - **Pros**: Zero setup, fast.
    - **Cons**: Requires student to have languages installed (e.g., Python, Rust). insecure (runs on host).
    - **Best For**: Simple syntax tutorials, CLI tools.

2.  **`docker-local`**: Runs inside a Docker container on the student's machine.
    - **Pros**: reproducible environment, isolated, supports complex dependencies.
    - **Cons**: Requires Docker Desktop.
    - **Best For**: Web servers, databases, specific compiler versions.

3.  **`docker-compose`**: Runs a multi-container stack.
    - **Pros**: Full integration testing (App + DB + Cache).
    - **Best For**: Full-stack engineering courses.

---

## 4. The Smart Runner Protocol (SRP)

The **Smart Runner Protocol (SRP)** is how the executed code communicates back to the Progy UI. It allows you to show rich results like "✅ 5/5 Tests Passed" instead of just raw text output.

### The Format

The runner (or your code) must print a JSON block wrapped in special markers to `stdout`:

```text
__SRP_BEGIN__
{
  "success": true,
  "summary": "All tests passed!",
  "diagnostics": [],
  "tests": [
    { "name": "Function add(2,2)", "status": "pass" },
    { "name": "Function sub(5,3)", "status": "pass" }
  ],
  "raw": "Output: 4\nOutput: 2"
}
__SRP_END__
```

### Fields

| Field         | Type   | Description                                                                                                                                    |
| ------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `success`     | bool   | **Required.** Did the exercise pass? Controls the green/red status in the UI.                                                                  |
| `summary`     | string | **Required.** A short message displayed prominently (e.g., "All tests passed!", "Query returned 3 rows").                                      |
| `raw`         | string | **Required.** The actual output to show in both "Raw" and "Friendly" views. This is where query results, program output, or error messages go. |
| `tests`       | array  | Optional. List of individual test cases with `name`, `status` ("pass"/"fail"), and optional `message`.                                         |
| `diagnostics` | array  | Optional. Compiler errors or linter warnings with `severity`, `message`, `file`, `line`, and `snippet`.                                        |

### Output Display in UI

The Progy UI displays SRP output in two views:

1. **Friendly View**: Shows:
   - `✅ Success` or `❌ Failed` header
   - The `summary` as a quote block
   - Any `diagnostics` formatted with file/line info
   - Any `tests` with pass/fail icons
   - The `raw` content in a code block under "📋 Output"

2. **Raw View**: Shows only the `raw` field as plain text.

### Best Practices for Good Output

#### 1. Make `summary` Meaningful

```python
# ❌ Bad - Too generic
summary = "Success"

# ✅ Good - Tells student what happened
summary = "Correct! You selected all 3 users."
summary = "Query returned 5 rows (expected 3)"
summary = "Function returned 42 (expected 100)"
```

#### 2. Include Useful Data in `raw`

The `raw` field appears in both views. For data-driven exercises (SQL, API calls), show the actual results:

```python
# SQL Example
raw = f"Columns: {column_names}\n"
for row in rows:
    raw += str(row) + "\n"

# API Example
raw = f"Status: {status_code}\nBody: {json.dumps(response, indent=2)}"

# Computation Example
raw = f"Input: {input_value}\nOutput: {result}\nExpected: {expected}"
```

#### 3. Format Errors Helpfully

When the student's code fails, give them actionable feedback:

```python
# ❌ Bad
raw = str(exception)

# ✅ Good
raw = f"""Error Type: {type(e).__name__}
Message: {str(e)}

Your code:
  {student_code_line}
        ^-- Error occurred here

Hint: Check if the table name is correct.
"""
```

#### 4. Use `tests` for Multi-Step Validation

When you have multiple assertions, use the `tests` array:

```python
response = {
    "success": all_passed,
    "summary": f"{passed_count}/{total_count} tests passed",
    "tests": [
        {"name": "Returns correct type", "status": "pass"},
        {"name": "Handles empty input", "status": "fail", "message": "Expected [] but got None"},
        {"name": "Handles negative numbers", "status": "pass"}
    ],
    "raw": full_output
}
```

#### 5. Use `diagnostics` for Code Issues

For compiler/linter errors with specific locations:

```python
response = {
    "success": False,
    "summary": "Syntax Error",
    "diagnostics": [
        {
            "severity": "error",
            "message": "expected `;` after expression",
            "file": "main.rs",
            "line": 15,
            "snippet": "let x = 5"
        }
    ],
    "raw": full_compiler_output
}
```

### Complete SQL Runner Example

Here's a well-structured runner that produces excellent output:

```python
import sys, os, json, psycopg2

def main():
    file_path = f"/workspace/{sys.argv[1]}"

    try:
        with open(file_path) as f:
            sql = f.read().strip()

        conn = psycopg2.connect(...)
        cur = conn.cursor()
        cur.execute(sql)

        if cur.description:
            columns = [d[0] for d in cur.description]
            rows = cur.fetchall()

            # Build a nice table for raw output
            raw = f"Columns: {columns}\n"
            raw += "-" * 40 + "\n"
            for row in rows:
                raw += " | ".join(str(v) for v in row) + "\n"

            summary = f"Query returned {len(rows)} row(s)"
            success = True
        else:
            raw = "Query executed (no results returned)"
            summary = "Statement executed successfully"
            success = True

    except psycopg2.Error as e:
        success = False
        summary = "SQL Error"
        raw = f"Error Code: {e.pgcode}\nMessage: {e.pgerror}"
    except Exception as e:
        success = False
        summary = "Runner Error"
        raw = str(e)

    print("__SRP_BEGIN__")
    print(json.dumps({"success": success, "summary": summary, "raw": raw}))
    print("__SRP_END__")

if __name__ == "__main__":
    main()
```

---

## 5. Implementing a Custom Runner (The Wrapper Pattern)

**Crucial Concept**: You typically do **not** want students to write `print("__SRP_BEGIN__")` in their code. It's ugly and confusing.

Instead, you use the **Wrapper Pattern**. You create a script (e.g., `runner.py`, `runner.js`) that runs the student's code, captures the output, and prints the SRP JSON.

### Step-by-Step Guide: Docker Local Runner

Let's create a robust Python course using `docker-local`.

#### 1. Configuration (`course.json`)

Point the command to your _wrapper script_, passing the student's file as an argument.

```json
{
  "runner": {
    "type": "docker-local",
    "dockerfile": "Dockerfile",
    "command": "python3 /workspace/runner.py {{exercise}}"
  }
}
```

_Note_: `{{exercise}}` is a placeholder Progy replaces with the path to the student's file (e.g., `exercises/01_hello/main.py`).

#### 2. The `Dockerfile`

Install Python and copy your wrapper script into the image.

```dockerfile
FROM python:3.9-slim

# Set workdir
WORKDIR /workspace

# Copy the wrapper script (which you will create in the root of your repo)
COPY runner.py /workspace/runner.py

# Default command (fallback)
CMD ["python3", "/workspace/runner.py"]
```

#### 3. The Wrapper Script (`runner.py`)

This script does the heavy lifting: executes code -> catches errors -> formats JSON.

```python
import sys
import subprocess
import json

def main():
    # 1. Get the file path from arguments
    if len(sys.argv) < 2:
        print("Error: No file provided.")
        sys.exit(1)

    file_path = sys.argv[1]

    # 2. Run the student's code
    try:
        result = subprocess.run(
            ["python3", file_path],
            capture_output=True, # Capture stdout/stderr
            text=True,
            timeout=5 # Prevent infinite loops
        )

        success = result.returncode == 0
        output = result.stdout + result.stderr

        # 3. Construct SRP JSON
        response = {
            "success": success,
            "summary": "Execution Successful" if success else "Runtime Error",
            "raw": output
        }

    except subprocess.TimeoutExpired:
        response = {
            "success": False,
            "summary": "Timeout: Code took too long to run.",
            "raw": ""
        }

    # 4. Print the Protocol
    print("__SRP_BEGIN__")
    print(json.dumps(response))
    print("__SRP_END__")

if __name__ == "__main__":
    main()
```

#### 4. The Student Experience

The student opens `exercises/01_hello/main.py`.
They see:

```python
print("Hello World")
```

They click "Run".
They see:
**✅ Execution Successful**

```text
Hello World
```

They never see `runner.py` or `__SRP_BEGIN__`. This is the ideal experience.

---

## 6. Advanced: Multi-Container Environments (`docker-compose`)

For full-stack courses (e.g., "Node.js with Redis"), a single container isn't enough. Use `docker-compose`.

### Configuration

```json
{
  "runner": {
    "type": "docker-compose",
    "compose_file": "docker-compose.yml",
    "service_to_run": "app_test"
  }
}
```

- `service_to_run`: The specific service name in compose that runs the tests.

### `docker-compose.yml`

```yaml
version: '3.8'
services:
  redis:
    image: redis:alpine

  app_test:
    build: .
    volumes:
      - .:/workspace # Mount code
    depends_on:
      - redis
    environment:
      REDIS_URL: redis://redis:6379
    command: npm test
```

When the student runs code:

1.  Progy runs `docker compose up redis` (implicitly via `run`).
2.  Progy runs `docker compose run --rm app_test`.
3.  The `app_test` container executes `npm test`.
4.  Progy cleans up with `docker compose down`.

---

## 7. Content Creation Details

### Metadata (`info.toml`)

Place an `info.toml` file in each module folder (e.g., `exercises/01_intro/info.toml`) to order exercises and define titles.

```toml
[module]
title = "Introduction to Python"
message = "Let's start your journey!"

[exercises]
# Order matters!
01_hello = "Hello World"
02_variables = { title = "Variables & Types", xp = 50 }
```

### Quizzes (`quiz.json`)

Place `quiz.json` inside an exercise folder to add a multiple-choice quiz tab.

```json
[
  {
    "question": "Which keyword defines a function in Python?",
    "options": ["func", "def", "function", "define"],
    "answer": 1,
    "explanation": "Python uses 'def' to define functions."
  }
]
```

_Note_: `answer` is the zero-based index of the correct option.

### Markdown Features (`README.md`)

You can use standard Markdown. Progy also supports:

- **Code Blocks**: Syntax highlighted.
- **Images**: `![Alt](image.png)` (place images in `content/` and reference relatively or absolutely).
- **Links**: Links to other exercises? (Planned feature).

---

## 8. CLI Tooling for Instructors

The Progy CLI is your primary tool for creating and testing courses.

### `progy create <name>`

Creates a new course boilerplate from a template.

```bash
progy create my-rust-course --template rust
```

### `progy dev`

Starts the Progy server in **GUEST mode**.

- **GUEST Mode**: No login required, and progress is **not** saved to the cloud. This allows you to test exercises as a student without polluting your own learning progress.
- **Hot-Reload**: The UI automatically reflects changes to `README.md` and content structure.

### `progy test <path>`

Quickly run a specific exercise from the terminal without opening the UI. Perfect for rapid wrapper/test development.

```bash
progy test content/01_intro/01_hello
```

### `progy validate [path]`

Runs static analysis to catch common errors in your course structure, `course.json`, and metadata.

### `progy pack`

Creates a `.progy` distribution file. This is a secure, bundled version of your course ready for students.

```bash
progy pack --out my-course.progy
```

### `progy publish`

(Coming Soon) Workflow for publishing your course to the official Progy registry.

### `progy logout`

Logs you out and clears your authentication token from the local machine.

---

## 9. Scaffolding Content

Instead of creating folders and files manually, use the `progy add` commands to scaffold your course content.

### Shortcut Paths

Scaffold commands use **Shortcut Paths** to identify modules and exercises quickly:

- `1` : Module 01
- `1/2` : Module 01, Exercise 02

### `progy add module <name>`

Adds a new module with automatic numbering.

```bash
$ progy add module basics
✅ Created module: 02_basics
```

### `progy add exercise <module_shortcut> <name>`

Adds a new exercise within a module with automatic numbering.

> [!NOTE]
> This command creates an extensionless file named `exercise`. You **must** rename it to include the correct extension (e.g., `exercise.py`, `exercise.rs`) and add your starter code.

```bash
$ progy add exercise 1 greetings
✅ Created exercise: 02_greetings in 1
```

### `progy add quiz <exercise_shortcut>`

Adds a `quiz.json` template to an exercise.

```bash
$ progy add quiz 1/2
✅ Added quiz to: 1/2
```

---

## 10. Best Practices Checklist

1.  **Isolation**: Always assume the student's machine is messy. Use Docker runners for anything beyond basic syntax.
2.  **Immutability**: The runner script should never modify the student's source file unless explicitly intended (e.g., code formatters).
3.  **Feedback**: Your runner should always catch `stderr` and print it. If the student makes a syntax error, they need to see the compiler output, not just "Failed".
4.  **Timeouts**: Always set a timeout in your runner (e.g., 5-10 seconds). Infinite loops in student code are common and will hang the Docker container.
5.  **Security**:
    - Do not mount sensitive host directories.
    - Run containers as non-root users where possible (use `USER student` in Dockerfile).
    - Disable network (`network: "none"`) unless the exercise explicitly needs API access.

---

## 10. Troubleshooting Common Issues

### "Docker not found"

- **Cause**: Docker Desktop is not running or not in PATH.
- **Fix**: Ensure `docker info` works in the terminal.

### "Volume Mount Failed" (Windows)

- **Cause**: Docker Desktop on Windows sometimes struggles with paths if not using WSL2.
- **Fix**: Recommend students use WSL2 or ensure the drive is shared in Docker settings.

### "SRP JSON Decode Error"

- **Cause**: Your runner script printed something _before_ or _after_ the JSON block, or the JSON is invalid.
- **Fix**: Ensure `__SRP_BEGIN__` is on its own line. Ensure `stdout` from the student code isn't mixing with your JSON. Capture student output into a variable and put it inside the `raw` field of the JSON.

---

## 11. Example: A Complete Rust Course

**`course.json`**

```json
{
  "id": "rustlings-pro",
  "name": "Rustlings Pro",
  "runner": {
    "type": "docker-local",
    "dockerfile": "Dockerfile",
    "command": "/workspace/runner.sh {{exercise}}"
  }
}
```

**`Dockerfile`**

```dockerfile
FROM rust:1.75-slim
WORKDIR /workspace
COPY runner.sh /workspace/runner.sh
RUN chmod +x /workspace/runner.sh
```

**`runner.sh`**

```bash
#!/bin/bash
FILE=$1
# Extract filename without extension
BASENAME=$(basename "$FILE" .rs)

# Compile
rustc "$FILE" -o "/tmp/$BASENAME" 2> /tmp/build_error.log
COMPILE_STATUS=$?

echo "__SRP_BEGIN__"

if [ $COMPILE_STATUS -eq 0 ]; then
    # Run
    OUTPUT=$(/tmp/$BASENAME)
    echo "{\"success\": true, \"summary\": \"Compiled and Ran!\", \"raw\": \"$OUTPUT\"}"
else
    # Build Error
    ERROR=$(cat /tmp/build_error.log)
    # We escape quotes for JSON manually or use a tool like jq
    # Ideally, use a python/node script for the runner to handle JSON escaping safely.
    echo "{\"success\": false, \"summary\": \"Compilation Failed\", \"raw\": \"Build Failed\"}"
fi

echo "__SRP_END__"
```

_(Note: Bash string escaping for JSON is painful. Using Python/Node/Go for the runner script is recommended)._

---

## 12. Complete Course Examples

This section provides complete, copy-paste ready examples for different course types.

---

### Example 1: Python with Docker Local

A simple Python course that runs student code in an isolated Docker container.

**Directory Structure:**

```
python-basics/
├── course.json
├── Dockerfile
├── runner.py
├── SETUP.md
└── content/
    └── 01_intro/
        ├── info.toml
        └── 01_hello/
            ├── exercise.py
            └── README.md
```

**`course.json`**

```json
{
  "id": "python-basics",
  "name": "Python Fundamentals",
  "description": "Learn Python from scratch with hands-on exercises.",
  "runner": {
    "type": "docker-local",
    "dockerfile": "Dockerfile",
    "command": "python3 /workspace/runner.py {{exercise}}",
    "args": [],
    "cwd": "."
  },
  "content": {
    "root": ".",
    "exercises": "content"
  },
  "setup": {
    "checks": [],
    "guide": "SETUP.md"
  }
}
```

**`Dockerfile`**

```dockerfile
FROM python:3.11-slim
WORKDIR /workspace
COPY runner.py /workspace/runner.py
CMD ["python3", "/workspace/runner.py"]
```

**`runner.py`**

```python
import sys
import subprocess
import json
import os

def main():
    if len(sys.argv) < 2:
        print_srp(False, "No file provided", "Usage: runner.py <file>")
        return

    file_path = f"/workspace/{sys.argv[1]}"

    if not os.path.exists(file_path):
        print_srp(False, "File Not Found", f"Could not find: {sys.argv[1]}")
        return

    try:
        result = subprocess.run(
            ["python3", file_path],
            capture_output=True,
            text=True,
            timeout=5
        )

        output = result.stdout + result.stderr
        success = result.returncode == 0
        summary = "Code executed successfully!" if success else f"Error (exit code {result.returncode})"

        print_srp(success, summary, output)

    except subprocess.TimeoutExpired:
        print_srp(False, "Timeout", "Code took too long (>5s)")
    except Exception as e:
        print_srp(False, "Runner Error", str(e))

def print_srp(success, summary, raw):
    print("__SRP_BEGIN__")
    print(json.dumps({"success": success, "summary": summary, "raw": raw}))
    print("__SRP_END__")

if __name__ == "__main__":
    main()
```

**`content/01_intro/01_hello/exercise.py`**

```python
# Print "Hello, World!" to the console
print("Hello, World!")
```

**`content/01_intro/01_hello/README.md`**

```markdown
# Hello World

Welcome to your first Python exercise!

## Task

Modify the code to print `Hello, World!` to the console.

## Hints

- Use the `print()` function
- Strings are enclosed in quotes
```

---

### Example 2: SQL with Docker Compose

A SQL course that spins up a PostgreSQL database for students to practice queries.

**Directory Structure:**

```
sql-basics/
├── course.json
├── docker-compose.yml
├── init.sql
├── SETUP.md
└── tester/
│   ├── Dockerfile
│   └── runner.py
└── content/
    └── 01_select/
        ├── info.toml
        ├── exercise.sql
        ├── README.md
        └── quiz.json
```

**`course.json`**

```json
{
  "id": "sql-basics",
  "name": "SQL Basics with Postgres",
  "description": "Learn SQL by running queries against a real database.",
  "runner": {
    "type": "docker-compose",
    "compose_file": "docker-compose.yml",
    "service_to_run": "tester",
    "command": "python3 /app/runner.py {{exercise}}",
    "args": [],
    "cwd": "."
  },
  "content": {
    "root": ".",
    "exercises": "content"
  },
  "setup": {
    "checks": [],
    "guide": "SETUP.md"
  }
}
```

**`docker-compose.yml`**

```yaml
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: progy
      POSTGRES_PASSWORD: password
      POSTGRES_DB: course_db
    volumes:
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U progy -d course_db']
      interval: 2s
      timeout: 5s
      retries: 5

  tester:
    build: ./tester
    volumes:
      - .:/workspace
    depends_on:
      db:
        condition: service_healthy
    environment:
      DB_HOST: db
      DB_USER: progy
      DB_PASS: password
      DB_NAME: course_db
```

**`init.sql`**

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    role VARCHAR(50)
);

INSERT INTO users (name, role) VALUES ('Alice', 'admin');
INSERT INTO users (name, role) VALUES ('Bob', 'user');
INSERT INTO users (name, role) VALUES ('Charlie', 'user');
```

**`tester/Dockerfile`**

```dockerfile
FROM python:3.9-slim
WORKDIR /app
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*
RUN pip install psycopg2-binary
COPY runner.py /app/runner.py
CMD ["python3", "/app/runner.py"]
```

**`tester/runner.py`**

```python
import sys, os, json, psycopg2

def main():
    file_path = f"/workspace/{sys.argv[1]}"

    db = psycopg2.connect(
        host=os.environ.get("DB_HOST", "db"),
        database=os.environ.get("DB_NAME", "course_db"),
        user=os.environ.get("DB_USER", "progy"),
        password=os.environ.get("DB_PASS", "password")
    )

    try:
        with open(file_path) as f:
            sql = f.read().strip()

        cur = db.cursor()
        cur.execute(sql)

        if cur.description:
            cols = [d[0] for d in cur.description]
            rows = cur.fetchall()
            raw = f"Columns: {cols}\n" + "\n".join(str(r) for r in rows)
            summary = f"Query returned {len(rows)} row(s)"
        else:
            raw = "Statement executed successfully"
            summary = "No rows returned"

        db.commit()
        print_srp(True, summary, raw)

    except Exception as e:
        db.rollback()
        print_srp(False, "SQL Error", str(e))
    finally:
        db.close()

def print_srp(success, summary, raw):
    print("__SRP_BEGIN__")
    print(json.dumps({"success": success, "summary": summary, "raw": raw}))
    print("__SRP_END__")

if __name__ == "__main__":
    main()
```

---

### Example 3: Rust with Docker Local

A Rust course that compiles and runs student code with detailed error feedback.

**Directory Structure:**

```
rust-fundamentals/
├── course.json
├── Dockerfile
├── runner.py
└── content/
    └── 01_basics/
        └── 01_hello/
            ├── exercise.rs
            └── README.md
```

**`course.json`**

```json
{
  "id": "rust-fundamentals",
  "name": "Rust Fundamentals",
  "description": "Learn Rust with interactive exercises.",
  "runner": {
    "type": "docker-local",
    "dockerfile": "Dockerfile",
    "command": "python3 /workspace/runner.py {{exercise}}",
    "args": [],
    "cwd": "."
  },
  "content": {
    "root": ".",
    "exercises": "content"
  },
  "setup": {
    "checks": [],
    "guide": "SETUP.md"
  }
}
```

**`Dockerfile`**

```dockerfile
FROM rust:1.75-slim
RUN apt-get update && apt-get install -y python3 && rm -rf /var/lib/apt/lists/*
WORKDIR /workspace
COPY runner.py /workspace/runner.py
```

**`runner.py`**

```python
import sys, subprocess, json, os, re

def main():
    file_path = f"/workspace/{sys.argv[1]}"
    binary = "/tmp/exercise"

    # Compile
    compile_result = subprocess.run(
        ["rustc", file_path, "-o", binary],
        capture_output=True, text=True
    )

    if compile_result.returncode != 0:
        diagnostics = parse_rust_errors(compile_result.stderr)
        print_srp(False, "Compilation Failed", compile_result.stderr, diagnostics)
        return

    # Run
    try:
        run_result = subprocess.run([binary], capture_output=True, text=True, timeout=5)
        output = run_result.stdout + run_result.stderr
        success = run_result.returncode == 0
        summary = "Program executed successfully!" if success else "Runtime Error"
        print_srp(success, summary, output)
    except subprocess.TimeoutExpired:
        print_srp(False, "Timeout", "Execution exceeded 5 seconds")

def parse_rust_errors(stderr):
    """Extract diagnostics from Rust compiler output"""
    diagnostics = []
    for match in re.finditer(r'error\[E\d+\]: (.+)\n\s+--> (.+):(\d+):\d+', stderr):
        diagnostics.append({
            "severity": "error",
            "message": match.group(1),
            "file": match.group(2),
            "line": int(match.group(3))
        })
    return diagnostics

def print_srp(success, summary, raw, diagnostics=None):
    srp = {"success": success, "summary": summary, "raw": raw}
    if diagnostics:
        srp["diagnostics"] = diagnostics
    print("__SRP_BEGIN__")
    print(json.dumps(srp))
    print("__SRP_END__")

if __name__ == "__main__":
    main()
```

**`content/01_basics/01_hello/exercise.rs`**

```rust
fn main() {
    // TODO: Print "Hello, Rust!" to the console
    println!("Hello, Rust!");
}
```

---

### Example 4: TypeScript with Process Runner

A TypeScript course that runs directly on the student's machine (requires Node.js).

**Directory Structure:**

```
typescript-essentials/
├── course.json
├── package.json
├── tsconfig.json
├── runner.ts
└── content/
    └── 01_types/
        └── 01_basics/
            ├── exercise.ts
            └── README.md
```

**`course.json`**

```json
{
  "id": "typescript-essentials",
  "name": "TypeScript Essentials",
  "description": "Master TypeScript with practical exercises.",
  "runner": {
    "type": "process",
    "command": "npx",
    "args": ["tsx", "runner.ts", "{{exercise}}"],
    "cwd": "."
  },
  "content": {
    "root": ".",
    "exercises": "content"
  },
  "setup": {
    "checks": [
      { "name": "Node.js", "type": "command", "command": "node --version" },
      { "name": "npm", "type": "command", "command": "npm --version" }
    ],
    "guide": "SETUP.md"
  }
}
```

**`package.json`**

```json
{
  "name": "typescript-essentials",
  "type": "module",
  "devDependencies": {
    "tsx": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
```

**`runner.ts`**

```typescript
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';

interface SRPOutput {
  success: boolean;
  summary: string;
  raw: string;
  diagnostics?: {
    severity: string;
    message: string;
    file: string;
    line: number;
  }[];
}

function printSRP(output: SRPOutput) {
  console.log('__SRP_BEGIN__');
  console.log(JSON.stringify(output));
  console.log('__SRP_END__');
}

const filePath = process.argv[2];

if (!filePath || !existsSync(filePath)) {
  printSRP({
    success: false,
    summary: 'File Not Found',
    raw: `Could not find: ${filePath}`,
  });
  process.exit(0);
}

try {
  const output = execSync(`npx tsx ${filePath}`, {
    encoding: 'utf-8',
    timeout: 5000,
  });
  printSRP({
    success: true,
    summary: 'Code executed successfully!',
    raw: output,
  });
} catch (error: any) {
  const stderr = error.stderr || error.stdout || String(error);

  // Parse TypeScript errors
  const diagnostics: SRPOutput['diagnostics'] = [];
  const errorRegex = /(.+)\((\d+),\d+\): error TS\d+: (.+)/g;
  let match;
  while ((match = errorRegex.exec(stderr)) !== null) {
    diagnostics.push({
      severity: 'error',
      file: match[1],
      line: parseInt(match[2]),
      message: match[3],
    });
  }

  printSRP({
    success: false,
    summary: diagnostics.length ? 'TypeScript Error' : 'Runtime Error',
    raw: stderr,
    diagnostics: diagnostics.length ? diagnostics : undefined,
  });
}
```

**`content/01_types/01_basics/exercise.ts`**

```typescript
// Define a variable with the correct type
const greeting: string = 'Hello, TypeScript!';
console.log(greeting);
```

---

## 13. File Naming Conventions

For consistency across all courses:

| Item            | Convention            | Example                                      |
| --------------- | --------------------- | -------------------------------------------- |
| Exercise file   | `exercise.<ext>`      | `exercise.py`, `exercise.rs`, `exercise.sql` |
| Module folder   | `XX_name` (MANDATORY) | `01_intro`, `02_variables`                   |
| Exercise folder | `XX_name` (MANDATORY) | `01_hello`, `02_types`                       |
| Lesson content  | `README.md`           | Always in exercise folder                    |
| Quiz            | `quiz.json`           | Optional, in exercise folder                 |
| Module metadata | `info.toml`           | In module folder                             |
| Course config   | `course.json`         | In root                                      |
| Setup guide     | `SETUP.md`            | In root                                      |

---

## 14. Environment Detection (Instructor vs. Student)

The Progy CLI automatically detects if it is running in a development environment (Instructor) or a learning environment (Student).

| Feature           | Instructor Environment                     | Student Environment                  |
| :---------------- | :----------------------------------------- | :----------------------------------- |
| **Detection**     | Folder contains `course.json` & `content/` | Folder contains `.progy` file        |
| **`progy start`** | Runs as **GUEST** (No cloud sync)          | Runs as **Authenticated** (Saves XP) |
| **`progy dev`**   | Allowed                                    | **Blocked**                          |
| **`progy test`**  | Allowed                                    | **Blocked**                          |

This ensures that students cannot accidentally run development tools and that instructors don't have their test runs saved as actual learning progress.
