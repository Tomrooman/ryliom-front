export type Trades = {
  [key: string]: boolean | string | number;
  _id: string;
  inPosition: boolean;
  price: number;
  profit: number;
  stopPrice: number;
  takePrice: number;
  type: string;
  inAt: string;
  outAt: string;
  createdAt: string;
  updatedAt: string;
};
