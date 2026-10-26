import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Database } from "./types";
import { createSeedDatabase, SEED_VERSION } from "@/data/seed";
import { hashPassword } from "./password";

/**
 * File-backed demo data store.
 *
 * The storefront and the admin both read/write this single JSON document, so
 * admin edits, orders, customers and stock changes are real — they just live in
 * a local file instead of a database server.
 *
 * LIMITS (documented in README):
 *  - single process only (no multi-instance locking);
 *  - the filesystem must be writable, so read-only serverless hosts need a real
 *    database before deploying;
 *  - it holds demo records, never real customer data.
 */

const GLOBAL_DB = globalThis as unknown as {
  __maisontechDb?: Database;
  __maisontechDbQueue?: Promise<unknown>;
  __maisontechDbInit?: Promise<Database>;
};

const DB_PATH =
  process.env.DEMO_DB_PATH ?? path.join(process.cwd(), ".data", "maisontech-db.json");

let tempCounter = 0;

async function seedAndPersist(): Promise<Database> {
  const database = createSeedDatabase(hashPassword);
  try {
    await persist(database);
  } catch (error) {
    // A read-only filesystem should not break browsing the demo: keep the seeded
    // data in memory and only fail on writes.
    console.warn(
      `[db] base de démonstration non enregistrée (${(error as Error).message}) — les modifications ne survivront pas au redémarrage.`,
    );
  }
  return database;
}

async function persist(database: Database): Promise<void> {
  await mkdir(path.dirname(DB_PATH), { recursive: true });
  // Unique per write: concurrent writers must never rename the same temp file.
  const temp = `${DB_PATH}.${process.pid}.${++tempCounter}.tmp`;
  await writeFile(temp, `${JSON.stringify(database, null, 2)}\n`, "utf8");
  await rename(temp, DB_PATH);
}

async function loadFromDisk(): Promise<Database> {
  let database: Database | null = null;
  try {
    // The path may come from DEMO_DB_PATH, so it is not statically analysable.
    const raw = await readFile(/* turbopackIgnore: true */ DB_PATH, "utf8");
    database = JSON.parse(raw) as Database;
  } catch {
    database = null;
  }

  if (!database || database.version !== SEED_VERSION) {
    database = await seedAndPersist();
  }

  return database;
}

/**
 * Reads the demo database, seeding it from src/data on first run.
 * Initialisation is memoised on globalThis so that several concurrent server
 * renders cannot seed (and rename) the same file twice.
 */
export async function readDb(): Promise<Database> {
  if (GLOBAL_DB.__maisontechDb) return GLOBAL_DB.__maisontechDb;

  GLOBAL_DB.__maisontechDbInit ??= loadFromDisk()
    .then((database) => {
      GLOBAL_DB.__maisontechDb = database;
      return database;
    })
    .catch((error: unknown) => {
      GLOBAL_DB.__maisontechDbInit = undefined;
      throw error;
    });

  return GLOBAL_DB.__maisontechDbInit;
}

let queue: Promise<unknown> = GLOBAL_DB.__maisontechDbQueue ?? Promise.resolve();

/**
 * Serialises writes: read → mutate → persist, one at a time.
 * The mutator may mutate the draft and return a value.
 */
export function updateDb<T>(mutator: (database: Database) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const database = await readDb();
    const result = await mutator(database);
    await persist(database);
    return result;
  });
  queue = run.catch(() => undefined);
  GLOBAL_DB.__maisontechDbQueue = queue;
  return run;
}

/** Drops every demo edit and rewrites the seed data. */
export async function resetDb(): Promise<Database> {
  return updateDb(async (database) => {
    const fresh = createSeedDatabase(hashPassword);
    Object.assign(database, fresh);
    return database;
  });
}

export function dbFilePath(): string {
  return DB_PATH;
}
