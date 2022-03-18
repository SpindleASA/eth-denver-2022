<template>
  <div class="d-flex h-100 w-100 justify-content-center align-items-center flex-column">
    <h1 class="mb-5">{{ $t('misc.error') }}</h1>
    <h3>{{ $t('misc.errorMessages.pageNotFound') }} :(</h3>
  </div>
</template>

<script>
export default {
  name: 'ErrorView',
};
</script>
