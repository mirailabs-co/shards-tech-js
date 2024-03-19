export type GuildScore = {
  _id: string;
  clientId: string;
  leaderBoard: string;
  guild: string;
  score: number;
};

export type GetGuildScoreDto = {
  leaderBoardId: string;
  name?: string;
  limit: number;
  page: number;
  sort: 'asc' | 'desc';
};
