<template>
  <div>
    <b-button variant="primary" @click="tip">{{ $t('components.tipping.tip') }}</b-button>

    <MaxContentModal :title="$t('components.tipping.tip')" ref="amountModal">
      <h6>{{ $t('components.tipping.tipYarn') }}</h6>
      <b-input v-model="amount" type="number" min="1" />
    </MaxContentModal>

    <PeraSignModal ref="signModal" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import PeraSignModal from '@/components/misc/PeraSignModal';
import MaxContentModal from '@/components/misc/MaxContentModal';
import MyAlgoConnect from '@randlabs/myalgo-connect';
import algosdk from 'algosdk';

const myAlgoConnect = new MyAlgoConnect();

export default {
  name: 'sp-tip-button',
  components: {
    PeraSignModal,
    MaxContentModal,
  },
  props: {
    storyWallet: {
      type: String,
      required: true,
    },
    story: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      amount: 1,
    };
  },
  computed: {
    ...mapState({
      wallet: (state) => state.wallet.wallet,
      walletType: (state) => state.wallet.walletType,
      assetId: (state) => state.liquidity.assetId,
      assetDecimals: (state) => state.liquidity.assetDecimals,
    }),
  },
  created() {
    this.$store.dispatch('liquidity/getAssetInfo');
  },
  methods: {
    async tip(assetId) {
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
      const response = await this.$store.dispatch('voting/getTippingTransactions', {
        assetId: this.assetId,
        address: this.wallet,
        amount: parseInt(this.amount) * 10 ** this.assetDecimals,
        receiver: this.storyWallet,
        story: this.story,
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
              message: this.$t('components.tipping.tip'),
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
