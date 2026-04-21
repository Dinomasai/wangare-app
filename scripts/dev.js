// Spawns Vite dev server + Express API together. Cross-platform (Windows/Unix).
// Run with: npm run dev:all
import { spawn } from "child_process";

const isWin = process.platform === "win32";
const npmCmd = isWin ? "npm.cmd" : "npm";

const procs = [
  { name: "api", color: "\x1b[36m", cmd: npmCmd, args: ["run", "server"] },
  { name: "web", color: "\x1b[35m", cmd: npmCmd, args: ["run", "dev"] },
];

const children = procs.map(({ name, color, cmd, args }) => {
  const child = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"], shell: isWin });
  const prefix = `${color}[${name}]\x1b[0m `;

  const pipe = (stream, out) => {
    stream.setEncoding("utf8");
    let buf = "";
    stream.on("data", (chunk) => {
      buf += chunk;
      const lines = buf.split("\n");
      buf = lines.pop();
      for (const line of lines) out.write(prefix + line + "\n");
    });
  };

  pipe(child.stdout, process.stdout);
  pipe(child.stderr, process.stderr);

  child.on("exit", (code) => {
    process.stdout.write(`${prefix}exited with code ${code}\n`);
    for (const c of children) if (c !== child && !c.killed) c.kill();
    process.exit(code ?? 0);
  });

  return child;
});

const shutdown = () => children.forEach((c) => !c.killed && c.kill());
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
