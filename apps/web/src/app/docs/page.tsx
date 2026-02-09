"use client"

import * as React from "react"
import { BookOpen, Terminal, GraduationCap, Code2, Settings, FileJson, Play, Zap, BrainCircuit, CheckCircle, ChevronRight, X, AlertTriangle, Lightbulb } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

// --- Content Components ---

function IntroContent({ setActiveId }: { setActiveId: (id: string) => void }) {
  return (
    <div className="space-y-6 py-10 animate-in fade-in duration-500">
      <h1 className="text-4xl font-bold tracking-tight">Progy Documentation</h1>
      <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
        Welcome to the official documentation for Progy, the interactive coding platform that helps you learn by doing.
        Progy combines a powerful CLI with a rich web-based learning environment.
      </p>

      <div className="grid gap-6 md:grid-cols-2 mt-8">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col items-start cursor-pointer group" onClick={() => setActiveId('student-tutorial')}>
          <div className="p-2 rounded-lg bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold mb-2">Student Tutorial</h3>
          <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
            New to Progy? Learn how to start a course, run tests, and use the AI helper in less than 5 minutes.
          </p>
          <div className="mt-auto flex items-center text-sm font-medium text-primary">
            Start Learning <ChevronRight className="ml-1 w-4 h-4" />
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col items-start cursor-pointer group" onClick={() => setActiveId('instructor-create')}>
          <div className="p-2 rounded-lg bg-secondary text-secondary-foreground mb-4 group-hover:scale-110 transition-transform">
             <Code2 className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold mb-2">Instructor Guide</h3>
          <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
            Want to build your own course? Learn about the course structure, runners, and how to publish.
          </p>
          <div className="mt-auto flex items-center text-sm font-medium text-foreground">
            Create Course <ChevronRight className="ml-1 w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  )
}

function InstallationContent() {
  return (
    <div className="space-y-6 py-6 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold tracking-tight">Installation</h1>
      <p className="text-lg text-muted-foreground">
        Getting started with Progy takes just a few seconds.
      </p>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Prerequisites</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>
            <strong className="text-foreground">Bun</strong> (v1.0.0 or later) is required to run the Progy CLI.
          </li>
          <li>
            <strong className="text-foreground">Git</strong> must be installed and available in your path.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Install via Bun</h2>
        <div className="bg-muted p-4 rounded-lg font-mono text-sm border overflow-x-auto">
          bun install -g progy
        </div>
        <p className="text-muted-foreground">
          Or run it directly using <code>bunx</code>:
        </p>
        <div className="bg-muted p-4 rounded-lg font-mono text-sm border overflow-x-auto">
          bunx progy --help
        </div>
      </section>
    </div>
  )
}

function StudentTutorialContent() {
    return (
      <div className="space-y-10 py-6 animate-in fade-in duration-500 max-w-3xl">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary text-sm font-bold uppercase tracking-widest">
            <Zap className="w-4 h-4" /> Quick Start
          </div>
          <h1 className="text-4xl font-black tracking-tight">Interactive Tutorial</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Master the Progy interface. Learn how to verify your code, get AI assistance, and navigate the platform.
          </p>
        </div>

        <div className="grid gap-12 relative border-l-2 border-primary/20 pl-8 ml-4">
          {/* Step 1 */}
          <div className="relative space-y-4">
            <div className="absolute -left-[41px] top-0 w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center text-[10px] font-bold text-primary">
                1
            </div>
            <h3 className="text-xl font-bold">The Workspace</h3>
            <p className="text-muted-foreground">
                When you run <code>progy start</code>, your browser opens the Progy Workspace. This is your command center.
            </p>
            <div className="rounded-xl border bg-muted/30 p-2 shadow-sm">
                 <div className="aspect-[16/9] bg-gradient-to-br from-neutral-900 to-black rounded-lg flex items-center justify-center relative overflow-hidden group">
                     {/* Placeholder for Workspace Screenshot */}
                    <div className="absolute inset-x-0 top-0 h-8 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2">
                         <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                         <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                         <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                    </div>
                    <div className="flex gap-4 w-full h-full pt-12 px-4 pb-4">
                        <div className="w-1/4 bg-white/5 rounded border border-white/5 p-4 hidden md:block">
                            <div className="w-20 h-3 bg-white/10 rounded mb-4"></div>
                            <div className="space-y-2">
                                <div className="w-full h-2 bg-white/5 rounded"></div>
                                <div className="w-2/3 h-2 bg-white/5 rounded"></div>
                            </div>
                        </div>
                        <div className="flex-1 bg-white/5 rounded border border-white/5 p-4 font-mono text-xs text-muted-foreground">
                            <span className="text-blue-400">fn</span> main() {'{'} <br/>
                            &nbsp;&nbsp; println!(<span className="text-green-400">&quot;Hello World&quot;</span>); <br/>
                            {'}'}
                        </div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="bg-background/80 text-foreground px-3 py-1 rounded-full text-xs font-bold border shadow-lg">Editor View</span>
                    </div>
                 </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative space-y-4">
             <div className="absolute -left-[41px] top-0 w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center text-[10px] font-bold text-primary">
                2
            </div>
            <h3 className="text-xl font-bold">Running Tests</h3>
            <p className="text-muted-foreground">
                After editing your code (e.g., <code>main.rs</code>), save the file. Progy automatically detects changes.
                Click the <span className="text-foreground font-bold bg-muted px-1.5 py-0.5 rounded text-xs">Run Tests</span> button or press <kbd className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono border">Cmd+Enter</kbd> to verify your solution.
            </p>
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 p-4 rounded-lg border bg-card flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-green-500 font-bold text-sm">
                        <CheckCircle className="w-4 h-4" /> Tests Passed
                    </div>
                    <p className="text-xs text-muted-foreground">
                        If your code is correct, you&apos;ll see a green success message and can proceed to the next lesson.
                    </p>
                </div>
                <div className="flex-1 p-4 rounded-lg border bg-card flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
                        <X className="w-4 h-4" /> Compilation Error
                    </div>
                    <p className="text-xs text-muted-foreground">
                        If there are errors, Progy provides a detailed breakdown of what went wrong.
                    </p>
                </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative space-y-4">
            <div className="absolute -left-[41px] top-0 w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center text-[10px] font-bold text-primary">
                3
            </div>
            <h3 className="text-xl font-bold flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-purple-500" />
                AI Assistance
            </h3>
            <p className="text-muted-foreground">
                Stuck? Progy&apos;s AI Mentor is context-aware. It knows the exercise constraints and your current code.
            </p>
            <ul className="space-y-3">
                <li className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <Zap className="w-4 h-4 text-purple-500 mt-1 shrink-0" />
                    <div>
                        <span className="font-bold text-sm block mb-1">Get Hint</span>
                        <p className="text-xs text-muted-foreground">Provides a subtle nudge in the right direction without revealing the answer.</p>
                    </div>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <BookOpen className="w-4 h-4 text-blue-500 mt-1 shrink-0" />
                    <div>
                        <span className="font-bold text-sm block mb-1">Explain Code</span>
                        <p className="text-xs text-muted-foreground">Highlights complex syntax or logic in your code and explains it in plain English.</p>
                    </div>
                </li>
            </ul>
          </div>
        </div>
      </div>
    )
}

function StudentCLIContent() {
  return (
    <div className="space-y-6 py-6 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold tracking-tight">CLI Reference</h1>
      <p className="text-lg text-muted-foreground">
        A quick reference for the most common commands you&apos;ll use as a student.
      </p>

      <div className="grid gap-4">
        {[
          { cmd: "progy init", desc: "Initialize a new course in the current directory." },
          { cmd: "progy start", desc: "Start the local server and open the UI." },
          { cmd: "progy save", desc: "Save your progress to the cloud (Git push)." },
          { cmd: "progy sync", desc: "Pull official updates and sync your progress." },
          { cmd: "progy reset <file>", desc: "Restore a file to its original state." },
        ].map((item) => (
          <div key={item.cmd} className="flex flex-col gap-1 p-4 border rounded-lg bg-card/50">
            <code className="font-mono font-semibold text-primary">{item.cmd}</code>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function InstructorCreateContent() {
  return (
    <div className="space-y-6 py-6 animate-in fade-in duration-500 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight">Creating a Course</h1>
      <p className="text-lg text-muted-foreground">
        Progy provides a streamlined workflow for authors. Instead of manually creating files, you start with a proven template.
      </p>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold">1. Scaffold a New Project</h2>
        <p className="text-muted-foreground">
          Use the CLI to generate a new directory with the necessary configuration. You can choose from supported templates like <code>rust</code>, <code>go</code>, or <code>typescript</code>.
        </p>
        <div className="rounded-lg border bg-black/50 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 border-b bg-white/5">
                <Terminal className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-mono">Terminal</span>
            </div>
            <div className="p-4 font-mono text-sm space-y-2">
                <div className="flex gap-2">
                    <span className="text-green-500">$</span>
                    <span>progy create-course --name <span className="text-yellow-400">rustlings-remix</span> --course <span className="text-blue-400">rust</span></span>
                </div>
                <div className="text-muted-foreground">
                    [INFO] Creating course in rustlings-remix...<br/>
                    [INFO] Template: rust<br/>
                    [SUCCESS] Created course.json<br/>
                    [SUCCESS] Created runner/README.md<br/>
                    [SUCCESS] Created content/01_intro/main.rs<br/>
                    <br/>
                    <span className="text-foreground">Done! To start developing:</span><br/>
                    cd rustlings-remix<br/>
                    progy dev
                </div>
            </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold">2. Live Development</h2>
        <p className="text-muted-foreground">
          The <code>dev</code> command starts a local instance of the Progy UI that watches your files. This allows you to verify exercises as you write them.
        </p>
        <div className="bg-muted p-4 rounded-lg font-mono text-sm border overflow-x-auto">
          progy dev
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold">3. Validate & Pack</h2>
        <p className="text-muted-foreground">
          Before publishing to GitHub or distributing, run the validator to catch common errors (like missing descriptions or broken JSON).
        </p>
        <div className="bg-muted p-4 rounded-lg font-mono text-sm border overflow-x-auto space-y-2">
          <div>progy validate</div>
          <div className="text-green-500">✅ Course is Valid: Rust Mastery (rustlings-remix)</div>
        </div>
        <p className="text-muted-foreground text-sm mt-2">
            Then pack it into a portable file if you aren&apos;t using Git distribution:
        </p>
        <div className="bg-muted p-4 rounded-lg font-mono text-sm border overflow-x-auto">
          progy pack --out my-course.progy
        </div>
      </section>
    </div>
  )
}

function InstructorStructureContent() {
  return (
    <div className="space-y-8 py-6 animate-in fade-in duration-500 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight">Course Structure &amp; Schema</h1>
      <p className="text-lg text-muted-foreground">
        A deep dive into how Progy courses are organized and configured.
      </p>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Directory Layout</h2>
        <p className="text-muted-foreground">
            Progy expects a specific folder hierarchy. The <code>content</code> directory is where your modules live.
        </p>
        <pre className="bg-muted p-6 rounded-xl font-mono text-sm overflow-x-auto border">
{`my-course/
├── course.json          # ⚙️ Global Configuration
├── SETUP.md             # 📄 Installation guide for students
├── .gitignore           # 🙈 Should ignore node_modules, target/, etc.
├── runner/              # 🏃 Custom Runner Logic (Optional)
│   ├── Dockerfile
│   └── index.ts
└── content/             # 📚 The Curriculum
    ├── 01_intro/        # Module 1 (Folder Name = ID)
    │   ├── README.md    # The instructions shown in the UI
    │   └── main.rs      # The broken code file
    └── 02_variables/    # Module 2
        ├── README.md
        └── main.rs`}
        </pre>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Configuration: course.json</h2>
        <p className="text-muted-foreground">
            This file controls how Progy executes code and displays metadata.
        </p>
        <div className="rounded-xl border bg-black/50 overflow-hidden font-mono text-sm">
            <div className="p-4 overflow-x-auto">
                <span className="text-yellow-500">{"{"}</span><br/>
                &nbsp;&nbsp;<span className="text-blue-400">&quot;id&quot;</span>: <span className="text-green-400">&quot;rust-101&quot;</span>,<br/>
                &nbsp;&nbsp;<span className="text-blue-400">&quot;name&quot;</span>: <span className="text-green-400">&quot;Rust Fundamentals&quot;</span>,<br/>
                &nbsp;&nbsp;<span className="text-blue-400">&quot;description&quot;</span>: <span className="text-green-400">&quot;Zero to Hero in Rust.&quot;</span>,<br/>
                &nbsp;&nbsp;<span className="text-gray-500">{`// The command Progy runs when the user clicks "Run Tests"`}</span><br/>
                &nbsp;&nbsp;<span className="text-blue-400">&quot;runner&quot;</span>: <span className="text-yellow-500">{"{"}</span><br/>
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">&quot;command&quot;</span>: <span className="text-green-400">&quot;cargo&quot;</span>,<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-gray-500">{`// {{id}} is replaced by the current lesson path (e.g. content/01_intro)`}</span><br/>
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">&quot;args&quot;</span>: [<span className="text-green-400">&quot;test&quot;</span>, <span className="text-green-400">&quot;--manifest-path&quot;</span>, <span className="text-green-400">&quot;./{"{{id}}"}/Cargo.toml&quot;</span>],<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">&quot;cwd&quot;</span>: <span className="text-green-400">&quot;.&quot;</span><br/>
                &nbsp;&nbsp;<span className="text-yellow-500">{"}"}</span>,<br/>
                &nbsp;&nbsp;<span className="text-blue-400">&quot;content&quot;</span>: <span className="text-green-400">&quot;content&quot;</span> <span className="text-gray-500">{`// Directory containing lessons`}</span><br/>
                <span className="text-yellow-500">{"}"}</span>
            </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Exercise Metadata</h2>
        <p className="text-muted-foreground">
            Every exercise code file (e.g., <code>main.rs</code>, <code>index.js</code>) <strong>must</strong> start with a metadata header. Progy uses this to show difficulty, topic tags, and hints in the UI.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <h4 className="text-sm font-bold text-foreground">Rust Example</h4>
                <div className="bg-muted p-4 rounded-lg font-mono text-xs border">
                    <span className="text-gray-500">{'// Difficulty: Easy'}</span><br/>
                    <span className="text-gray-500">{'// Topic: Variables'}</span><br/>
                    <span className="text-gray-500">{'// Description: Fix the immutability error.'}</span><br/>
                    <span className="text-gray-500">{'// Hints: Use the &apos;mut&apos; keyword.'}</span><br/>
                    <br/>
                    <span className="text-blue-500">fn</span> <span className="text-yellow-500">main</span>() {'{'}<br/>
                    &nbsp;&nbsp;<span className="text-gray-500">{'// ...'}</span><br/>
                    {'}'}
                </div>
            </div>
            <div className="space-y-2">
                <h4 className="text-sm font-bold text-foreground">JavaScript Example</h4>
                <div className="bg-muted p-4 rounded-lg font-mono text-xs border">
                    <span className="text-gray-500">{'// Difficulty: Medium'}</span><br/>
                    <span className="text-gray-500">{'// Topic: Async/Await'}</span><br/>
                    <span className="text-gray-500">{'// Description: Fetch data from the API.'}</span><br/>
                    <span className="text-gray-500">{'// Hints: Remember to await the fetch call.'}</span><br/>
                    <br/>
                    <span className="text-blue-500">async function</span> <span className="text-yellow-500">getData</span>() {'{'}<br/>
                    &nbsp;&nbsp;<span className="text-gray-500">{'// ...'}</span><br/>
                    {'}'}
                </div>
            </div>
        </div>
      </section>
    </div>
  )
}

function InstructorRunnersContent() {
  return (
    <div className="space-y-8 py-6 animate-in fade-in duration-500 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight">Custom Runners</h1>
      <p className="text-lg text-muted-foreground">
        Runners connect student code to the Progy UI. They can be written in any language (Node.js, Python, Rust, Bash).
      </p>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">The Protocol (SRP)</h2>
        <p className="text-muted-foreground">
          Progy executes your runner command and captures <code>stdout</code>. Your runner <strong>must</strong> print a JSON object wrapped in specific markers.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg border">
                <h4 className="font-bold text-sm mb-2">Input (from Progy)</h4>
                <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4">
                    <li><strong>Command:</strong> Defined in <code>course.json</code></li>
                    <li><strong>Arguments:</strong> <code>{"{{id}}"}</code> is replaced with the exercise path.</li>
                    <li><strong>Environment:</strong> Inherits user&apos;s shell env.</li>
                </ul>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border">
                <h4 className="font-bold text-sm mb-2">Output (to stdout)</h4>
                <div className="font-mono text-xs text-muted-foreground">
                    ...arbitrary logs...<br/>
                    <span className="text-primary font-bold">__SRP_BEGIN__</span><br/>
                    {`{ "success": true, "summary": "Passed", "tests": [...] }`}<br/>
                    <span className="text-primary font-bold">__SRP_END__</span><br/>
                    ...arbitrary logs...
                </div>
            </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Example: Node.js Runner</h2>
        <p className="text-muted-foreground">
            A simple script that runs a student&apos;s file and checks the output.
        </p>
        <pre className="bg-muted p-6 rounded-xl font-mono text-xs overflow-x-auto border text-foreground">
{`const { spawn } = require("child_process");
const { join } = require("path");

// 1. Get the exercise path from arguments
const exerciseDir = process.argv[2];
const targetFile = join(exerciseDir, "index.js");

// 2. Prepare the result object
const result = {
    success: false,
    summary: "Running...",
    tests: []
};

// 3. Run the student's code
const child = spawn("node", [targetFile]);

let output = "";
child.stdout.on("data", (d) => output += d.toString());

child.on("close", (code) => {
    // 4. Validate Logic (Did it print "Hello"?)
    if (output.trim() === "Hello") {
        result.success = true;
        result.summary = "Great job!";
        result.tests.push({ name: "Output Check", status: "pass" });
    } else {
        result.success = false;
        result.summary = "Output mismatch";
        result.tests.push({
            name: "Output Check",
            status: "fail",
            message: \`Expected "Hello", got "\${output.trim()}"\`
        });
    }

    // 5. Print Result for Progy
    console.log("__SRP_BEGIN__");
    console.log(JSON.stringify(result));
    console.log("__SRP_END__");
});`}
        </pre>
      </section>
    </div>
  )
}

function InstructorBestPracticesContent() {
    return (
        <div className="space-y-8 py-6 animate-in fade-in duration-500 max-w-4xl">
            <h1 className="text-3xl font-bold tracking-tight">Best Practices</h1>
            <p className="text-lg text-muted-foreground">
                Creating a frustration-free learning experience requires attention to detail.
            </p>

            <section className="space-y-6">
                <div className="flex gap-4 items-start">
                    <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold mb-2">Error Messages Matter</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                            The student&apos;s first interaction with your code is usually a compilation error. Make sure it&apos;s a <em>helpful</em> error.
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 border border-red-500/20 bg-red-500/5 rounded-lg">
                                <span className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2 block">Bad</span>
                                <code className="text-xs text-muted-foreground">
                                    Error: panic at line 5.
                                </code>
                            </div>
                            <div className="p-4 border border-green-500/20 bg-green-500/5 rounded-lg">
                                <span className="text-xs font-bold text-green-500 uppercase tracking-wider mb-2 block">Good</span>
                                <code className="text-xs text-muted-foreground">
                                    {'// TODO: I am missing a semicolon here!'}<br/>
                                    let x = 5
                                </code>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                <div className="flex gap-4 items-start">
                    <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg shrink-0">
                        <Lightbulb className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold mb-2">The &quot;Split State&quot; Mindset</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Progy manages user progress separately from your course content.
                        </p>
                        <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-2 mt-2">
                            <li><strong>Do not</strong> assume the student&apos;s file system is clean. They might have created random files.</li>
                            <li><strong>Do</strong> keep your runner logic in the <code>runner/</code> folder or hidden from the student.</li>
                            <li><strong>Do</strong> use <code>gitignore</code> to prevent students from committing <code>node_modules</code> or <code>target</code> binaries to their progress repo.</li>
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    )
}


// --- Navigation Structure ---

const navData = {
  navMain: [
    {
      title: "Getting Started",
      url: "#",
      items: [
        {
          title: "Introduction",
          id: "intro",
          icon: BookOpen,
        },
        {
          title: "Installation",
          id: "installation",
          icon: Terminal,
        },
      ],
    },
    {
      title: "Student Guide",
      url: "#",
      items: [
        {
          title: "Tutorial: How to Use",
          id: "student-tutorial",
          icon: Play,
        },
        {
          title: "CLI Reference",
          id: "student-cli",
          icon: Terminal,
        },
      ],
    },
    {
      title: "Instructor Guide",
      url: "#",
      items: [
        {
          title: "Creating a Course",
          id: "instructor-create",
          icon: Code2,
        },
        {
          title: "Course Structure",
          id: "instructor-structure",
          icon: FileJson,
        },
        {
          title: "Writing Runners",
          id: "instructor-runners",
          icon: Settings,
        },
        {
          title: "Best Practices",
          id: "instructor-practices",
          icon: CheckCircle,
        },
      ],
    },
  ],
}

// --- Main Page Component ---

export default function DocsPage() {
  const [activeId, setActiveId] = React.useState("intro")

  const renderContent = () => {
    switch (activeId) {
      case "intro": return <IntroContent setActiveId={setActiveId} />;
      case "installation": return <InstallationContent />;
      case "student-tutorial": return <StudentTutorialContent />;
      case "student-cli": return <StudentCLIContent />;
      case "instructor-create": return <InstructorCreateContent />;
      case "instructor-structure": return <InstructorStructureContent />;
      case "instructor-runners": return <InstructorRunnersContent />;
      case "instructor-practices": return <InstructorBestPracticesContent />;
      default: return (
        <div className="space-y-4 py-6">
          <h1 className="text-3xl font-bold">
             {navData.navMain.find(g => g.items.find(i => i.id === activeId))?.items.find(i => i.id === activeId)?.title}
          </h1>
          <div className="p-8 border border-dashed rounded-lg bg-muted/50 text-center text-muted-foreground animate-pulse">
            Content for &quot;{activeId}&quot; is coming soon...
          </div>
        </div>
      );
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar activeId={activeId} setActiveId={setActiveId} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Documentation</span>
            <span>/</span>
            <span className="font-medium text-foreground">
              {navData.navMain.find(g => g.items.find(i => i.id === activeId))?.items.find(i => i.id === activeId)?.title || "Intro"}
            </span>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-10 max-w-4xl mx-auto w-full">
          {renderContent()}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function AppSidebar({ activeId, setActiveId }: { activeId: string, setActiveId: (id: string) => void }) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Progy</span>
            <span className="truncate text-xs">Documentation</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navData.navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={activeId === item.id}
                      onClick={() => setActiveId(item.id)}
                      tooltip={item.title}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
