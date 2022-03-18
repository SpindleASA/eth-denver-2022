import api from '@/api';

const zine = {
  namespaced: true,
  state: {
    zineCards: undefined,
    isLoading: false,
  },
  actions: {
    resetState(context) {
      context.commit('SET_IS_LOADING', false);
    },
    async getZineCards(context) {
      const response = await api.spindle.post('/api/asset-info', { option: 'warp-and-weft' });
      if (response.success) {
        context.commit('SET_ZINE_CARDS', response.data);
      }
    },
    async getPDF(_, data) {
      let response = await api.spindle.post('/api/get-pdf', data, { responseType: 'blob' });
      if (response.success) {
        response.data = URL.createObjectURL(response.data);
      }
      return response;
    },
    setIsLoading(context, isLoading) {
      context.commit('SET_IS_LOADING', isLoading);
    },
  },
  mutations: {
    SET_ZINE_CARDS(state, info) {
      state.zineCards = info;
    },
    SET_IS_LOADING(state, isLoading) {
      state.isLoading = isLoading;
    },
  },
};

export default zine;
