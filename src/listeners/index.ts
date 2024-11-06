import { registerTokenListener } from 'src/listeners/token/index';

export const registerWebsocketListeners=function() {

  registerTokenListener();
}
