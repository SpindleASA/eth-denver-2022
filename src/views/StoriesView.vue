<template>
  <div class="sp-stories w-100 d-flex flex-column align-items-center">
    <div v-for="story in availableStories" :key="story.id" class="sp-story-item-wrapper w-100 p-3">
      <div class="sp-story-item d-flex">
        <div class="d-flex justify-content-center align-items-center">
          <img :src="story.image" class="sp-story-img" />
        </div>
        <div class="sp-story-info d-flex flex-column">
          <h1>{{ story.name }}</h1>
          <p>{{ story.description }}</p>
          <div class="mt-auto d-flex align-items-center flex-wrap">
            <p class="mb-0 pr-3 mr-auto mt-3">
              {{ $t('views.stories.text.chapters', { chapters: story.chapters.length }) }}
            </p>
            <div class="d-flex mt-3">
              <b-button variant="primary" :to="{ path: `/stories/${story.id}/${story.chapters[0].id}` }" class="mr-3">{{
                $t('views.stories.button.first')
              }}</b-button>
              <b-button
                variant="primary"
                :to="{ path: `/stories/${story.id}/${story.chapters[story.chapters.length - 1].id}` }"
                >{{ $t('views.stories.button.latest') }}</b-button
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'StoriesView',
  computed: {
    ...mapState({
      availableStories: (state) => state.stories.availableStories,
    }),
  },
};
</script>

<style scoped>
.sp-story-item-wrapper {
  max-width: 1000px;
}
.sp-story-item {
  background-color: var(--light);
  height: max-content;
  min-height: max(30vh, 200px);
}
.sp-story-img {
  width: 230px;
  padding: 1rem;
}
.sp-story-info {
  padding: 1rem;
  min-width: min-content;
}

@media (max-width: 576px) {
  .sp-story-item {
    justify-content: center;
    flex-wrap: wrap;
  }
}
</style>
