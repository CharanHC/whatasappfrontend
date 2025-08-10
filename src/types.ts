export type Conversation = {
  wa_id: string;
  lastMessage: {
    body: string;
    timestamp: string;
    name?: string;
  };
};
