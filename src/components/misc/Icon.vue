<template>
  <component :is="name + '-icon'" />
</template>

<script>
const requireComponent = require.context('./icon', false, /\w+\.vue$/);
const components = {};
requireComponent.keys().forEach((fileName) => {
  const componentConfig = requireComponent(fileName);
  const componentName = fileName
    .replace(/((\.\/)|(\.vue))/g, '')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();

  components[componentName] = componentConfig.default;
});

export default {
  name: 'sp-icon',
  components,
  props: {
    name: {
      default: 'spindle',
    },
  },
};
</script>

<style scoped>
svg {
  height: 100%;
}
</style>
