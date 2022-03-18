import Vue from 'vue';
import Vuex from 'vuex';
import secureStorage from './secureStorage';
import wallet from './modules/wallet';
import zine from './modules/zine';
import stories from './modules/stories';
import voting from './modules/voting';
import cards from './modules/cards';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    wallet,
    zine,
    stories,
    voting,
    cards,
  },
  plugins: [secureStorage],
});

export default store;
