<template>
  <div>
    <div
      class="d-flex align-items-center flex-wrap justify-content-center m-3"
      style="width: 200px"
      v-if="!votingClosed"
    >
      <b-button
        class="m-2 px-4"
        variant="primary"
        v-for="card in votingCards"
        :key="card.index"
        :disabled="!wallet || assetAmount(card.index) === 0"
        :title="
          wallet
            ? assetAmount(card.index) === 0
              ? $t('components.voting.noCards')
              : $t('components.voting.vote', { option: /^Vote (\w+) /.exec(card.params.name)[1] })
            : $t('components.voting.connect')
        "
        @click="vote(card.index)"
      >
        {{ /^Vote (\w+) /.exec(card.params.name)[1] }}
      </b-button>
    </div>
    <div
      class="d-flex align-items-center flex-wrap justify-content-center m-3"
      style="width: 200px; height: 96px"
      v-else
    >
      <h6>{{ $t('components.voting.closed') }}</h6>
    </div>
    <MaxContentModal :title="$t('components.voting.sendCards')" ref="amountModal">
      <template v-if="selectedCard">
        <h6>{{ selectedCard.params.name }}</h6>
        <b-input v-model="amount" type="number" min="1" :max="assetAmount(selectedCardId)" />
      </template>
    </MaxContentModal>

    <PeraSignModal ref="signModal" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import MaxContentModal from '@/components/misc/MaxContentModal';
import MyAlgoConnect from '@randlabs/myalgo-connect';
import PeraSignModal from '@/components/misc/PeraSignModal';
import algosdk from 'algosdk';

const myAlgoConnect = new MyAlgoConnect();

export default {
  name: 'sp-vote-selection',
  components: {
    MaxContentModal,
    PeraSignModal,
  },
  props: {
    storyWallet: {
      type: String,
      required: true,
    },
    votingClosed: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      selectedCardId: undefined,
      amount: 1,
    };
  },
  computed: {
    ...mapState({
      votingCards: (state) => state.cards.votingCards,
      wallet: (state) => state.wallet.wallet,
      walletType: (state) => state.wallet.walletType,
      account: (state) => state.wallet.account,
    }),
    selectedCard() {
      if (typeof this.selectedCardId === 'undefined') {
        return undefined;
      }
      return this.votingCards.find((card) => card.index === this.selectedCardId);
    },
  },
  methods: {
    assetAmount(assetId) {
      if (typeof this.account === 'undefined') {
        return 0;
      }
      const asset = this.account.assets.find((asset) => asset['asset-id'] === assetId);
      if (typeof asset === 'undefined') {
        return 0;
      }
      return asset.amount;
    },
    async vote(assetId) {
      this.$store.dispatch('voting/setIsLoading', true);

      this.selectedCardId = assetId;

      const amountModalClose = await this.$refs.amountModal.show();
      if (amountModalClose.trigger !== 'ok') {
        this.$store.dispatch('voting/setIsLoading', false);
        return;
      }

      const txnResponse = await this.getTransactions();
      if (!txnResponse.success) {
        this.$store.dispatch('voting/setIsLoading', false);
        return;
      }

      const signResponse = await this.signTxns(txnResponse.data);
      if (!signResponse.success) {
        this.$store.dispatch('voting/setIsLoading', false);
        return;
      }

      const sendResponse = await this.sendTransactions(signResponse.signedTxns);
      if (sendResponse.success) {
        await this.$store.dispatch('wallet/getAccountInfo', this.wallet);
        this.$emit('voted');
      }
      this.$store.dispatch('voting/setIsLoading', false);
    },
    async getTransactions() {
      const response = await this.$store.dispatch('voting/getVotingTransactions', {
        assetId: this.selectedCardId,
        address: this.wallet,
        amount: parseInt(this.amount),
        receiver: this.storyWallet,
      });
      if (!response.success) {
        return response;
      }

      const decoded = response.data.map((txn) => algosdk.decodeUnsignedTransaction(txn));

      console.log('Transaction details:', decoded);
      return response;
    },
    async signTxns(allTxns) {
      let signedTxns;
      try {
        if (this.walletType === 'my-algo') {
          signedTxns = await myAlgoConnect.signTransaction(allTxns);
          signedTxns = signedTxns.map((txn) => txn.blob);
        } else {
          const txnsToSign = allTxns.map((txn) => {
            const encodedTxn = Buffer.from(txn).toString('base64');

            const params = {
              txn: encodedTxn,
              message: `${/^Vote (\w+) /.exec(this.selectedCard.params.name)[0]}`,
            };

            return params;
          });

          const requestParams = [txnsToSign];
          let result = await this.$refs.signModal.sign(requestParams);
          if (!result) return { success: false };

          signedTxns = result.map((element) => {
            return element ? new Uint8Array(Buffer.from(element, 'base64')) : null;
          });
        }
      } catch (error) {
        this.$bvToast.toast(this.$t('misc.errorMessages.cancelled'), {
          autoHideDelay: 3000,
          variant: 'danger',
          toaster: 'b-toaster-bottom-center',
          solid: true,
        });
        console.error(error);
        return { success: false };
      }
      return { success: true, signedTxns };
    },
    async sendTransactions(signedTxns) {
      const response = await this.$store.dispatch('voting/sendVotingTransactions', signedTxns);

      if (response.success) {
        this.$bvToast.toast(this.$t('misc.successMessages.transactions'), {
          title: this.$t('misc.success'),
          autoHideDelay: 3000,
          variant: 'success',
          toaster: 'b-toaster-bottom-center',
          solid: true,
        });
      } else {
        let errorText = response.data;
        if (errorText.includes('underflow')) {
          errorText = this.$t('misc.errorMessages.underflow');
        }
        this.$bvToast.toast(errorText, {
          title: this.$t('misc.error'),
          autoHideDelay: 10000,
          variant: 'danger',
          toaster: 'b-toaster-bottom-center',
          bodyClass: 'text-break',
          solid: true,
        });
      }
      return response;
    },
  },
};
</script>
