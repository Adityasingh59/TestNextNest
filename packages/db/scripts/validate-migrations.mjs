import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const migrationsDir = join(process.cwd(), "packages/db/migrations");
const files = (await readdir(migrationsDir)).filter((file) => file.endsWith(".sql")).sort();

if (files.length === 0) {
  throw new Error("No SQL migrations found.");
}

for (const file of files) {
  const sql = await readFile(join(migrationsDir, file), "utf8");
  if (!/CREATE TABLE users/i.test(sql)) {
    throw new Error(`${file} must include the users table in the initial schema.`);
  }
  if (!/CREATE TABLE events/i.test(sql)) {
    throw new Error(`${file} must include the events outbox table.`);
  }
  if (!/one_accepted_offer_per_conversation_idx/i.test(sql)) {
    throw new Error(`${file} must enforce one accepted offer per conversation.`);
  }
}

console.log(`Validated ${files.length} migration file.`);

