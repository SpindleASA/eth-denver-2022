<template>
  <div class="w-100 d-flex flex-column align-items-center">
    <div v-if="wallet && history" class="d-flex flex-column align-items-center">
      <h5 class="pb-2">{{ $t('components.liquidity.rewardsPerToken') }}</h5>
      <b-input class="sp-form" type="number" v-model="rewardsPerToken" min="0" step="0.1" :state="null" />

      <b-button class="m-3" variant="primary" style="min-width: max-content" @click="sendRewards">{{
        $t('components.liquidity.send')
      }}</b-button>
    </div>
    <h5 v-else class="mb-5">{{ $t('components.liquidity.connect') }}</h5>

    <MaxContentModal :title="$t('components.liquidity.confirm')" ref="rewardsModal">
      <span v-html="$t('components.liquidity.confirmAmount', { amount: totalAmount, wallets: totalWallets })" />
    </MaxContentModal>

    <PeraSignModal ref="signModal" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import MyAlgoConnect from '@randlabs/myalgo-connect';
import MaxContentModal from '@/components/misc/MaxContentModal';
import PeraSignModal from '@/components/misc/PeraSignModal';

const myAlgoConnect = new MyAlgoConnect();

export default {
  name: 'sp-rewards',
  components: {
    MaxContentModal,
    PeraSignModal,
  },
  data() {
    return {
      totalAmount: 0,
      totalWallets: 0,
    };
  },
  computed: {
    ...mapState({
      wallet: (state) => state.wallet.wallet,
      walletType: (state) => state.wallet.walletType,
      isLoading: (state) => state.liquidity.isLoading,
      history: (state) => state.liquidity.history,
      snapShot: (state) => state.liquidity.snapShot,
      decimals: (state) => state.liquidity.decimals,
      assetId: (state) => state.liquidity.assetId,
      assetDecimals: (state) => state.liquidity.assetDecimals,
    }),
    transactions() {
      return Object.entries(this.history)
        .filter(([, v]) => {
          return v.averageBalance > 0;
        })
        .sort(([, v1], [, v2]) => {
          return v2.averageBalance - v1.averageBalance;
        })
        .map(([k, v]) => {
          return {
            receiver: k,
            averageBalance: v.averageBalance,
            amount:
              Math.ceil((v.averageBalance * this.rewardsPerToken) / 10 ** this.decimals) * 10 ** this.assetDecimals,
          };
        });
    },
    rewardsPerToken: {
      set(value) {
        this.$store.commit('liquidity/SET_REWARDS_PER_TOKEN', value);
      },
      get() {
        return this.$store.state.liquidity.rewardsPerToken;
      },
    },
  },
  methods: {
    async sendRewards() {
      this.$store.dispatch('liquidity/setIsLoading', true);

      const totalAmount = this.transactions.map((txn) => txn.amount).reduce((a, b) => a + b);
      this.totalAmount = totalAmount / 10 ** this.assetDecimals;
      this.totalWallets = this.transactions.length;

      const rewardsModalClose = await this.$refs.rewardsModal.show();
      if (rewardsModalClose.trigger !== 'ok') {
        this.$store.dispatch('liquidity/setIsLoading', false);
        return;
      }

      const txnResponse = await this.$store.dispatch('liquidity/getRewardsTransactions', {
        wallet: this.wallet,
        transactions: this.transactions,
        assetId: this.assetId,
      });
      if (!txnResponse.success) {
        this.$store.dispatch('liquidity/setIsLoading', false);
        return;
      }
      const txns = txnResponse.data;

      const signedTxns = [];
      for (let i = 0; i < txns.length; i++) {
        if (i > 0 && this.walletType === 'pera') {
          // wait for a few seconds so pera will react to the request
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 3000);
          });
        }
        const signResponse = await this.signTxn(txns[i]);
        if (!signResponse.success) {
          let success = false;
          if (signResponse.data.includes('popup')) {
            success = await this.$bvModal.msgBoxConfirm(this.$t('misc.errorMessages.popupDescr'), {
              title: this.$t('misc.errorMessages.popupTitle'),
              centered: true,
              noCloseOnBackdrop: true,
              cancelVariant: 'outline-primary',
            });
          }
          if (success) {
            i -= 1;
          } else {
            this.$bvToast.toast(signResponse.data, {
              title: this.$t('misc.errorMessages.cancelled'),
              autoHideDelay: 5000,
              variant: 'danger',
              toaster: 'b-toaster-bottom-center',
              solid: true,
            });
            this.$store.dispatch('liquidity/setIsLoading', false);
            return;
          }
        }
        signedTxns.push(signResponse.data);
      }

      let response = await this.$store.dispatch('liquidity/sendTransactions', { signedTxns });

      const errors = response.data.filter((item) => {
        return !item.txId;
      });

      if (errors.length > 0) {
        await this.$bvModal.msgBoxOk(this.$t('components.liquidity.failed', { amount: errors.length }), {
          title: this.$t('misc.errorMessages.failed'),
          centered: true,
          noCloseOnBackdrop: true,
        });
      } else {
        await this.$bvModal.msgBoxOk(this.$t('components.liquidity.failed'), {
          title: this.$t('misc.success'),
          centered: true,
          noCloseOnBackdrop: true,
        });
      }

      this.downloadAsCsv(response.data);

      await this.$store.dispatch('liquidity/getLastDistribution');
      this.$store.dispatch('liquidity/getPoolHistory');
      this.$store.dispatch('liquidity/setIsLoading', false);
    },
    async signTxn(txn) {
      let signedTxn;
      try {
        if (this.walletType === 'my-algo') {
          signedTxn = await myAlgoConnect.signTransaction([txn]);
          signedTxn = signedTxn.map((txn) => txn.blob);
        } else {
          const encodedTxn = Buffer.from(txn).toString('base64');

          const params = {
            txn: encodedTxn,
            message: this.$t('components.liquidity.send'),
          };

          const requestParams = [[params]];
          let result = await this.$refs.signModal.sign(requestParams);
          if (!result) return { success: false };

          signedTxn = result.map((element) => {
            return new Uint8Array(Buffer.from(element, 'base64'));
          });
        }
      } catch (error) {
        console.error(error);
        return { success: false, data: error.message };
      }
      return { success: true, data: signedTxn[0] };
    },
    downloadAsCsv(responses) {
      let csv = 'WALLET,AVG_POOL_BALANCE,YARN_REWARDS,MESSAGE\n';
      responses.forEach((response, idx) => {
        csv += `${this.transactions[idx].receiver},${
          this.transactions[idx].averageBalance / 10 ** this.assetDecimals
        },${this.transactions[idx].amount},${response.txId ? 'success' : response}\n`;
      });

      const hiddenElement = document.createElement('a');
      hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
      hiddenElement.target = '_blank';

      //provide the name for the CSV file to be downloaded
      hiddenElement.download = 'Liquidity_Rewards.csv';
      hiddenElement.click();
    },
  },
};
</script>

<style scoped>
.sp-form {
  max-width: 200px;
}
</style>
