import type { ServerType } from "@progy/core";
import { spawn } from "node:child_process";

const ideOpenHandler: ServerType<"/ide/open"> = async (req) => {
  try {
    const { path, command } = await req.json() as { path: string, command?: string };
    if (!path) return Response.json({ success: false, error: "Missing path" });

    const editorCmd = command || "code";

    // Sanitize command to prevent arbitrary execution (allow-list approach)
    const allowedEditors = ["code", "cursor", "subl", "idea", "webstorm", "pycharm", "atom", "vim", "nvim", "nano"];
    const baseCmd = editorCmd.split(" ")[0]; // basic check

    if (!allowedEditors.includes(baseCmd!) && !process.env.PROGY_ALLOW_UNSAFE_EDITORS) {
        console.warn(`[IDE] Blocked potentially unsafe editor command: ${editorCmd}`);
        return Response.json({ success: false, error: "Editor command not allowed. Set PROGY_ALLOW_UNSAFE_EDITORS=true to bypass." });
    }

    console.log(`[IDE] Opening ${path} with ${editorCmd}...`);
    const child = spawn(editorCmd, [path], { shell: true });

    return new Promise((resolve) => {
      child.on("error", (e) => {
        console.error(`[IDE] Failed to spawn '${editorCmd}': ${e}`);
        resolve(Response.json({ success: false, error: `${editorCmd} not found in PATH` }));
      });
      child.on("spawn", () => {
        resolve(Response.json({ success: true }));
      });
    });
  } catch (e) {
    console.error(`[IDE] Failed to open: ${e}`);
    return Response.json({ success: false, error: String(e) }, { status: 500 });
  }
};

export const ideRoutes = {
  "/ide/open": { POST: ideOpenHandler }
};
