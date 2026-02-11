import { DockerClient } from "./client";
import path from "node:path";
import os from "node:os";

async function testSecurity() {
  const client = new DockerClient() as any; // Cast to any to access private methods
  const home = os.homedir();

  console.log("🔍 Testing Docker Security Implementation...\n");

  // 1. Test Path Validation
  console.log("--- 1. Path Safety Check ---");
  const testPaths = [
    { path: path.join(home, "projects", "my-course"), expected: true, label: "Normal project path" },
    { path: "/", expected: false, label: "Root directory" },
    { path: home, expected: false, label: "Home directory" },
    { path: path.join(home, ".ssh"), expected: false, label: "SSH folder" },
    { path: "/etc", expected: false, label: "System etc" },
    { path: "C:\\", expected: false, label: "Windows Drive Root" },
  ];

  for (const t of testPaths) {
    const result = client.isPathSafe(t.path);
    console.log(`${result === t.expected ? "✅" : "❌"} ${t.label}: ${t.path} -> ${result}`);
  }

  // 2. Test runContainer Protection
  console.log("\n--- 2. runContainer Protection Check ---");
  const unsafeResult = await client.runContainer("progy-env", {
    cwd: "/",
    command: "ls"
  });

  if (unsafeResult.error === "UNSAFE_PATH" && unsafeResult.exitCode === 1) {
    console.log("✅ runContainer correctly blocked unsafe path (root)");
  } else {
    console.log("❌ runContainer FAILED to block unsafe path");
    console.log(JSON.stringify(unsafeResult, null, 2));
  }

  // 3. Test runCommand without shell:true
  console.log("\n--- 3. runCommand Integrity Check ---");
  try {
    const code = await client.runCommand(["version"]);
    console.log(code === 0 ? "✅ runCommand works without shell: true" : `❌ runCommand failed with code ${code}`);
  } catch (e: any) {
    console.log(`❌ runCommand threw error: ${e.message}`);
  }

  console.log("\n--- Verification Complete ---");
}

testSecurity().catch(console.error);
