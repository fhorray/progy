# AI Output Structure for Interactive Explanations

To enable the "click-to-jump" feature in the IDE, the AI explanation system uses a specific output format.

## 1. Context Injection
When requesting an explanation, the system pre-processes the user's code to include line numbers.

**Input to AI:**
```text
### Student's Code Context:
1: fn main() {
2:     let name = "Progy";
3:     println!("Hello, {}!", name);
4: }
```

## 2. AI Response Guidelines
The AI is instructed to use a specific markdown link format when referencing code elements.

**Instruction:**
> Use `[label](line:NUMBER)` format when referencing specific lines of code.

**Example AI Output:**
```markdown
The variable `name` is defined on [line 2](line:2) and is used in the `println!` macro on [line 3](line:3).
```

## 3. Frontend Rendering
The frontend `MarkdownRenderer` component intercepts links starting with `line:`.

-   **Detection**: Checks if `href` starts with `line:`.
-   **Action**: Prevents default navigation and triggers a `POST` request to `/api/ide/open` with `{ path: current_file_path, line: parsed_line_number }`.
-   **Visual**: Renders as a clickable link or button, styled to indicate an interactive "jump" action.

## 4. Backend Handler (`/api/ide/open`)
The local API server handles the open request.

-   **Command**: Executes `code -g <path>:<line>` (VS Code CLI).
-   **Result**: VS Code opens the file and scrolls to the specific line.
