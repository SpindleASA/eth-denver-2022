<template>
  <div class="d-flex flex-column align-items-center">
    <div class="mt-3 mb-1">
      <span
        v-if="lastDistribution"
        v-html="$t('components.liquidity.lastDistr', { timestamp: $d(lastDistribution, 'long') })"
      />
    </div>
    <div class="mb-3 mt-1">
      <span v-html="$t('components.liquidity.snapshot', { timestamp: $d(snapShot, 'long') })" />
    </div>
    <div class="d-flex flex-wrap justify-content-center m-3">
      <div v-for="h in histories" :key="h[0]" class="p-3 mb-4 d-flex flex-column align-items-center">
        <div class="d-flex justify-content-center align-items-center mb-2" style="height: 24px">
          <b>{{ getShortWallet(h[0])[0] }}</b>
          <sp-icon height="20px" />
          <b>{{ getShortWallet(h[0])[1] }}</b>
        </div>
        <div>
          <span v-html="$t('components.liquidity.currBal', { amount: (h[1].balance / 10 ** decimals).toFixed(2) })" />
        </div>
        <div>
          <span
            v-html="$t('components.liquidity.avgBal', { amount: (h[1].averageBalance / 10 ** decimals).toFixed(2) })"
          />
        </div>
        <div v-if="wallet">
          <span
            v-html="
              $t('components.liquidity.rewards', {
                amount: Math.ceil((h[1].averageBalance / 10 ** decimals) * rewardsPerToken),
              })
            "
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import utils from '@/utils/algorand';

export default {
  name: 'sp-pool-history',
  async created() {
    await this.$store.dispatch('liquidity/getLastDistribution');
    await this.$store.dispatch('liquidity/getAssetInfo');
    this.$store.dispatch('liquidity/getPoolHistory');
  },
  computed: {
    ...mapState({
      lastDistribution: (state) => new Date(state.liquidity.lastDistribution * 1000),
      snapShot: (state) => new Date(state.liquidity.snapShot * 1000),
      history: (state) => state.liquidity.history,
      decimals: (state) => state.liquidity.decimals,
      rewardsPerToken: (state) => state.liquidity.rewardsPerToken,
      wallet: (state) => state.wallet.wallet,
    }),
    histories() {
      return Object.entries(this.history)
        .filter(([, v]) => {
          return v.averageBalance > 0;
        })
        .sort(([, v1], [, v2]) => {
          return v2.averageBalance - v1.averageBalance;
        });
    },
  },
  methods: {
    getShortWallet: utils.getShortWallet,
  },
};
</script>

<style scoped>
span {
  text-align: center;
}
</style>
