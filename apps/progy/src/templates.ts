export interface CourseTemplate {
  courseJson: Object;
  setupMd: string;
  introReadme: string;
  introCode: string; // The content of the main entry file (e.g. main.rs, main.go)
  introFilename: string; // e.g., main.rs
}

export const TEMPLATES: Record<string, CourseTemplate> = {
  rust: {
    courseJson: {
      id: "{{id}}",
      name: "{{name}}",
      runner: {
        command: "cargo",
        args: ["test", "--quiet", "--manifest-path", "./content/{{id}}/Cargo.toml"],
        cwd: "."
      },
      content: {
        root: ".",
        exercises: "content"
      },
      setup: {
        checks: [
          {
            name: "Rust Compiler",
            type: "command",
            command: "rustc --version"
          },
          {
            name: "Cargo Package Manager",
            type: "command",
            command: "cargo --version"
          }
        ],
        guide: "SETUP.md"
      }
    },
    setupMd: `# 🦀 Rust Setup Guide

To run the exercises in this course, you need to have **Rust** installed on your system.

## 🛠️ Installation Steps

### 1. Install Rust via Rustup
Go to [rust-lang.org/tools/install](https://www.rust-lang.org/tools/install) and follow the instructions.

### 2. Verify Installation
Open a terminal and run:
\`\`\`bash
rustc --version
cargo --version
\`\`\`
`,
    introReadme: `# Hello Rust

This is your first exercise.

## Goal
Make the code compile and print "Hello".
`,
    introCode: `fn main() {
    println!("Hello, world!");
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_hello() {
        assert!(true);
    }
}
`,
    introFilename: "main.rs"
  },
  go: {
    courseJson: {
      id: "{{id}}",
      name: "{{name}}",
      runner: {
        command: "go",
        args: ["run", "./runner/main.go", "test", "{{id}}"],
        cwd: "."
      },
      content: {
        root: ".",
        exercises: "content"
      },
      setup: {
        checks: [
          {
            name: "Go Compiler",
            type: "command",
            command: "go version"
          }
        ],
        guide: "SETUP.md"
      }
    },
    setupMd: `# 🐹 Go Setup Guide

To run the exercises in this course, you need to have **Go** installed on your system.

## 🛠️ Installation Steps

### 1. Install Go
Go to [go.dev/dl/](https://go.dev/dl/) and download the installer.

### 2. Verify Installation
Open a terminal and run:
\`\`\`bash
go version
\`\`\`
`,
    introReadme: `# Hello Go

This is your first exercise.

## Goal
Make the code pass the test.
`,
    introCode: `package main

import "fmt"

func Greeting() string {
	return "Hello World"
}

func main() {
	fmt.Println(Greeting())
}
`,
    introFilename: "main.go"
  },
  generic: {
    courseJson: {
      id: "my-course",
      name: "My New Course",
      runner: {
        command: "node",
        args: ["./runner/index.js", "test", "{{id}}"],
        cwd: "."
      },
      content: {
        root: ".",
        exercises: "content"
      },
      setup: {
        checks: [],
        guide: "SETUP.md"
      }
    },
    setupMd: `# Setup Guide

This file helps students set up their environment.

## Prerequisites
- Node.js (v18+)
- [Your Requirement Here]
`,
    introReadme: `# Intro

Welcome to your new course.
`,
    introCode: `console.log("Hello from the generic course!");`,
    introFilename: "hello.js"
  }
};

export const RUNNER_README = `# Progy Runner Guide

This directory contains the "Runner" for your course. The Runner is responsible for executing student code and returning structured feedback to Progy.

## The Contract (Simple Runner Protocol - SRP)

Progy executes your runner command (defined in \`course.json\`) and expects **JSON output** on \`stdout\`.

### Input
The runner receives arguments defined in \`course.json\`. Usually:
- \`test\` (action)
- \`{{id}}\` (exercise ID, e.g. "01_intro/exercise1")

### Output (JSON)
Your runner must print a JSON object to \`stdout\` (surrounded by \`__SRP_BEGIN__\` and \`__SRP_END__\` tags if there is other noise, or just pure JSON).

**Format:**
\`\`\`json
{
  "success": true,   // or false
  "summary": "Tests passed!",
  "diagnostics": [
    {
      "severity": "error", // or "warning"
      "message": "Syntax error on line 5",
      "file": "main.rs",
      "line": 5
    }
  ],
  "tests": [
    { "name": "Test A", "status": "pass", "message": "Good job" },
    { "name": "Test B", "status": "fail", "message": "Expected 10, got 5" }
  ]
}
\`\`\`

### Exit Codes
- **0**: Runner executed successfully (even if tests failed).
- **Non-zero**: Runner crashed or system error.

## Customizing
You can use **any language** for your runner (Python, Rust, Bash, Node.js). Just update \`runner.command\` in \`course.json\`.
`;
