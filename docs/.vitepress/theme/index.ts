import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';
import DocDiagram from './components/DocDiagram.vue';
import HomeHeroVisual from './components/HomeHeroVisual.vue';
import HomeIcon from './components/HomeIcon.vue';
import './styles.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('DocDiagram', DocDiagram);
    app.component('HomeHeroVisual', HomeHeroVisual);
    app.component('HomeIcon', HomeIcon);
  },
} satisfies Theme;
