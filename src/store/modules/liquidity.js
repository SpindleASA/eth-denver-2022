import api from '@/api';
import utils from '@/utils/algorand';

const liquidity = {
  namespaced: true,
  state: {
    rewardsPerToken: 1,
    isLoading: false,
    lastDistribution: undefined,
    snapShot: undefined,
    history: undefined,
    decimals: 0,
    assetId: undefined,
    assetDecimals: 0,
  },
  actions: {
    resetState(context) {
      context.commit('SET_IS_LOADING', false);
    },
    async getLastDistribution(context) {
      const response = await api.spindle.get('/api/distribution-timestamp');
      if (response.success) {
        context.commit('SET_LAST_DISTRIBUTION', response.data);
      } else {
        context.commit('SET_LAST_DISTRIBUTION', undefined);
      }
      return response;
    },
    async getPoolHistory(context) {
      const assetInfo = await api.spindle.post('/api/asset-info', { option: 'lp-pool' });
      if (!assetInfo.success) {
        context.commit('SET_POOL_HISTORY', undefined);
        return assetInfo;
      }
      const poolId = assetInfo.data[0].index;
      const response = await api.spindle.post('/api/pool-history', { poolId });
      if (response.success) {
        context.commit('SET_POOL_HISTORY', response.data);
      } else {
        context.commit('SET_POOL_HISTORY', undefined);
      }
      return response;
    },
    async getRewardsTransactions(context, data) {
      const response = await api.spindle.post('/api/liquidity-rewards', data);
      if (response.success) {
        response.data = response.data.map((txn) => new Uint8Array(Object.values(txn)));
      }
      return response;
    },
    // eslint-disable-next-line no-unused-vars
    async sendTransactions(context, data) {
      const response = await api.spindle.post('/api/send-multiple-transactions', { signedTxns: data.signedTxns });
      await api.spindle.post('/api/update-distribution-timestamp', { timestamp: context.state.snapShot });
      return response;
    },
    async getAssetInfo(context) {
      try {
        const info = await api.spindle.post('/api/asset-info', { option: 'yarn' });
        context.commit('SET_ASSET_INFO', info.data[0]);
      } catch (error) {
        console.error(error);
        return error;
      }
    },
    setIsLoading(context, isLoading) {
      context.commit('SET_IS_LOADING', isLoading);
    },
  },
  mutations: {
    SET_LAST_DISTRIBUTION(state, data) {
      if (!data) {
        state.lastDistribution = undefined;
        return;
      }
      state.lastDistribution = data.timestamp;
    },
    SET_POOL_HISTORY(state, history) {
      if (!history) {
        state.decimals = 0;
        state.history = undefined;
        state.snapShot = undefined;
        return;
      }
      const creation = history.shift();

      state.decimals = creation['asset-config-transaction'].params.decimals;

      const creator = creation['asset-config-transaction'].params.creator;
      const histories = utils.getAssetHistoryPerWallet(history);
      delete histories[creator];

      state.snapShot = Date.now() / 1000;
      Object.entries(histories).forEach(([k, v]) => {
        histories[k] = {
          actions: v,
          balance: utils.getWalletBalance(v),
          averageBalance: utils.getAverageWalletBalance(v, state.lastDistribution, state.snapShot),
        };
      });

      state.history = histories;
    },
    SET_REWARDS_PER_TOKEN(state, amount) {
      state.rewardsPerToken = amount;
    },
    SET_IS_LOADING(state, isLoading) {
      state.isLoading = isLoading;
    },
    SET_ASSET_INFO(state, info) {
      state.assetId = info.index;
      state.assetDecimals = info.params.decimals;
    },
  },
};

export default liquidity;
