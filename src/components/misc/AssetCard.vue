<template>
  <div class="m-2 sp-card" :class="{ 'sp-missing-card': wallet && assetAmount === 0 }">
    <div class="d-flex flex-column align-items-center">
      <h5 class="mb-2 text-center">{{ card.params.name }}</h5>
      <div class="d-flex align-items-center">
        <b-button
          variant="link"
          target="_blank"
          class="d-flex align-items-center sp-text-small text-dark"
          :href="`https://www.nftexplorer.app/asset/${card.index}`"
          >{{ card.index }}<b-icon height="14px" icon="box-arrow-up-right" class="ml-1"
        /></b-button>
        <b-button
          variant="link"
          size="sm"
          class="d-flex align-items-center p-0 text-dark"
          @click="copyText(card.index)"
        >
          <b-icon height="14px" icon="clipboard" />
        </b-button>
      </div>
      <div class="sp-card-image">
        <img :src="`https://ipfs.io/ipfs/${card.params.url.replace('ipfs://', '')}`" />
      </div>
      <template>
        <slot name="footer" v-bind="{ assetAmount }"></slot>
      </template>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'sp-asset-card',
  props: {
    card: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapState({
      wallet: (state) => state.wallet.wallet,
      account: (state) => state.wallet.account,
    }),
    assetAmount() {
      if (typeof this.account === 'undefined') {
        return 0;
      }
      const asset = this.account.assets.find((asset) => asset['asset-id'] === this.card.index);
      if (typeof asset === 'undefined') {
        return 0;
      }
      return asset.amount;
    },
  },
  methods: {
    copyText(text) {
      navigator.clipboard.writeText(text);
      this.$bvToast.toast(text, {
        title: this.$t('components.misc.assetCard.copied'),
        autoHideDelay: 3000,
        variant: 'success',
        toaster: 'b-toaster-bottom-center text-break',
        solid: true,
      });
    },
  },
};
</script>

<style scoped>
.sp-card {
  background: var(--light);
  width: 210px;
  padding: 1rem;
}
.sp-card-image {
  position: relative;
  width: 100%;
  min-height: 111px;
  background-image: url('@/assets/img/spinner.svg');
  background-position: center;
  background-repeat: no-repeat;
}
.sp-missing-card:not(:hover) .sp-card-image::after {
  content: ' ';
  display: block;
  width: 100%;
  height: 100%;
  background-color: var(--light);
  position: absolute;
  top: 0;
  z-index: 1;
  opacity: 0.5;
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
}
</style>
