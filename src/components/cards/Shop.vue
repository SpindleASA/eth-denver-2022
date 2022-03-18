<template>
  <div class="w-100 d-flex flex-column align-items-center">
    <div class="d-flex align-items-center flex-wrap justify-content-center">
      <AssetCard v-for="card in cards" :key="card.index" :card="card">
        <template #footer="{ assetAmount }">
          <div v-if="wallet" class="d-flex flex-column align-items-center w-100">
            <div class="text-primary px-2 pt-2 sp-text-small">
              {{ `${card.custom.available} of ${card.params.total} available` }}
            </div>
            <div class="text-primary px-2 pb-3 sp-text-small" v-if="wallet">
              {{ `${assetAmount} in possession` }}
            </div>
            <div v-if="wallet" class="d-flex justify-content-between w-100">
              <b-button
                variant="primary"
                @click="swapCard(card.index, 'sell', assetAmount)"
                :disabled="assetAmount === 0"
                >{{ $t('components.cards.sell') }}</b-button
              >
              <b-button
                variant="primary"
                @click="swapCard(card.index, 'buy', assetAmount)"
                :disabled="card.amount === 0"
                >{{ $t('components.cards.buy') }}</b-button
              >
            </div>
          </div>
        </template>
      </AssetCard>
    </div>

    <MaxContentModal :title="swapTitle" ref="amountModal">
      <template v-if="selectedCard">
        <h6>{{ selectedCard.params.name }}</h6>
        <b-input
          v-model="amount"
          type="number"
          min="1"
          :max="buySellOption === 'sell' ? selectedCardOwned : selectedCard.custom.available"
        />
        <div class="mt-3">{{ swapText }}</div>
      </template>
    </MaxContentModal>

    <PeraSignModal ref="signModal" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import AssetCard from '@/components/misc/AssetCard';
import MaxContentModal from '@/components/misc/MaxContentModal';
import MyAlgoConnect from '@randlabs/myalgo-connect';
import PeraSignModal from '@/components/misc/PeraSignModal';
import algosdk from 'algosdk';

const myAlgoConnect = new MyAlgoConnect();

export default {
  name: 'sp-shop',
  components: {
    AssetCard,
    MaxContentModal,
    PeraSignModal,
  },
  props: {
    cards: {
      type: Array,
      required: true,
    },
    buyOnly: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      selectedCardId: undefined,
      selectedCardOwned: 0,
      buySellOption: undefined,
      amount: 1,
      priceOption: 0,
    };
  },
  computed: {
    ...mapState({
      wallet: (state) => state.wallet.wallet,
      walletType: (state) => state.wallet.walletType,
    }),
    swapText() {
      if (!this.selectedCardId) return;
      const priceInfo = this.selectedCard.custom.prices[this.priceOption];
      const amount = this.amount * priceInfo.price;
      const currency = priceInfo.currency.unit;
      if (this.buySellOption === 'buy') {
        return this.$t('components.cards.pay', { amount, currency });
      } else {
        return this.$t('components.cards.receive', { amount, currency });
      }
    },
    swapTitle() {
      if (!this.selectedCardId) return;
      return this.buySellOption === 'sell' ? this.$t('components.cards.sell') : this.$t('components.cards.buy');
    },
    selectedCard() {
      if (typeof this.selectedCardId === 'undefined') {
        return undefined;
      }
      return this.cards.find((card) => card.index === this.selectedCardId);
    },
  },
  methods: {
    async swapCard(assetId, option, assetAmount) {
      this.$store.dispatch('cards/setIsLoading', true);

      this.selectedCardId = assetId;
      this.selectedCardOwned = assetAmount;
      this.buySellOption = option;

      const amountModalClose = await this.$refs.amountModal.show();
      if (amountModalClose.trigger !== 'ok') {
        this.$store.dispatch('cards/setIsLoading', false);
        return;
      }

      const txnResponse = await this.getTransactions();
      if (!txnResponse.success) {
        this.$bvToast.toast(txnResponse.data, {
          title: this.$t('misc.error'),
          autoHideDelay: 10000,
          variant: 'danger',
          toaster: 'b-toaster-bottom-center',
          bodyClass: 'text-break',
          solid: true,
        });
        this.$store.dispatch('cards/setIsLoading', false);
        return;
      }
      const { txns, signedTxn } = txnResponse.data;

      const signResponse = await this.signTxns(txns, signedTxn);
      if (!signResponse.success) {
        this.$bvToast.toast(signResponse.data, {
          title: this.$t('misc.error'),
          autoHideDelay: 10000,
          variant: 'danger',
          toaster: 'b-toaster-bottom-center',
          bodyClass: 'text-break',
          solid: true,
        });
        this.$store.dispatch('cards/setIsLoading', false);
        return;
      }
      const signedTxns = signResponse.data;
      signedTxns.push(signedTxn);

      await this.sendTransactions(signedTxns);
      this.$store.dispatch('cards/setIsLoading', false);
    },
    async getTransactions() {
      const response = await this.$store.dispatch('cards/getSwapTransactions', {
        assetId: this.selectedCardId,
        address: this.wallet,
        amount: parseInt(this.amount),
        option: this.buySellOption,
        currency: this.selectedCard.custom.prices[this.priceOption].currency.id,
      });
      if (!response.success) {
        return response;
      }
      const txns = response.data;
      const signedTxn = txns.pop();

      const decodedUnsigned = txns.map((txn) => algosdk.decodeUnsignedTransaction(txn));
      const decodedSigned = algosdk.decodeSignedTransaction(signedTxn);

      console.log('Transactions by user:', decodedUnsigned);
      console.log('Transactions by Spindle:', decodedSigned);

      return { success: response.success, data: { txns, signedTxn } };
    },
    async signTxns(txns, signedTxn) {
      let signedTxns;
      try {
        if (this.walletType === 'my-algo') {
          signedTxns = await myAlgoConnect.signTransaction(txns);
          signedTxns = signedTxns.map((txn) => txn.blob);
        } else {
          // get only raw txn from signed txn
          const decodedSigned = algosdk.decodeSignedTransaction(signedTxn).txn;
          const allTxns = [...txns, algosdk.encodeUnsignedTransaction(decodedSigned)];
          const txnsToSign = allTxns.map((txn, idx) => {
            const encodedTxn = Buffer.from(txn).toString('base64');

            const params = {
              txn: encodedTxn,
              message: 'Spindle ASA swap',
            };

            if (idx === allTxns.length - 1) {
              params.signers = [];
            }
            return params;
          });

          const requestParams = [txnsToSign];
          let result = await this.$refs.signModal.sign(requestParams);
          if (!result) return { success: false };

          result.pop();
          signedTxns = result.map((element) => new Uint8Array(Buffer.from(element, 'base64')));
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
      return { success: true, data: signedTxns };
    },
    async sendTransactions(signedTxns) {
      const response = await this.$store.dispatch('cards/sendTransactions', signedTxns);

      if (response.success) {
        await this.$store.dispatch('cards/getVotingCards');
        await this.$store.dispatch('wallet/getAccountInfo', this.wallet);

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
