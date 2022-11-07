const fs = require("fs");
const os = require("os");
const sqlite3 = require("@journeyapps/sqlcipher").verbose();

const DB_PATH =
  os.homedir() + "/Library/Application Support/Signal/sql/db.sqlite";

const CONFIG_PATH =
  os.homedir() + "/Library/Application Support/Signal/config.json";

const db = new sqlite3.Database(DB_PATH);

async function readConfigFile() {
  const file = await fs.promises.readFile(CONFIG_PATH, "utf8");
  const data = JSON.parse(file);

  return data;
}

async function dbAll(query) {
  return new Promise((resolve, reject) => {
    db.all(query, (err, rows) => {
      if (err) return reject(err);

      resolve(rows);
    });
  });
}

(async () => {
  const { key } = await readConfigFile();

  // using SQLCipher v4
  db.run("PRAGMA cipher_compatibility = 4");

  // https://www.zetetic.net/sqlcipher/sqlcipher-api/
  db.run(`PRAGMA key = "x'${key}'"`);

  db.serialize(async () => {
    // const tables = await dbAll("SELECT name FROM sqlite_master WHERE type='table'")

    await main();

    db.close();
  });
})();

async function main() {
  const tables = await dbAll(
    "SELECT name FROM sqlite_schema WHERE type ='table' AND name NOT LIKE 'sqlite_%'"
  );
  const idng = await dbAll("SELECT * FROM jobs");

  console.log(idng);
  console.log(tables);

  const conversations = await dbAll("SELECT id, name, json FROM conversations");

  const jannisId = conversations.filter((i) => i.name === "Jannes")[0].id;

  const jannisChat = await dbAll(
    `SELECT source, body, sent_at, type from messages WHERE conversationId = '${jannisId}'`
  );

  fs.promises.writeFile(
    "./jannis.chat.txt",
    jannisChat
      .filter((i) => i.body != null)
      .map((i) => (i.type === "outgoing" ? "  " : "") + i.body)
      .join("\n")
  );
}
