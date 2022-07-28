import { z } from "zod";

import { initDb, dbAll, guard } from "../../../../util";
import type {
  ApiRequestHandler,
  Conversation,
  Message,
} from "../../../../types";

import fs from "fs";

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
    `SELECT * FROM messages WHERE conversationId = '${conversation.id}'`
  );
  const entireText = messages.map((i) => i.body).join("");

  const occurences = getOccurences(entireText);

  const dingns = Object.entries(occurences).sort((a, b) => a[1] - b[1]);

  await fs.promises.writeFile(
    "jannis.occurences.txt",
    dingns.map((i) => `${i[0]}: ${i[1]}`).join("\n")
  );
  console.log("did the thing");

  res.json({ err: null, data: { ...conversation, occurences } });
};
export default handler;

function getOccurences(text: string) {
  const onlyText = text.toLowerCase().replace(/[^a-zA-ZäöüÄÖÜß ]/g, " ");
  const allWords = onlyText.split(" ");
  const uniqueWords = [...(new Set(allWords) as any)];

  let occurences: { [key: string]: number } = {};

  for (const word of uniqueWords) {
    const numOccurences = (onlyText.match(new RegExp(word, "g")) || []).length;

    occurences[word] = numOccurences;
  }
  return occurences;
}
