import axios from 'axios';

import { Trades } from 'types/trades';

const TradesAPI = {
  getTradesByDate: async (date: string): Promise<Trades[]> => {
    const { data } = await axios.get(`trades/date/${date}`);
    return data;
  },
};

export default TradesAPI;
