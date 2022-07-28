import { z } from "zod";

import { initDb, dbAll, guard } from "../../../../../util";
import type {
  ApiRequestHandler,
  Conversation,
  Message,
} from "../../../../../types";

const Query = z.object({
  conversationName: z.string().min(1),
  order: z.string().regex(/^(oldest|newest)$/),
  limit: z
    .string()
    .regex(/\d+/)
    .transform(Number)
    .refine((n) => n >= 0 && n <= 99),
});

const handler: ApiRequestHandler = async (req, res) => {
  const db = await initDb();

  if (guard(req.query, res, Query)) return;

  const { conversationName, order, limit } = req.query;

  const ascOrDesc = order === "newest" ? "DESC" : "ASC";

  const conversations = await dbAll<Conversation[]>(
    db,
    `SELECT * FROM conversations WHERE (id = '${conversationName}') OR (UPPER(name) LIKE UPPER('${conversationName}'))`
  );
  const conversation = conversations[0];

  if (!conversation) {
    res.status(404).json({ err: "Could not find conversation", data: null });
    return;
  }
  const limitStr = limit === "0" ? "" : `LIMIT ${limit}`;

  console.log(limitStr);

  const messages = await dbAll<Message[]>(
    db,
    `SELECT * FROM messages WHERE conversationId = '${conversation.id}' ORDER BY received_at ${ascOrDesc} ${limitStr}`
  );
  res.json({ err: null, data: { ...conversation, messages } });
};
export default handler;
