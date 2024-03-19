export type TransactionHistory = {
  _id: string;
  guild: string;
  user: string;
  address: string;
  txHash: string;
  type: string;
  metadata: any;
  amount: number;
  price: number;
  status: string;
  transactionId: string;
  referralAddress: string;
  referralUser: string;
  referralPrice: number;
  createdAt: Date;
};

export type GetTransactionHistoryDto = {
  limit: number;
  page: number;
  guildId?: string;
  address?: string;
};
