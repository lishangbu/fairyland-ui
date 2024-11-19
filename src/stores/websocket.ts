import { defineStore } from 'pinia';
import { useTokenStore } from 'stores/token';
import { ExternalMessage, LongValue } from 'src/generated';
import { Notify } from 'quasar';
import { CmdKit } from 'src/utils/cmd-kit';

export type RequestParam = {
  /**
   * 前端消息号，主动请求时会带上,广播时该值为0
   */
  msgId: number;

  /**
   * 请求的标题，描述该请求的目的或类型。
   */
  title?: string;

  /**
   * 主命令编号，用于标识请求的类型。
   */
  cmd: number;

  /**
   * 子命令编号，用于进一步细分主命令的具体操作。
   */
  subCmd: number;

  /**
   * 请求数据
   */
  data?: Uint8Array;
  /**
   * 成功回调函数，在操作成功时被调用。
   * @param result - 包含网关消息的结果对象。
   */
  callbackSuccess?: (result: ExternalMessage) => void | null;

  /**
   * 失败回调函数，在操作失败时被调用。
   * @param result - 包含网关消息的结果对象。
   */
  callbackFailure?: (result: ExternalMessage) => void | null;

}

// 定义状态的类型
interface State {
  socket: WebSocket | undefined;
  heartbeatTimer: NodeJS.Timeout | number | undefined;
  messageHandlers: RequestParam[];
}


export const useWebsocketStore = defineStore('websocket', {
  persist: false,
  state: (): State => ({
    socket: undefined,
    messageHandlers: [],
    heartbeatTimer: undefined
  }),
  actions: {
    initWebsocketInstance: function(): WebSocket {
      if (this.socket == undefined) {
        const tokenStore = useTokenStore();
        const websocketStore = useWebsocketStore();
        this.socket = new WebSocket(parseWsUrl());
        this.socket.binaryType = 'arraybuffer';
        // 连接成功时触发
        this.socket.onopen = function() {
          console.info('WebSocket 连接已打开');
          tokenStore.registerValidateTokenListener();
          websocketStore.registerHeartbeatTimer();
        };
        // 接收到消息时触发
        this.socket.onmessage = function(event) {
          const externalMessage = ExternalMessage.decode(new Uint8Array(event.data));
          websocketStore.parseWsMsg(externalMessage);
        };
        // 连接关闭时触发
        this.socket.onclose = function(event) {
          console.info('WebSocket 连接已关闭：', event.code, event.reason);
          Notify.create({
            type: 'negative',
            message: '断开与服务器的链接'
          });
          websocketStore.unregisterHeartbeatTimer();
        };

        // 发生错误时触发
        this.socket.onerror = function(error) {
          console.error('WebSocket 连接错误：', error);
        };

      }
      return this.socket;
    },
    /**
     * 主动请求游戏服务器
     * @param requestParam
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    request(requestParam: RequestParam) {
      const { cmd, subCmd, msgId, data } = requestParam;
      this.messageHandlers.push(requestParam);
      const message = ExternalMessage.create();
      message.msgId = requestParam.msgId;
      message.cmdMerge = CmdKit.merge(cmd, subCmd);
      // 指定请求类型为业务
      message.cmdCode = 1;
      if (data != undefined) {
        message.data = data;
      }
      // 序列化消息对象，并将其发送给服务器
      this.socket?.send(ExternalMessage.encode(message).finish());
    },
    /**
     * 广播监听
     * @param broadcastParam
     */
    ofListen(broadcastParam: RequestParam) {
      const { title, cmd, subCmd, msgId } = broadcastParam;
      if (!broadcastParam.callbackSuccess) {
        console.error('广播监听[', title, ']必需配置回调 callbackSuccess');
        return;
      }
      if (!broadcastParam.callbackFailure) {
        console.error('广播监听[', title, ']必需配置回调 callbackFailure');
        return;
      }
      this.messageHandlers.push(broadcastParam);
    },
    registerHeartbeatTimer() {
      this.heartbeatTimer = setInterval(() => {
        if (this.socket != null && this.socket.readyState === WebSocket.OPEN) {
          const heartBeatMessage = ExternalMessage.create();
          heartBeatMessage.cmdCode = 0;
          this.socket.send(ExternalMessage.encode(heartBeatMessage).finish());
        }
      }, 50000);
    },
    unregisterHeartbeatTimer() {
      clearInterval(this.heartbeatTimer);
    },
    parseWsMsg(message: ExternalMessage) {
      if (message.cmdCode === 0 && message.cmdMerge === 0) {
        // 接收服务器心跳回调，暂时先通过cmdCode和cmdMerge都为0判断
        console.info('💗');
        if (message.data) {
          const serverTime = LongValue.decode(new Uint8Array(message.data));
          console.info(serverTime);
        }
        return;
      }

      const msgId = message.msgId;
      const cmdMerge = message.cmdMerge;
      // 有回调的，交给回调处理
      const cmd = CmdKit.getCmd(cmdMerge);
      const subCmd = CmdKit.getSubCmd(cmdMerge);
      let index = -1;
      for (let i = 0; i < this.messageHandlers.length; i++) {
        const messageHandler = this.messageHandlers[i];
        if (messageHandler !== undefined && messageHandler.msgId === msgId && messageHandler.cmd === cmd && messageHandler.subCmd === subCmd) {
          index = i;
          break;
        }
      }
      const handler = this.messageHandlers[index];
      if (index !== -1 && handler !== undefined) {

        const responseStatus = message.responseStatus;
        const validMsg = message.validMsg;
        if (responseStatus != 0) {
          console.error('[错误码:', responseStatus, '] - [消息:', validMsg, ']');
          Notify.create({
            type: 'negative',
            message: validMsg
          });
          if (handler.callbackFailure) {
            handler.callbackFailure(message);
          }
        } else {
          if (handler.callbackSuccess) {
            handler.callbackSuccess(message);
          }
        }
        // 删除监听器
        if (msgId !== 0) {
          this.messageHandlers.slice(index, 1);
        }
      }
    }
  }
});

function parseWsUrl() {
  // 解析 WebSocket
  const url = new URL(process.env.VUE_APP_WEBSOCKET_URL);
  const params = new URLSearchParams(url.search);
  const tokenStore = useTokenStore();
  if (tokenStore.isLoggedIn) {
    params.append('token', tokenStore.getTokenValue ?? '' as string);
  } else {
    params.delete('token');
  }
  // 重建 WebSocket URL
  url.search = params.toString();
  return url.toString();
}
