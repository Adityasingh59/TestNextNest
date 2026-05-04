import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const ignored = new Set([".git", "node_modules", "dist", "coverage"]);
const checkedExtensions = new Set([".js", ".mjs", ".json", ".md", ".css", ".html"]);
const root = process.cwd();
const failures = [];

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(path);
      continue;
    }
    if (![...checkedExtensions].some((extension) => entry.name.endsWith(extension))) continue;
    const content = await readFile(path, "utf8");
    if (content.includes("\t")) failures.push(`${path}: contains tab characters`);
    if (!content.endsWith("\n")) failures.push(`${path}: missing trailing newline`);
  }
}

await walk(root);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Lint checks passed.");

