import type { NextApiRequest, NextApiResponse } from "next";

interface ApiResponse {
  err: string | null;
  data: any;
}
type ApiRequestHandler = (
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) => Promise<void>;

interface Conversation {
  id: string;
  json: string;
  active_at?: number;
  type: "private" | "group";
  members?: string; // bunch of space seperated uuids
  name?: string;
  profileName?: string;
  profileFamilyName?: string;
  profileFullName?: string;
  e164?: string; // phone number
  uuid?: string;
  groupId?: string;
  profileLastFetchedAt?: number;
}
interface Message {
  rowid: number;
  id: string;
  json: string;
  readStatus: number;
  expires_at?: number;
  sent_at: number;
  schemaVersion: number;
  conversationId: string;
  received_at: number;
  source: number; // ?
  deprecatedSourceDevice?: unknown;
  hasAttachments: number;
  hasFileAttachments: number;
  hasVisualMediaAttachments: number;
  expireTimer?: unknown;
  expirationStartTimestamp?: number;
  type: "incoming" | "outgoing";
  body: string;
  messageTimer?: unknown;
  messageTimerStart?: number;
  messageTimerExpiresAt?: number;
  isErased: number;
  isViewOnce: number;
  sourceUuid: string;
  serverGuid: string;
  expiresAt?: number;
  sourceDevice: number;
  storyId?: string;
  isStory: number;
  isChangeCreatedByUs: number;
  shouldAffectActivity: number;
  shouldAffectPreview: number;
  isUserInitiatedMessage: number;
  isTimerChangeFromSync: number;
  isGroupLeaveEvent: number;
  isGroupLeaveEventFromOther: number;
  seenStatus: number;
}

export type { ApiResponse, ApiRequestHandler, Conversation, Message };
