import utils from '../../utils/algorand';
import api from '@/api';

const wallet = {
  namespaced: true,
  state: {
    wallet: undefined,
    walletType: undefined,
    account: undefined,
  },
  getters: {
    shortWallet(state) {
      if (!state.wallet) {
        return undefined;
      }
      return utils.getShortWallet(state.wallet);
    },
  },
  actions: {
    setWallet(context, wallet) {
      context.commit('SET_WALLET', wallet);
      if (typeof wallet === 'undefined') {
        context.commit('SET_ACCOUNT_INFO', undefined);
      }
    },
    async getAccountInfo(context, address) {
      if (typeof address === 'undefined') {
        context.commit('SET_ACCOUNT_INFO', undefined);
        return;
      }

      const response = await api.spindle.post('/api/account-info', { address });
      if (response.success) {
        context.commit('SET_ACCOUNT_INFO', response.data);
      }
    },
  },
  mutations: {
    SET_WALLET(state, wallet) {
      if (typeof wallet === 'undefined') {
        state.wallet = undefined;
        state.walletType = undefined;
        return;
      }
      state.wallet = wallet.address;
      state.walletType = wallet.type;
    },
    SET_ACCOUNT_INFO(state, wallet) {
      state.account = wallet;
    },
  },
};

export default wallet;
