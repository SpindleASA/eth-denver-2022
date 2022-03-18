import api from '@/api';

const cards = {
  namespaced: true,
  state: {
    isLoading: false,
    votingCards: undefined,
  },
  actions: {
    resetState(context) {
      context.commit('SET_IS_LOADING', false);
    },
    async getVotingCards(context) {
      const response = await api.spindle.post('/api/asset-info', { option: 'voting-card' });
      if (response.success) {
        context.commit('SET_VOTING_CARDS', response.data);
      }
      return response;
    },
    async getSwapTransactions(_, data) {
      let response = await api.spindle.post('/api/swap-asset', data);
      if (response.success) {
        response.data = response.data.map((txn) => new Uint8Array(Object.values(txn)));
      }
      return response;
    },
    async sendTransactions(_, data) {
      return api.spindle.post('/api/send-transactions', { signedTxns: data });
    },
    setIsLoading(context, isLoading) {
      context.commit('SET_IS_LOADING', isLoading);
    },
  },
  mutations: {
    SET_VOTING_CARDS(state, votingCards) {
      state.votingCards = votingCards;
    },
    SET_IS_LOADING(state, isLoading) {
      state.isLoading = isLoading;
    },
  },
};

export default cards;
