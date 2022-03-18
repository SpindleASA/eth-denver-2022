<template>
  <div id="app">
    <div id="app-wrapper">
      <Navbar />
      <div id="app-content">
        <router-view />
      </div>
    </div>
    <div v-if="isLoading" class="sp-overlay">
      <b-spinner style="width: 5rem; height: 5rem"></b-spinner>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Navbar from './components/app/Navbar.vue';

export default {
  name: 'App',
  components: {
    Navbar,
  },
  metaInfo() {
    let title;
    if (this.routeName === '') {
      title = this.$t('app.title');
    } else {
      title = `${this.$t(`views.${this.routeName}.title`)} | ${this.$t('app.title')}`;
    }
    return {
      title,
    };
  },
  created() {
    ['zine', 'stories', 'voting', 'cards'].forEach((storeModule) => {
      this.$store.dispatch(`${storeModule}/resetState`);
    });
  },
  mounted() {
    // fix for urlbar on phones messing with layout
    this.setInnerHeight();
    window.addEventListener('resize', this.setInnerHeight);
  },
  computed: {
    ...mapState({
      isLoading: (state) => {
        // all modules that require a fullscreen loading overlay should be added here
        return state.zine.isLoading || state.voting.isLoading || state.cards.isLoading;
      },
    }),
    routeName() {
      if (!this.$route.name) {
        return '';
      }
      return this.$route.name.toLowerCase().replace('_', '.');
    },
  },
  methods: {
    setInnerHeight() {
      const app = document.getElementById('app');
      app.style.height = window.innerHeight + 'px';
    },
  },
};
</script>

<style>
html,
body {
  overflow: hidden;
}
</style>
<style scoped>
#app {
  overflow: hidden;
}

#app-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

#app-content {
  width: 100%;
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.sp-overlay {
  position: fixed;
  height: 100vh;
  width: 100vw;
  top: 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1040;
  background-color: rgba(63, 63, 63, 0.5);
}
</style>
