<template>
  <div class="m-3 d-flex justify-content-center align-items-center" style="min-width: 240px">
    <div v-if="votes">
      <div class="sp-voting-row" v-for="option in votePercentages" :key="option.vote">
        <div class="sp-vote-option">{{ option.vote }}</div>
        <div
          class="sp-progress"
          :style="`background: linear-gradient(90deg, ${option.highest ? '#2c0' : '#f80'} ${
            option.percent
          }, #99999980 ${option.percent})`"
        ></div>
        <div class="sp-percent">
          <span>{{ option.percent }}</span
          ><span> | </span><span>{{ option.absolute }}</span>
        </div>
      </div>
    </div>
    <b-spinner v-else />
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'sp-vote-percentages',
  props: {
    votes: {
      type: Array,
    },
  },
  computed: {
    ...mapState({
      votingCards: (state) => state.cards.votingCards,
    }),
    votePercentages() {
      if (!this.votes) {
        return;
      }

      const totalVotes = this.votes.map((option) => option.votes).reduce((a, b) => a + b);

      const highest = this.votes.reduce((a, b) => (a.votes > b.votes ? a : b));

      return this.votes.map((option) => {
        return {
          percent: (totalVotes === 0 ? 0 : (option.votes / totalVotes) * 100).toFixed(2) + '%',
          vote: /Vote (\w+) /.exec(this.votingCards.find((card) => card.index === option.assetId).params.name)[1],
          absolute: option.votes,
          highest: option.votes === highest.votes,
        };
      });
    },
  },
};
</script>

<style scoped>
.sp-voting-row {
  min-width: max-content;
  display: flex;
  align-items: center;
}

.sp-vote-option {
  width: 40px;
  text-align: center;
}

.sp-progress {
  width: 100px;
  height: 4px;
  background-color: gray;
}

.sp-percent {
  flex-grow: 1;
  display: flex;
}

.sp-percent > span:first-child {
  width: 70px;
  text-align: right;
}

.sp-percent > span:nth-child(2) {
  padding: 0 0.5rem;
  text-align: center;
}

.sp-percent > span:last-child {
  flex-grow: 1;
  text-align: right;
}
</style>
