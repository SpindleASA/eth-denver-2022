<template>
  <div class="sp-wallet-connector">
    <b-button v-if="!wallet" :variant="variant" @click="$bvModal.show('modal-connect-wallet')">{{
      $t('components.misc.walletConnector.connect')
    }}</b-button>
    <b-button
      v-else
      :variant="variant"
      :disabled="isLoading"
      @click="$bvModal.show('modal-disconnect-wallet')"
      class="sp-wallet-button"
    >
      <span>{{ shortWallet[0] }}</span>
      <sp-icon height="20px" />
      <span>{{ shortWallet[1] }}</span>
    </b-button>
    <b-modal
      id="modal-connect-wallet"
      :title="$t('components.misc.walletConnector.connect')"
      hide-footer
      dialog-class="sp-max-content"
      body-class="d-flex flex-column align-items-center"
      centered
    >
      <b-button variant="primary" class="m-1 w-100 text-left" @click="connectPeraWallet()"
        ><sp-icon name="pera" height="20px" class="mr-2" />{{ $t('components.misc.walletConnector.pera') }}</b-button
      >
      <b-button variant="primary" class="m-1 w-100 text-left" @click="connectMyAlgoWallet()"
        ><sp-icon name="myalgo" height="20px" class="mr-2" />{{
          $t('components.misc.walletConnector.myalgo')
        }}</b-button
      >
    </b-modal>
    <b-modal
      id="modal-disconnect-wallet"
      :title="$t('components.misc.walletConnector.options')"
      hide-footer
      dialog-class="sp-max-content"
      body-class="d-flex flex-column align-items-center"
      centered
    >
      <h6 v-if="wallet">
        <span>{{ shortWallet[0] }}</span>
        <sp-icon height="20px" />
        <span>{{ shortWallet[1] }}</span>
      </h6>
      <b-button variant="outline-danger" class="m-1 w-100" @click="disconnectWallet()">{{
        $t('components.misc.walletConnector.disconnect')
      }}</b-button>
    </b-modal>
  </div>
</template>

<script>
import MyAlgoConnect from '@randlabs/myalgo-connect';
import WalletConnect from '@walletconnect/client';
import QRCodeModal from 'algorand-walletconnect-qrcode-modal';

import { mapState, mapGetters } from 'vuex';

const myAlgoConnect = new MyAlgoConnect();

export default {
  name: 'sp-wallet-connector',
  props: {
    variant: {
      type: String,
      default: 'primary',
    },
  },
  data() {
    return {
      connector: undefined,
    };
  },
  computed: {
    ...mapGetters({
      shortWallet: 'wallet/shortWallet',
    }),
    ...mapState({
      wallet: (state) => state.wallet.wallet,
      walletType: (state) => state.wallet.walletType,
      isLoading: (state) => {
        // all modules that depend on the wallet should be checked here
        return state.zine.isLoading || state.voting.isLoading;
      },
    }),
  },
  async created() {
    this.setConnector();
  },
  methods: {
    setConnector() {
      // Create a connector
      this.connector = new WalletConnect({
        bridge: 'https://bridge.walletconnect.org',
        qrcodeModal: QRCodeModal,
      });

      Object.assign(this.connector._clientMeta, {
        description: 'Spindle ASA',
        icons: ['https://spindle-buidl.herokuapp.com/img/icon.png'],
        name: 'Spindle ASA',
        url: 'https://www.spindle-buidl.herokuapp.com',
      });
    },
    async connectMyAlgoWallet() {
      let accountsSharedByUser;
      try {
        accountsSharedByUser = await myAlgoConnect.connect({
          shouldSelectOneAccount: true,
        });
      } catch (error) {
        return;
      }
      this.$store.dispatch('wallet/setWallet', {
        address: accountsSharedByUser[0].address,
        type: 'my-algo',
      });
      this.$bvModal.hide('modal-connect-wallet');
    },
    async connectPeraWallet() {
      const accountSharedByUser = (
        await new Promise((resolve) => {
          // Check if connection is already established
          if (!this.connector.connected) {
            // create new session
            this.setConnector();
            this.connector.createSession();
          } else {
            resolve(this.connector._accounts);
          }

          // Subscribe to connection events
          this.connector.on('connect', (error, payload) => {
            const { accounts } = payload.params[0];
            resolve(accounts);
          });

          this.connector.on('session_update', (error, payload) => {
            const { accounts } = payload.params[0];
            resolve(accounts);
          });
        })
      )[0];
      this.$store.dispatch('wallet/setWallet', {
        address: accountSharedByUser,
        type: 'pera',
      });
      this.$bvModal.hide('modal-connect-wallet');
    },
    async disconnectWallet() {
      if (this.walletType === 'pera') {
        await this.connector.killSession();
      }
      this.$store.dispatch('wallet/setWallet', undefined);
      this.$bvModal.hide('modal-disconnect-wallet');
    },
  },
  watch: {
    wallet: {
      handler(newValue) {
        this.$store.dispatch('wallet/getAccountInfo', newValue);
      },
      immediate: true,
    },
  },
};
</script>

<style scoped>
.sp-wallet-button > img {
  height: 28px;
  margin: -3px 0px;
}
</style>
