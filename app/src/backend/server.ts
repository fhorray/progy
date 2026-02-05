import { serve } from "bun";
import index from "../../public/index.html";
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "node:child_process";

const EXERCISES_DIR = join(import.meta.dir, "../../../src/exercises");
const RUSTFLOW_DIR = join(import.meta.dir, "../../../.rustflow");
const CONFIG_PATH = join(RUSTFLOW_DIR, "config.json");
const MANIFEST_PATH = join(RUSTFLOW_DIR, "exercises.json");

console.log(`[INFO] Server starting...`);
console.log(`[INFO] EXERCISES_DIR: ${EXERCISES_DIR}`);

async function getApiKey() {
  try {
    const configText = await readFile(CONFIG_PATH, "utf-8");
    const config = JSON.parse(configText);
    return config.api_keys?.OpenAI;
  } catch (e) {
    return process.env.OPENAI_API_KEY;
  }
}

async function scanAndGenerateManifest() {
  console.log("[INFO] Scanning exercises to generate manifest...");
  try {
    const allFiles = await readdir(EXERCISES_DIR);
    const modules = allFiles.filter(m => m !== "mod.rs" && m !== "README.md");

    // Sort modules numerically (e.g. 01_variables < 02_functions)
    modules.sort((a, b) => {
      const numA = parseInt(a.split('_')[0] || "999");
      const numB = parseInt(b.split('_')[0] || "999");
      return numA - numB;
    });

    const manifest: Record<string, any[]> = {};

    for (const mod of modules) {
      const modPath = join(EXERCISES_DIR, mod);
      const stats = await Bun.file(modPath).stat();

      if (stats.isDirectory()) {
        const files = (await readdir(modPath)).filter(f => f.endsWith(".rs") && f !== "mod.rs");

        // Parse README for pedagogical order
        const pedagogicalOrder: string[] = [];
        try {
          const readmePath = join(modPath, "README.md");
          const content = await readFile(readmePath, "utf-8");
          const lines = content.split('\n');
          let inSection = false;

          for (const line of lines) {
            const trimmed = line.trim();
            const lower = trimmed.toLowerCase();
            if (lower.includes("exercise guidelines") ||
              lower.includes("minimum exercises required") ||
              lower.includes("exercises required")) {
              inSection = true;
              continue;
            }
            if (inSection) {
              const match = trimmed.match(/(\w+\.rs)/);
              if (match) {
                const filename = match[1]?.replace(".rs", "").trim() as string;
                if (!pedagogicalOrder.includes(filename)) pedagogicalOrder.push(filename);
              }
            }
          }
        } catch (e) {
          // No README or parse error, skip pedagogical order
        }

        // Sort files based on pedagogical order, fallback to alphabetical
        files.sort((a, b) => {
          const nameA = a.replace(".rs", "");
          const nameB = b.replace(".rs", "");
          const indexA = pedagogicalOrder.indexOf(nameA);
          const indexB = pedagogicalOrder.indexOf(nameB);

          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return a.localeCompare(b);
        });

        manifest[mod] = [];
        for (const file of files) {
          const exerciseName = file.replace(".rs", "");
          const cleanModName = mod.replace(/^\d+_/, "");
          manifest[mod].push({
            id: `${mod}/${file}`,
            module: mod,
            cleanModule: cleanModName,
            name: file,
            exerciseName: exerciseName,
            path: join(modPath, file),
          });
        }
      }
    }

    await mkdir(RUSTFLOW_DIR, { recursive: true });
    await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    console.log(`[INFO] Manifest generated successfully with ${Object.keys(manifest).length} modules.`);
    return manifest;
  } catch (error) {
    console.error("[ERROR] Failed to generate manifest:", error);
    return null;
  }
}

// Initial scan
let exerciseManifest: Record<string, any[]> | null = null;
scanAndGenerateManifest().then(m => exerciseManifest = m);

