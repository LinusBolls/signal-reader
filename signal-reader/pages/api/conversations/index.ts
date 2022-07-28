import { initDb, dbAll } from "../../../util";
import type { ApiRequestHandler, Conversation } from "../../../types";

const handler: ApiRequestHandler = async (_, res) => {
  const db = await initDb();

  const conversations = await dbAll<Conversation[]>(
    db,
    "SELECT * FROM conversations"
  );
  res.json({ err: null, data: conversations });
};
export default handler;
