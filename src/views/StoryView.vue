<template>
  <div class="sp-story">
    <template v-if="currentStory">
      <div class="sp-story-header" :style="`background-image: url(${currentStory.image})`">
        <div class="sp-story-header-content">
          <b-button variant="link" :title="$t('views.story.button.back')" :to="{ path: '/stories' }">
            <b-icon icon="chevron-left" />
          </b-button>
          <h1 class="text-center">{{ currentStory.name }}</h1>
        </div>
      </div>
      <div class="sp-story-content">
        <div class="d-flex mb-4">
          <b-button
            variant="link"
            :to="{ path: previousChapter }"
            :disabled="!previousChapter"
            :title="$t('views.story.button.previous')"
          >
            <b-icon icon="chevron-left" />
          </b-button>
          <b-dropdown :text="currentChapter.name" variant="outline-primary" class="mx-auto">
            <b-dropdown-item-button
              v-for="chapter in currentStory.chapters"
              :active="chapter.id === currentChapter.id"
              :key="chapter.id"
              @click="goTo(chapter)"
              >{{ chapter.name }}</b-dropdown-item-button
            >
          </b-dropdown>
          <b-button
            variant="link"
            :to="{ path: nextChapter }"
            :disabled="!nextChapter"
            :title="$t('views.story.button.next')"
          >
            <b-icon icon="chevron-right" />
          </b-button>
        </div>
        <div class="sp-markdown-wrapper">
          <VueMarkdown v-if="computedMarkdown">{{ computedMarkdown }}</VueMarkdown>
        </div>
        <div class="d-flex align-items-center justify-content-center my-4">
          <h5 class="my-3">
            <span>{{ storyShortWallet[0] }}</span>
            <sp-icon height="20px" />
            <span>{{ storyShortWallet[1] }}</span>
          </h5>
          <b-button variant="link" class="d-flex align-items-center text-dark" @click="copyWallet">
            <b-icon height="16px" icon="clipboard" />
          </b-button>
        </div>
        <div class="d-flex justify-content-center">
          <TipButton v-if="wallet" :storyWallet="currentStory.wallet" :story="currentStory.name" />
          <h6 v-else>{{ $t('components.tipping.connect') }}</h6>
        </div>
        <Voting v-if="currentChapter.voting" v-bind="currentChapter.voting" :wallet="currentStory.wallet" />
        <div class="mt-4 d-flex">
          <b-button
            variant="link"
            :to="{ path: previousChapter }"
            :disabled="!previousChapter"
            :title="$t('views.story.button.previous')"
          >
            <b-icon icon="chevron-left" />
          </b-button>
          <b-dropdown :text="currentChapter.name" variant="outline-primary" class="mx-auto">
            <b-dropdown-item-button
              v-for="chapter in currentStory.chapters"
              :active="chapter.id === currentChapter.id"
              :key="chapter.id"
              @click="goTo(chapter)"
              >{{ chapter.name }}</b-dropdown-item-button
            >
          </b-dropdown>
          <b-button
            variant="link"
            :to="{ path: nextChapter }"
            :disabled="!nextChapter"
            :title="$t('views.story.button.next')"
          >
            <b-icon icon="chevron-right" />
          </b-button>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import VueMarkdown from 'vue-markdown';
import Voting from '@/components/voting/Voting';
import TipButton from '@/components/tipping/TipButton';
import utils from '@/utils/algorand';

export default {
  name: 'StoryView',
  components: {
    VueMarkdown,
    Voting,
    TipButton,
  },
  metaInfo() {
    if (!this.currentStory) {
      return { title: `${this.$t(`views.${this.$route.name}.title`)} | ${this.$t('app.title')}` };
    }
    return { title: `${this.currentChapter.name} | ${this.currentStory.name} | ${this.$t('app.title')}` };
  },
  data() {
    return {
      currentStory: undefined,
      currentChapter: undefined,
      markdown: undefined,
    };
  },
  computed: {
    ...mapState({
      availableStories: (state) => state.stories.availableStories,
      wallet: (state) => state.wallet.wallet,
    }),
    computedMarkdown() {
      if (!this.markdown) return '';
      let markdown = this.markdown.replace(/(!\[[^\]]+\]\((?!http))/, `$1${this.currentStory.source}/`);
      markdown = markdown.replace(/(src="(?!http))/, `$1${this.currentStory.source}/`);
      return markdown;
    },
    chapterIndex() {
      if (!this.currentStory) return;
      return this.currentStory.chapters.findIndex((chapter) => chapter.id === this.currentChapter.id);
    },
    previousChapter() {
      if (this.chapterIndex === 0) return;
      return `/stories/${this.currentStory.id}/${this.currentStory.chapters[this.chapterIndex - 1].id}`;
    },
    nextChapter() {
      if (this.currentStory.chapters.length <= this.chapterIndex + 1) return;
      return `/stories/${this.currentStory.id}/${this.currentStory.chapters[this.chapterIndex + 1].id}`;
    },
    storyShortWallet() {
      return utils.getShortWallet(this.currentStory.wallet);
    },
  },
  beforeRouteEnter(to, from, next) {
    // remove trailing slash
    let path = to.fullPath;
    if (path.endsWith('/')) {
      path = path.slice(0, path.length - 1);
      next(path);
    }
    next();
  },
  methods: {
    async setStory() {
      const chapterId = this.$route.params.chapterId;
      const storyId = this.$route.params.storyId;
      const story = await this.$store.dispatch('stories/getStory', { chapterId, storyId });
      this.currentStory = story.story;
      this.currentChapter = story.chapter;
      this.markdown = undefined;
      this.markdown = await this.$store.dispatch(
        'stories/getContent',
        `${this.currentStory.source}/${this.currentChapter.id}`
      );
    },
    goTo(chapter) {
      this.$router.push({ path: `/stories/${this.currentStory.id}/${chapter.id}` });
    },
  },
  watch: {
    $route: {
      handler() {
        this.setStory();
      },
      immediate: true,
    },
  },
};
</script>

<style scoped>
.sp-story-header {
  width: 100%;
  display: flex;
  justify-content: center;
  background-position: center;
  background-size: cover;
}
.sp-story-header-content {
  padding-top: 0.5rem;
  padding-bottom: 3rem;
  width: 100%;
  height: 100%;
}
.sp-story-header-content > h1 {
  margin-bottom: 0px;
  padding: 0rem 2rem;
}
.sp-story {
  height: 100%;
  width: 100%;
  align-self: flex-start;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.sp-story-content {
  flex-grow: 1;
  width: 100%;
  max-width: 1000px;
  padding: 3rem 2rem 2rem 2rem;
  display: flex;
  flex-direction: column;
}
.sp-markdown-wrapper {
  margin: auto;
}
</style>
<style>
.sp-story-content * {
  max-width: 100%;
}
</style>
