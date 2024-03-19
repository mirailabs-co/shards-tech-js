export type Guilds = {
  _id: string;
  address: string;
  owner: string;
  clientId: string;
  name: string;
  metadata: any;
  users: Array<string>;
  slotPrice: number;
  maxMembers: number;
  rewardShareForMembers: number;
  txGuildOwnerShare: number;
  guildOwnerShare: number;
  numberAllowUpdate: number;
  startAllowUpdateTimestamp: number;
  endAllowUpdateTimestamp: number;
  createdAt: Date;
};
