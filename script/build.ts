import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile } from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times
// server deps are now all external to reliability

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  console.log("building moodist...");
  // Install and build moodist-main
  try {
    const { spawn } = await import("child_process");
    const path = await import("path");
    const moodistDir = path.resolve(process.cwd(), "moodist-main");

    // Helper to spawn npm commands in correct directory
    const runNpm = (args: string[]) => new Promise<void>((resolve, reject) => {
        const p = spawn("npm", args, {
            cwd: moodistDir,
            stdio: "inherit",
            shell: true,
        });
        p.on("close", (code) => {
            if (code === 0) resolve();
            else reject(new Error(`Command 'npm ${args.join(" ")}' failed with code ${code}`));
        });
        p.on("error", reject);
    });

    console.log(`Installing moodist deps in ${moodistDir}...`);
    // Use --no-audit and --prefer-offline to speed up
    await runNpm(["ci", "--include=dev", "--no-audit", "--prefer-offline"]);

    console.log(`Building moodist project...`);
    await runNpm(["run", "build"]);

  } catch (err) {
    console.error("Failed to build moodist:", err);
    throw err;
  }

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: allDeps, // <--- Mark ALL dependencies as external
    logLevel: "info",
  });
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
