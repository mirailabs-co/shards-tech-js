export type GameConfig = {
  _id: string;
  clientId: string;
  linkDapp: string;
  callBack: string;
  webHook: string;
  gameServerUrl: string;
  authorizationGameServerUrl: string;
  name: string;
  metadata: Record<string, any>;
  leaderBoardId: string;
  apiKey: string;
  fee: number;
  deadline: number;
  allowUpdateFields: string[];
  sendNotificationHashKey: string;
  memberGuildConfig: Record<string, any>;
  createdAt: string;
};