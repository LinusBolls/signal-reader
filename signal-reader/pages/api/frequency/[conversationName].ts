import { z } from "zod";
import { Interval, DateTime } from "luxon";

import { initDb, dbAll, guard } from "../../../util";
import type { ApiRequestHandler, Conversation, Message } from "../../../types";

const Query = z.object({
  conversationName: z.string().min(1),
});

const handler: ApiRequestHandler = async (req, res) => {
  const db = await initDb();

  if (guard(req.query, res, Query)) return;

  const { conversationName } = req.query;

  const conversations = await dbAll<Conversation[]>(
    db,
    `SELECT * FROM conversations WHERE (id = '${conversationName}') OR (UPPER(name) LIKE UPPER('${conversationName}'))`
  );
  const conversation = conversations[0];

  if (!conversation) {
    res.status(404).json({ err: "Could not find conversation", data: null });
    return;
  }

  const messages = await dbAll<Message[]>(
    db,
    `SELECT sent_at FROM messages WHERE conversationId = '${conversation.id}' ORDER BY sent_at DESC`
  );
  const endDate = DateTime.fromMillis(messages[0].sent_at);
  const startDate = DateTime.fromMillis(messages[messages.length - 1].sent_at);
  const interval = Interval.fromDateTimes(startDate, endDate);

  const days: { [key: string]: number } = {};

  const messageDates = messages.map((i) =>
    DateTime.fromMillis(i.sent_at).toFormat("dd.MM.yyyy")
  );
  for (const day of toDays(interval)) {
    days[day.toFormat("dd.MM.yyyy")] = 0;
  }
  for (const date of messageDates) {
    days[date] += 1;
  }
  res.json({ err: null, data: { ...conversation, days } });
};
export default handler;

function toDays(interval: any) {
  let days = [];
  let cursor = interval.start.startOf("day");

  while (cursor < interval.end) {
    days.push(cursor);
    cursor = cursor.plus({ days: 1 });
  }
  return days;
}
