<template>
  <b-modal :id="modalId" centered :hide-header="true" no-close-on-backdrop>
    <span>{{ $t('components.misc.peraSignModal.sign') }}</span>
    <template #modal-footer="{ cancel }">
      <b-button variant="outline-primary" @click="cancel">{{ $t('misc.cancel') }}</b-button>
    </template>
  </b-modal>
</template>

<script>
import { mapState } from 'vuex';
import WalletConnect from '@walletconnect/client';
import QRCodeModal from 'algorand-walletconnect-qrcode-modal';
import { formatJsonRpcRequest } from '@json-rpc-tools/utils';

export default {
  name: 'sp-pera-sign-modal',
  data() {
    return {
      connector: undefined,
      modalId: 'modal-pera-' + Math.random() * Date.now(),
    };
  },
  computed: {
    ...mapState({
      walletType: (state) => state.wallet.walletType,
    }),
  },
  methods: {
    async sign(requestParams) {
      const request = formatJsonRpcRequest('algo_signTxn', requestParams);
      let result;

      this.$bvModal.show(this.modalId);
      result = await new Promise((resolve, reject) => {
        const hideFunction = (_, modalId) => {
          if (modalId === this.modalId) {
            // has to be handled by the method calling sign()
            reject(new Error('Transactions cancelled'));
            this.$root.$off('bv::modal::hide', hideFunction);
          }
        };
        this.$root.$on('bv::modal::hide', hideFunction);

        this.connector
          .sendCustomRequest(request)
          .then((response) => {
            this.$root.$off('bv::modal::hide');
            resolve(response);
          })
          .catch((error) => {
            // has to be handled by the method calling sign()
            reject(error);
          });
      });

      this.$bvModal.hide(this.modalId);
      return result;
    },
    setConnector() {
      // Create a connector
      this.connector = new WalletConnect({
        bridge: 'https://bridge.walletconnect.org', // Required
        qrcodeModal: QRCodeModal,
      });

      Object.assign(this.connector._clientMeta, {
        description: 'Spindle ASA',
        icons: ['https://spindle-buidl.herokuapp.com/img/icon.png'],
        name: 'Spindle ASA',
        url: 'https://www.spindle-buidl.herokuapp.com',
      });

      if (!this.connector.connected) {
        // create new session
        this.connector.createSession();
      }
    },
  },
  watch: {
    walletType: {
      handler(newValue) {
        if (newValue === 'pera') {
          this.setConnector();
        }
      },
      immediate: true,
    },
  },
};
</script>
