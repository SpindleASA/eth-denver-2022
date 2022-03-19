<template>
  <div class="mt-5">
    <Rewards />
    <PoolHistory />
  </div>
</template>

<script>
import Rewards from '@/components/liquidity/Rewards';
import PoolHistory from '@/components/liquidity/PoolHistory';

export default {
  name: 'TokenView',
  components: {
    Rewards,
    PoolHistory,
  },
};
</script>
