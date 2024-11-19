import { useWebsocketStore } from 'stores/websocket';

/**
 * Vue 应用挂载以后执行初始化
 * @constructor
 */
export default function Initializer(): void {
  useWebsocketStore().initWebsocketInstance();
}
