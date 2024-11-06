import { printANSI } from 'src/utils/screenLog';
import { registerWebsocketListeners } from 'src/listeners';

export default function Initializer(): void {
  printANSI();
  registerWebsocketListeners();
}
