<template>
  <div class="w-100 d-flex flex-column align-items-center">
    <div class="mt-5">
      <h5 v-if="question" class="mb-5 text-center">{{ question }}</h5>
      <div v-for="option in optionList" :key="option[0]" class="mb-5 d-flex">
        <div class="mr-3 sp-fw-600">{{ option[0] }}:</div>
        <div v-html="option[1]"></div>
      </div>
    </div>

    <div class="d-flex align-items-center flex-wrap justify-content-center">
      <VotePercentages :votes="votes" />
      <VoteSelection :storyWallet="wallet" :votingClosed="votingClosed" @voted="onVoted" />
    </div>

    <div class="d-flex align-items-center">
      <h5 class="my-3">
        <span>{{ storyShortWallet[0] }}</span>
        <sp-icon height="20px" />
        <span>{{ storyShortWallet[1] }}</span>
      </h5>
      <b-button variant="link" class="d-flex align-items-center text-dark" @click="copyWallet">
        <b-icon height="16px" icon="clipboard" />
      </b-button>
    </div>

    <div class="p-3">
      <h6 v-html="$t('components.voting.start', { start: startDateString })" />
      <h6 v-html="$t('components.voting.end', { end: endDateString })" />
    </div>
  </div>
</template>

<script>
import VotePercentages from '@/components/voting/VotePercentages';
import VoteSelection from '@/components/voting/VoteSelection';
import utils from '@/utils/algorand';

export default {
  name: 'sp-voting',
  components: {
    VotePercentages,
    VoteSelection,
  },
  props: {
    wallet: {
      type: String,
      required: true,
    },
    start: {
      type: String,
      required: true,
    },
    end: {
      type: String,
      required: false,
    },
    question: {
      type: String,
    },
    options: {
      type: Object,
      required: false,
    },
  },
  data() {
    return {
      votes: undefined,
      updateVotesInterval: undefined,
    };
  },
  computed: {
    storyShortWallet() {
      return utils.getShortWallet(this.wallet);
    },
    votingClosed() {
      if (!this.endDate) {
        return false;
      }
      return this.endDate < new Date();
    },
    startDate() {
      return new Date(this.start);
    },
    endDate() {
      if (!this.end) {
        return;
      }
      return new Date(this.end);
    },
    startDateString() {
      return this.$d(this.startDate, 'long');
    },
    endDateString() {
      if (!this.end) {
        return 'TBD';
      }
      return this.$d(this.endDate, 'long');
    },
    optionList() {
      return Object.entries(this.options).sort((a, b) => (a[0] > b[0] ? 1 : -1));
    },
  },
  async created() {
    // regularly update the vote counts
    const response = await this.updateVotes();
    if (response.success) {
      this.votes = response.data;
    }
    this.setUpdateVotesInterval();

    if (!this.votingCards) {
      this.$store.dispatch('cards/getVotingCards');
    }
  },
  beforeDestroy() {
    clearInterval(this.updateVotes);
  },
  methods: {
    copyWallet() {
      navigator.clipboard.writeText(this.wallet);
      this.$bvToast.toast(this.wallet, {
        title: this.$t('components.voting.copied'),
        autoHideDelay: 3000,
        variant: 'success',
        toaster: 'b-toaster-bottom-center',
        bodyClass: 'text-break',
        solid: true,
      });
    },
    async updateVotes() {
      const response = await this.$store.dispatch('voting/getVotes', {
        wallet: this.wallet,
        start: this.start,
        end: this.end,
      });
      return response;
    },
    setUpdateVotesInterval() {
      this.updateVotesInterval = setInterval(async () => {
        const response = await this.updateVotes();
        if (response.success) {
          this.votes = response.data;
        }
      }, 30000);
    },
    async onVoted() {
      clearInterval(this.updateVotesInterval);
      const votes = this.votes;
      const previousVotes = this.votes.map((item) => item.votes).join(',');
      this.votes = undefined;

      // check for new votes
      for (let i = 0; i < 10; i++) {
        const response = await this.updateVotes();
        if (!response.success) continue;

        const newVotes = response.data.map((item) => item.votes).join(',');
        if (previousVotes !== newVotes) {
          this.votes = response.data;
          break;
        }
      }

      // reset to previous votes if no new votes detected
      if (!this.votes) {
        this.votes = votes;
      }
      this.setUpdateVotesInterval();
    },
  },
};
</script>

<style scoped>
.sp-card {
  width: 218px;
}

.sp-card-image {
  position: relative;
  width: 176px;
  height: 244px;
  background-image: url('@/assets/img/spinner.svg');
  background-position: center;
  background-repeat: no-repeat;
}
.sp-missing-card:not(:hover) .sp-card-image::after {
  content: ' ';
  display: block;
  width: 100%;
  height: 100%;
  background-color: white;
  position: absolute;
  top: 0;
  z-index: 1;
  opacity: 0.3;
}
.sp-card img {
  width: 100%;
  z-index: 1;
  position: relative;
}
.btn-link {
  text-decoration: none !important;
}
.btn-link:focus {
  box-shadow: unset !important;
}

.sp-missing-card:not(:hover) img {
  -webkit-filter: grayscale(1); /* Webkit */
  filter: gray; /* IE6-9 */
  filter: grayscale(1); /* W3C */
  opacity: 0.7;
}

.sp-text-small {
  font-size: 14px;
}
</style>
