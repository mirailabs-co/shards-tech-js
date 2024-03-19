export type Action = {
  _id: string;
  hash: string;
  clientId: string;
  userId: string;
  type: string;
  metadata: any;
  status: string;
  createdAt: Date;
};
