import Vue from 'vue';
import VueI18n from 'vue-i18n';
import en from './lang/en.json';

Vue.use(VueI18n);

const messages = {
  en: en,
};

const i18n = new VueI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: messages,
  dateTimeFormats: {
    en: {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      },
      long: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      },
    },
    de: {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      },
      long: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric',
      },
    },
  },
});

export default i18n;
