<template>
  <div class="sp-voting-cards w-100 d-flex flex-column align-items-center">
    <h5 class="p-3 mb-4" v-if="!wallet">{{ $t('views.voting-cards.text.connect') }}</h5>
    <Shop :cards="votingCards" :prices="{}" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Shop from '@/components/cards/Shop';

export default {
  name: 'VotingCardsView',
  components: {
    Shop,
  },
  computed: {
    ...mapState({
      wallet: (state) => state.wallet.wallet,
      votingCards: (state) => state.cards.votingCards,
    }),
  },
  created() {
    return this.$store.dispatch('cards/getVotingCards');
  },
};
</script>

<style>
.sp-voting-cards .sp-card-image {
  height: 247px;
}
</style>
