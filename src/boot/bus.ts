import { defineBoot } from '#q-app/wrappers';
import { EventBus } from 'quasar';

declare module 'vue' {
  interface ComponentCustomProperties {
    $bus: EventBus;
  }
}

export default defineBoot(({ app }) => {
  const bus = new EventBus();
  // 用于Options API
  app.config.globalProperties.$bus = bus;

  // 用于Composition API
  app.provide('bus', bus);
});
