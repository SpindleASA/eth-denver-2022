import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import i18n from './i18n';
import VueMeta from 'vue-meta';
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue';
import Icon from '@/components/misc/Icon';

Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);
Vue.component('sp-icon', Icon);

Vue.use(VueMeta);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  i18n,
  render: (h) => h(App),
}).$mount('#app');
