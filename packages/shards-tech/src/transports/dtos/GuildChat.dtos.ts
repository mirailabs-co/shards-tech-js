export type GetHistoryChatDto = {
  limit: number;
  page: number;
};

export type GuildHistoryChat = {
  _id: string;
  clientId: string;
  guild: string;
  user: string;
  message: string;
  metadata: Record<string, any>;
  createdAt: Date;
};

export type SendMessageDto = {
  message: string;
  metadata?: Record<string, any>;
};
