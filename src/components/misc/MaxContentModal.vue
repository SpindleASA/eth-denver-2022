<template>
  <b-modal
    :id="modalId"
    dialog-class="sp-max-content"
    body-class="d-flex flex-column align-items-center"
    :title="title"
    centered
  >
    <slot />

    <template #modal-footer="{ ok, cancel }">
      <b-button v-if="hasCancel" variant="outline-primary" @click="cancel">{{ $t('misc.cancel') }}</b-button>
      <b-button v-if="hasOK" variant="primary" @click="ok">{{ $t('misc.ok') }}</b-button>
    </template>
  </b-modal>
</template>

<script>
export default {
  name: 'sp-max-content-modal',
  props: {
    title: {
      type: String,
    },
    hasCancel: {
      type: Boolean,
      default: true,
    },
    hasOK: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      modalId: 'modal-' + Math.random() * Date.now(),
    };
  },
  methods: {
    show() {
      this.$bvModal.show(this.modalId);
      return new Promise((resolve) => {
        const hideFunction = (bvEvent, modalId) => {
          if (modalId !== this.modalId) {
            return;
          }
          this.$root.$off('bv::modal::hide', hideFunction);
          resolve(bvEvent);
        };
        this.$root.$on('bv::modal::hide', hideFunction);
      });
    },
  },
};
</script>
