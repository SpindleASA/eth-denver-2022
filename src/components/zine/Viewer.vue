<template>
  <div class="w-100 d-flex flex-column align-items-center sp-zine-cards">
    <h5 class="p-3 mb-4" v-if="!wallet" v-html="$t('components.zine.viewer.connect')"></h5>
    <div class="d-flex align-items-center flex-wrap justify-content-center">
      <AssetCard v-for="card in zineCards" :key="card.index" :card="card">
        <template v-slot:footer="{ assetAmount }">
          <div class="py-3 sp-text-small" v-if="wallet">
            {{ $t('components.zine.viewer.possession', { assetAmount }) }}
          </div>
          <div v-if="wallet" class="d-flex justify-content-center w-100">
            <b-button variant="primary" @click="viewCard(card.index)" :disabled="assetAmount === 0">{{
              $t('components.zine.viewer.view')
            }}</b-button>
          </div>
        </template>
      </AssetCard>
    </div>
    <b-modal
      id="modal-viewer"
      size="lg"
      dialog-class="sp-viewer"
      body-class="d-flex flex-column align-items-center"
      :title="((selectedCard || {}).params || {}).name"
      hide-footer
    >
      <PDFJSViewer height="100%" width="100%" :fileName="pdf" />
    </b-modal>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import AssetCard from '@/components/misc/AssetCard.vue';
import PDFJSViewer from '@/components/misc/PDFJSViewer.vue';

export default {
  name: 'sp-viewer',
  components: {
    AssetCard,
    PDFJSViewer,
  },
  data() {
    return {
      selectedCardId: undefined,
      pdf: undefined,
    };
  },
  computed: {
    ...mapState({
      wallet: (state) => state.wallet.wallet,
      zineCards: (state) => state.zine.zineCards,
      account: (state) => state.wallet.account,
    }),
    selectedCard() {
      if (typeof this.selectedCardId === 'undefined') {
        return undefined;
      }
      return this.zineCards.find((card) => card.index === this.selectedCardId);
    },
  },
  created() {
    window.addEventListener('resize', this.onResize);

    this.$store.dispatch('zine/getZineCards');
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
  },
  methods: {
    async viewCard(cardId) {
      // if we don't have a pdf loaded or a different pdf is requested
      if (this.selectedCardId !== cardId || !this.pdf) {
        this.$store.dispatch('zine/setIsLoading', true);
        this.selectedCardId = cardId;

        // load the pdf
        const response = await this.$store.dispatch('zine/getPDF', {
          address: this.wallet,
          assetId: cardId,
        });
        // check if loaded
        if (!response.success) {
          this.$bvToast.toast(response.data, {
            title: this.$t('misc.error'),
            autoHideDelay: 10000,
            variant: 'danger',
            toaster: 'b-toaster-bottom-center',
            bodyClass: 'text-break',
            solid: true,
          });
          this.$store.dispatch('zine/setIsLoading', false);
          return;
        } else {
          this.pdf = response.data;
        }

        this.$store.dispatch('zine/setIsLoading', false);
      }
      this.$bvModal.show('modal-viewer');
    },
  },
};
</script>

<style>
.sp-viewer .modal-body {
  padding: 0px !important;
}

.sp-viewer {
  margin: 0px !important;
  max-width: 100vw !important;
  width: 100vw !important;
}

.sp-viewer .modal-content {
  height: 100vh !important;
  border: 0px;
  border-radius: 0px;
}

.sp-zine-cards .sp-card-image {
  height: 252px;
}
</style>
