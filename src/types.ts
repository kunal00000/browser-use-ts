export type WSMessageBody = {
  event: string;
  data: Record<string, any>;
};

export type WsMessageEvent = "MESSAGE" | "SCREENSHOT";
