import sqlite3lib from "@journeyapps/sqlcipher";

import fs from "fs";

const sqlite3 = sqlite3lib.verbose();

async function readConfigFile(path: string) {
  const file = await fs.promises.readFile(path, "utf8");
  const data = JSON.parse(file);

  return data;
}

async function dbAll<T>(db: any, query: string): Promise<T> {
  return new Promise((resolve, reject) => {
    db.all(query, (err: Error, rows: T) => {
      if (err) return reject(err);

      resolve(rows);
    });
  });
}

async function initDb() {
  const Path = await getPaths();

  const { key } = await readConfigFile(Path.CONFIG);

  const db = new sqlite3.Database(Path.DB);

  // using SQLCipher v4
  db.run("PRAGMA cipher_compatibility = 4", (err) => {});

  // https://www.zetetic.net/sqlcipher/sqlcipher-api/
  db.run(`PRAGMA key = "x'${key}'"`, (err) => {});

  db.serialize();

  return db;
}

function guard(query: any, res: any, validator: any) {
  try {
    validator.parse(query);
  } catch (err: any) {
    res
      .status(401)
      .json({ err: `Query Error: ${err.issues[0].path}`, data: null });

    return true;
  }
  return false;
}

export { initDb, dbAll, guard };

const potentialSignalPaths = [
  "/Users/linusbolls/Library/Application Support/Signal/",
  "%APPDATA%/Signal",
];

function isErrorNotFound(err: any) {
  return err.code === "ENOENT";
}

async function isDir(path: string): Promise<boolean> {
  const result = await fs.promises.stat(path).catch((err) => {
    if (isErrorNotFound(err)) return false;

    throw err;
  });
  if (typeof result === "boolean") return false;

  return result?.isDirectory();
}

async function getPaths() {
  const validPaths = await Promise.all(potentialSignalPaths.filter(isDir));

  if (!validPaths.length) throw new Error("No valid paths found");

  const root = validPaths[0];

  return {
    DB: root + "/sql/db.sqlite",
    CONFIG: root + "/config.json",
  };
}
