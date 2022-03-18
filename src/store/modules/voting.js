import api from '@/api';

const voting = {
  namespaced: true,
  state: {
    isLoading: false,
  },
  actions: {
    resetState(context) {
      context.commit('SET_IS_LOADING', false);
    },
    async getVotes(_, data) {
      return api.spindle.post('/api/get-votes', data);
    },
    async getVotingTransactions(_, data) {
      let response = await api.spindle.post('/api/vote', data);
      if (response.success) {
        response.data = response.data.map((txn) => new Uint8Array(Object.values(txn)));
      }
      return response;
    },
    async sendVotingTransactions(_, data) {
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

export default voting;
