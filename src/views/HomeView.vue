<template>
  <div class="home sp-banner d-flex flex-column">
    <div class="sp-banner-text">
      <h1>{{ $t('views.home.text.spindle') }}</h1>
    </div>
    <div class="sp-banner-text my-auto ml-auto">
      <h2 class="mr-6">{{ $t('views.home.text.algorand_1') }}</h2>
      <h4 class="text-right">{{ $t('views.home.text.algorand_2') }}</h4>
    </div>
    <div class="sp-banner-text mx-auto">
      <h6>{{ $t('views.home.text.description') }}</h6>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView',
  components: {},
};
</script>

<style scoped>
.sp-banner {
  overflow-x: hidden;
}
.sp-banner-text:first-child {
  position: relative;
  animation: animateleft 2.4s;
}
.sp-banner-text:nth-child(2) {
  position: relative;
  animation: animateright 3s;
}
@keyframes animateleft {
  from {
    left: -100vw;
    opacity: 0;
  }
  20% {
    right: -100vw;
    opacity: 1;
  }
  to {
    left: 0;
    opacity: 1;
  }
}
@keyframes animateright {
  0% {
    right: -100vw;
    opacity: 0;
  }
  40% {
    right: -100vw;
    opacity: 1;
  }
  100% {
    right: 0;
    opacity: 1;
  }
}
h1 {
  font-size: min(max(3.5vw, 35px), 70px);
}
h2 {
  font-size: min(max(2.5vw, 25px), 50px);
}
h4 {
  font-size: min(max(1.8vw, 18px), 36px);
}
h6 {
  font-size: min(max(1vw, 14px), 20px);
}
.sp-banner-text {
  padding: 1.5rem;
  width: max-content;
}
.sp-banner-text:last-child {
  max-width: 100%;
  width: 100%;
  text-align: center;
  background: transparent;
}
.sp-banner-text:not(:last-child) {
  max-width: 80%;
}

.sp-banner-text > * {
  margin: 0;
  line-height: 1.5;
}

.sp-banner {
  height: 100%;
  width: 100%;
  background: url(../assets/img/banner.png);
  background-repeat: no-repeat;
  background-position: 75% center;
  background-size: cover;
  background-attachment: fixed;
  padding-top: 3rem;
}
</style>
