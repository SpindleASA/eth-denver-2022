import Vue from 'vue';
import VueRouter from 'vue-router';
import HomeView from '../views/HomeView.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/stories',
    name: 'stories',
    component: () => import('../views/StoriesView.vue'),
  },
  {
    path: '/stories/:storyId/:chapterId',
    name: 'story',
    component: () => import('../views/StoryView.vue'),
  },
  {
    path: '/warp-and-weft',
    name: 'zine',
    component: () => import('../views/ZineView.vue'),
  },
  {
    path: '*',
    name: 'Error',
    // lazy-loading
    component: () => import('@/views/ErrorView.vue'),
  },
  {
    path: '/voting-cards',
    name: 'voting-cards',
    component: () => import('../views/VotingCardsView.vue'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
