<template>
  <b-navbar type="light" variant="white" class="px-4 py-0 align-items-stretch" toggleable="lg" sticky>
    <b-navbar-brand :to="{ path: '/' }" class="px-3">
      <sp-icon class="sp-navbar-logo py-1" />
      <span class="text-primary sp-fw-600 ml-2">{{ $t('app.title') }}</span>
    </b-navbar-brand>

    <b-navbar-toggle target="nav-collapse" class="ao-navbar-toggler">
      <template #default="{ expanded }">
        <b-icon v-if="expanded" icon="x"></b-icon>
        <b-icon v-else icon="list"></b-icon>
      </template>
    </b-navbar-toggle>

    <b-collapse id="nav-collapse" is-nav>
      <b-navbar-nav>
        <b-nav-item
          v-for="(item, idx) in navigation"
          :key="idx"
          :to="item.to"
          :link-classes="{
            'd-flex': true,
            'h-100': true,
            'align-items-center': true,
            'sp-home-nav': item.to.path === '/',
          }"
          >{{ item.name }}</b-nav-item
        >
        <WalletConnector class="px-3 py-2 d-flex h-100 align-items-center" variant="outline-primary" />
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script>
import WalletConnector from '@/components/misc/WalletConnector.vue';

export default {
  name: 'sp-navbar',
  data() {
    return {
      navigation: [
        {
          to: { path: '/' },
          name: this.$t('views.home.title'),
        },
        {
          to: { path: '/stories' },
          name: this.$t('views.stories.title'),
        },
        {
          to: { path: '/voting-cards' },
          name: this.$t('views.voting-cards.title'),
        },
        {
          to: { path: '/warp-and-weft' },
          name: this.$t('views.zine.title'),
        },
        {
          to: { path: '/spindle-asa' },
          name: this.$t('views.token.title'),
        },
      ],
    };
  },
  components: {
    WalletConnector,
  },
};
</script>

<style scoped>
.sp-navbar-logo {
  height: 50px;
  color: var(--primary);
}
</style>
