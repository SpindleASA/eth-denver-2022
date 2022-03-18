<template>
  <div>
    <!-- this component uses the PDFJS prebuild from 
    https://mozilla.github.io/pdf.js/getting_started/#download
    with a custom toolbar -->
    <iframe height="100%" width="100%" :src="`${getFilePath}`"></iframe>
  </div>
</template>

<script>
export default {
  name: 'sp-pdf-js-viewer',
  props: {
    fileName: String,
  },
  computed: {
    getFilePath: function () {
      if (this.fileName !== '') {
        return 'lib/web/viewer.html?file=' + this.fileName;
      }
      return 'lib/web/viewer.html';
    },
  },
};
</script>
<style scoped>
div {
  width: 100%;
  height: 100%;
}
</style>
