import { spawn } from "node:child_process";
import path from "node:path";
import os from "node:os";

export interface DockerRunOptions {
  cwd: string;
  command: string;
  env?: Record<string, string>;
  network?: string;
  tty?: boolean;
}

export interface DockerRunResult {
  exitCode: number;
  output: string;
  error?: string;
}

export class DockerClient {
  /**
   * Checks if a path is safe to mount in Docker.
   * Prevents mounting root, home, or sensitive system directories.
   */
  private isPathSafe(targetPath: string): boolean {
    const normalized = path.normalize(path.resolve(targetPath));
    const home = os.homedir();

    // Dissallow root
    if (normalized === path.parse(normalized).root) return false;

    // Disallow home directory itself (must be a subdirectory)
    if (normalized === home) return false;

    // Disallow sensitive paths (resolve them to handle OS-specific absolute paths)
    const sensitive = [
      path.join(home, '.ssh'),
      path.join(home, '.aws'),
      path.join(home, '.config'),
      path.resolve('/etc'), // On Windows, resolves to C:\etc or current drive etc
      path.resolve('/var'),
      path.resolve('/bin'),
      path.resolve('/sbin'),
      path.resolve('/windows'),
      path.resolve('/program files'),
    ];

    return !sensitive.some(s => normalized.startsWith(s));
  }

  /**
   * Checks if Docker is installed and running.
   */
  async checkAvailability(): Promise<boolean> {
    try {
      // Use execFile-like behavior by passing empty args if needed, 
      // but runCommand already handles the spawn.
      const exitCode = await this.runCommand(["info"], { silent: true });
      return exitCode === 0;
    } catch (e) {
      return false;
    }
  }

  /**
   * Builds the image from the given context directory and Dockerfile.
   */
  async buildImage(tag: string, contextPath: string, dockerfilePath: string): Promise<void> {
    console.log(`📦 Building environment image: ${tag}...`);

    if (!this.isPathSafe(contextPath)) {
      throw new Error(`Security Exception: Context path ${contextPath} is considered unsafe for mounting.`);
    }

    const exitCode = await this.runCommand(
      ["build", "-t", tag, "-f", dockerfilePath, contextPath],
      { stdio: "inherit" }
    );

    if (exitCode !== 0) {
      throw new Error(`Docker build failed with code ${exitCode}.`);
    }
    console.log(`✅ Environment built successfully.`);
  }

  /**
   * Checks if an image exists locally.
   */
  async imageExists(tag: string): Promise<boolean> {
    try {
      const exitCode = await this.runCommand(["inspect", "--type=image", tag], { silent: true });
      return exitCode === 0;
    } catch {
      return false;
    }
  }

  /**
   * Runs a container with the current directory mounted.
   */
  async runContainer(
    tag: string,
    opts: DockerRunOptions
  ): Promise<DockerRunResult> {
    if (!this.isPathSafe(opts.cwd)) {
      return {
        exitCode: 1,
        output: "Security Error: Attempted to mount an unsafe directory. Please move your course to a dedicated project folder.",
        error: "UNSAFE_PATH"
      };
    }

    if (opts.network && opts.network !== 'none') {
      console.warn(`\x1b[33m⚠️ WARNING: This course is requesting network access (${opts.network}). This may be a security risk.\x1b[0m`);
    }

    const mountArg = `${opts.cwd}:/workspace`;

    const args = [
      "run",
      "--rm",
      "--network", opts.network || "none",
      "-v", mountArg,
      "-w", "/workspace",
      "--cpus=2",
      "--memory=2g",
    ];

    if (opts.tty) {
      args.push("-t");
    }

    if (opts.env) {
      for (const [key, val] of Object.entries(opts.env)) {
        args.push("-e", `${key}=${val}`);
      }
    }

    args.push(tag);
    args.push("sh", "-c", opts.command);

    let output = "";

    return new Promise((resolve) => {
      const child = spawn("docker", args, { stdio: ["ignore", "pipe", "pipe"] });

      if (child.stdout) {
        child.stdout.on("data", (d) => { output += d.toString(); });
      }
      if (child.stderr) {
        child.stderr.on("data", (d) => { output += d.toString(); });
      }

      child.on("close", (code) => {
        resolve({ exitCode: code || 0, output });
      });

      child.on("error", (err) => {
        resolve({ exitCode: 1, output: `Failed to spawn docker: ${err.message}`, error: err.message });
      });
    });
  }

  /**
   * Helper to execute docker commands without shell injection risks.
   */
  private runCommand(args: string[], options: { silent?: boolean, stdio?: "inherit" | "pipe" | "ignore" } = {}): Promise<number> {
    return new Promise((resolve, reject) => {
      // Removing shell: true prevents command injection on the host machine
      // args are passed directly to the docker executable.
      const child = spawn("docker", args, {
        stdio: options.stdio || (options.silent ? "ignore" : "pipe"),
        shell: false
      });

      child.on("close", (code) => resolve(code || 0));
      child.on("error", (err) => reject(err));
    });
  }
}
