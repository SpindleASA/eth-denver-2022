import axios from 'axios';

const stories = {
  namespaced: true,
  state: {
    availableStories: undefined,
  },
  actions: {
    resetState(context) {
      // This is a PoC. For future story support, these informations will be stored in a database
      const stories = require('./stories.json');
      context.commit('SET_AVAILABLE_STORIES', stories);
    },
    async getStory(context, { storyId, chapterId }) {
      const story = context.state.availableStories.find((story) => story.id === storyId);
      const chapter = story.chapters.find((chapter) => chapter.id === chapterId);
      return { story, chapter };
    },
    async getContent(context, url) {
      let response;
      try {
        response = await axios.get(url);
        response = response.data;
      } catch (error) {
        console.error(error);
        response = error;
      }
      return response;
    },
  },
  mutations: {
    SET_AVAILABLE_STORIES(state, availableStories) {
      state.availableStories = availableStories;
    },
  },
};

export default stories;