// Parse compiler output into friendly format
function parseCompilerOutput(rawOutput: string, success: boolean): string {
  if (success) {
    return "✅ All tests passed! Great job!\n\nYour solution is correct. You can move on to the next exercise.";
  }

  const lines = rawOutput.split('\n');
  const friendlyLines: string[] = [];

  // Extract only the relevant error information
  let foundError = false;
  let errorMessage = "";
  let errorLocation = "";
  let helpMessage = "";
  let codeSnippet: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';

    // Skip cargo/runner noise
    if (line.includes('warning: unused') ||
      line.includes('Compiling') ||
      line.includes('Finished') ||
      line.includes('Running') ||
      line.includes('runner') ||
      line.includes('#[warn') ||
      line.includes('= note:') ||
      line.trim() === '') {
      continue;
    }

    // Capture error line
    if (line.includes('error:') || line.includes('error[E')) {
      foundError = true;
      errorMessage = line.replace(/error\[E\d+\]:?\s*/, '').replace('error:', '').trim();
    }

    // Capture location
    if (line.includes('-->') && foundError) {
      const match = line.match(/-->\s*(.+):(\d+):(\d+)/);
      if (match) {
        const file = match[1]?.split(/[\\/]/).pop() || 'unknown';
        errorLocation = `Line ${match[2]} in ${file}`;
      }
    }

    // Capture code snippet (lines with | )
    if (line.includes(' | ') && foundError) {
      codeSnippet.push(line.trim());
    }

    // Capture help message
    if (line.includes('help:')) {
      helpMessage = line.replace('help:', '').trim();
    }
  }

  // Build friendly output
  if (foundError) {
    friendlyLines.push("❌ Compilation Error\n");
    friendlyLines.push(`📍 ${errorLocation}\n`);
    friendlyLines.push(`💡 Problem: ${errorMessage}\n`);

    if (codeSnippet.length > 0) {
      friendlyLines.push("\n📝 Your code:");
      codeSnippet.forEach(line => friendlyLines.push(`   ${line}`));
    }

    if (helpMessage) {
      friendlyLines.push(`\n🔧 Suggestion: ${helpMessage}`);
    }

    friendlyLines.push("\n\n💪 Don't give up! Fix the error and try again.");
  } else if (rawOutput.includes('❌')) {
    friendlyLines.push("❌ Test failed\n");
    friendlyLines.push("Check your logic and try again!");
  } else {
    return rawOutput; // Fallback to raw
  }

  return friendlyLines.join('\n');
}

const server = serve({
  port: 3001,
  routes: {
    "/": index,

    "/api/exercises": {
      async GET() {
        if (!exerciseManifest) {
          exerciseManifest = await scanAndGenerateManifest();
        }

        if (!exerciseManifest) {
          return Response.json({ error: "Failed to load exercises manifest" }, { status: 500 });
        }

        return new Response(JSON.stringify(exerciseManifest), {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store, no-cache, must-revalidate",
          }
        });
      }
    },

    "/api/exercises/code": {
      async GET(req) {
        const url = new URL(req.url);
        const filePath = url.searchParams.get('path');
        if (!filePath) {
          return new Response('Missing path parameter', { status: 400 });
        }
        try {
          const content = await readFile(filePath, 'utf-8');
          return new Response(content, { headers: { 'Content-Type': 'text/plain' } });
        } catch (e) {
          return new Response('// File not found', { status: 404 });
        }
      }
    },

    "/api/exercises/run": {
      async POST(req) {
        try {
          const body = await req.json() as { exerciseName: string };
          const { exerciseName } = body;
          console.log(`[INFO] Evaluating: ${exerciseName}`);

          return new Promise((resolve) => {
            const child = spawn("cargo", ["run", "-p", "runner", "--", "test", exerciseName], {
              cwd: join(import.meta.dir, "../../../"),
              env: { ...process.env, RUST_BACKTRACE: "1" },
              stdio: ["ignore", "pipe", "pipe"]
            });

            let output = "";
            if (child.stdout) child.stdout.on("data", (data) => output += data.toString());
            if (child.stderr) child.stderr.on("data", (data) => output += data.toString());

            child.on("close", async (code) => {
              const success = !output.includes("❌") && !output.includes("error[E") && !output.includes("error:");

              // Parse output into friendly format
              const friendlyOutput = parseCompilerOutput(output, success);

              resolve(Response.json({
                success,
                output: output || "No output captured.",
                friendlyOutput
              }));
            });

            child.on("error", (err) => {
              resolve(Response.json({ success: false, output: `Spawn error: ${err.message}`, friendlyOutput: `❌ Failed to run: ${err.message}` }));
            });
          });
        } catch (e) {
          return Response.json({ success: false, output: `Error: ${String(e)}`, friendlyOutput: `❌ Error: ${String(e)}` });
        }
      }
    },

    "/api/ai/hint": {
      async POST(req) {
        const { code, error } = await req.json() as { code: string, error: string };
        const apiKey = await getApiKey();
        if (!apiKey) return Response.json({ error: "Missing API Key" }, { status: 500 });

        try {
          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                { role: "system", content: "You are a Rust mentor. Provide a subtle hint." },
                { role: "user", content: `Code:\n${code}\n\nError:\n${error}` }
              ]
            })
          });
          const data = await response.json() as any;
          return Response.json({ hint: data.choices[0].message.content });
        } catch (err) {
          return Response.json({ error: "AI failed" }, { status: 500 });
        }
      }
    }
  },
  development: { hmr: true, console: true },
  fetch(req) { return new Response("Not Found", { status: 404 }); },
});

console.log(`🚀 RustFlow Server running at ${server.url}`);
