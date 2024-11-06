import { ExternalMessage, LongValue } from 'src/proto/type';
import { CmdKit } from 'src/utils/cmdKit.ts';
import { LocalStorage, Notify } from 'quasar';
import { getErrorMessage } from 'src/constants/errorCodes.ts';
import { registerWebsocketListeners } from 'src/listeners';
import { useTokenStore } from 'stores/token.ts';

//region 一些基础接口定义
/**
 * Callback 接口定义了成功和失败的回调函数类型。
 */
interface Callback {
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

/**
 * Param 接口定义了请求参数的结构。
 */
interface Param extends Callback {
  /**
   * 请求的标题，描述该请求的目的或类型。
   */
  title: string;

  /**
   * 主命令编号，用于标识请求的类型。
   */
  cmd: number;

  /**
   * 子命令编号，用于进一步细分主命令的具体操作。
   */
  subCmd: number;
}

/**
 * CallbackHandler 接口定义了处理回调的基本操作。
 */
interface CallbackHandler {
  /**
   * 注册一个回调函数，以便在特定事件发生时调用。
   * @param callback - 要注册的回调函数，符合 Callback 接口的结构。
   */
  register(callback: Callback): void;

  /**
   * 检查指定的消息 ID 是否存在。
   * @param callbackHandlerId - 要检查的消息回调ID。
   * @returns 如果消息 ID 存在，则返回 true；否则返回 false。
   */
  exist(callbackHandlerId: number): boolean;

  /**
   * 处理接收到的外部消息。
   * @param message - 要处理的外部消息，符合 ExternalMessage 结构。
   */
  handle(message: ExternalMessage): void;

  /**
   * 移除一个回调函数
   * @param callback - 注册回调函数执行器
   * @param callback - 要注册的回调函数，符合 Callback 接口的结构。
   */
  remove(callback: Callback): void;
}

//endregion

//region 主动请求相关

/**
 * 前端消息号，主动请求时会带上
 */
let msgId = 1;


/**
 * 默认回调处理
 */
abstract class AbstractCallbackHandler implements CallbackHandler {
  callbackMap: Map<number, Callback> = new Map<number, Callback>();

  exist(callbackHandlerId: number): boolean {
    return this.callbackMap.has(callbackHandlerId);
  }

  remove(callback: Callback): void {
    for (const [key, val] of this.callbackMap) {
      if (val === callback) {
        this.callbackMap.delete(key);
      }
    }
  }


  /**
   * 当查询到注册器时，执行操作
   * @param message
   * @param callback
   */
  protected handleWhenFindCallback(message: ExternalMessage, callback: Callback | undefined) {
    if (callback == undefined) {
      return;
    }
    const { callbackSuccess, callbackFailure } = callback;

    // 删除监听器
    this.remove(callback);


    const cmd = CmdKit.getCmd(message.cmdMerge);
    const subCmd = CmdKit.getSubCmd(message.cmdMerge);

    console.log('接收响应 - [msgId%s(%s-%s)]',
      message.msgId,
      cmd,
      subCmd
    );
    if (message.responseStatus != 0) {
      console.error('[错误码:', message.responseStatus, '] - [消息:', message.validMsg, ']');
      Notify.create({
        type: 'negative',
        message: message.validMsg
      });
      if (callbackFailure) {
        callbackFailure(message);
      }
    } else {
      if (callbackSuccess) {
        callbackSuccess(message);
      }
    }
  }

  abstract handle(message: ExternalMessage): void;

  abstract register(callback: Callback): void;
}

/**
 * 请求参数
 */
export class RequestParam implements Param {
  title: string = '';
  cmd: number = 0;
  subCmd: number = 0;
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


/**
 * 包装后的请求参数，仅在内部使用
 */
class RequestParamWrapper extends RequestParam {
  // 为0代表广播，不为0代表普通请求
  msgId: number = 0;

  constructor(param: RequestParam) {
    super();
    const { title, cmd, subCmd, data, callbackSuccess, callbackFailure } = param;
    this.title = title;
    this.cmd = cmd;
    this.subCmd = subCmd;
    this.data = data;
    this.callbackSuccess = callbackSuccess;
    this.callbackFailure = callbackFailure;
    this.msgId = msgId;
    msgId++;
  }
}

/**
 * 主动请求回调
 */
class RequestCallbackHandler extends AbstractCallbackHandler {

  override register(paramWrapper: RequestParamWrapper) {
    // 主动请求用msgId作为注册回调的ID
    const { msgId: callbackHandlerId } = paramWrapper;
    this.callbackMap.set(callbackHandlerId, paramWrapper);
  }

  override handle(message: ExternalMessage) {
    const { msgId: callbackHandlerId } = message;
    if (this.exist(callbackHandlerId)) {
      const callback = this.callbackMap.get(callbackHandlerId);
      this.handleWhenFindCallback(message, callback);
    }
  }
}

//endregion

//region 广播相关

/**
 * 请求参数
 */
export class BroadcastParam implements Param {
  title: string = '';
  cmd: number = 0;
  subCmd: number = 0;
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

export class BroadcastCallbackHandler extends AbstractCallbackHandler {

  override register(broadcastParam: BroadcastParam) {
    // 广播使用cmdMerge作为注册回调的ID
    const { cmd, subCmd } = broadcastParam;
    const callbackHandlerId = CmdKit.merge(cmd, subCmd);
    this.callbackMap.set(callbackHandlerId, broadcastParam);
  }

  override handle(message: ExternalMessage) {
    // 广播使用cmdMerge作为注册回调的ID
    const { cmdMerge: callbackHandlerId } = message;
    if (this.exist(callbackHandlerId)) {
      const callbackHandler = this.callbackMap.get(callbackHandlerId);
      console.info('广播监听回调通知');
      this.handleWhenFindCallback(message, callbackHandler);
    }
  }
}

//endregion


export class ClientChannel {

  socket: WebSocket;
  onOpen: () => void;
  requestCallbackHandler = new RequestCallbackHandler();
  broadcastCallbackHandler = new BroadcastCallbackHandler();
  heartbeatTimer: NodeJS.Timeout | number | undefined;


  constructor(url: string) {
    this.onOpen = function() {
    };

    const self = this;

    this.socket = new WebSocket(url);
    this.socket.binaryType = 'arraybuffer';

    // 连接成功时触发
    this.socket.onopen = function() {
      console.log('WebSocket 连接已打开');
      self.onOpen();
      // 注册WS相关监听器
      registerWebsocketListeners();
      // 注册心跳定时器
      self.heartbeatTimer = setInterval(() => {
        if (self.socket.readyState === WebSocket.OPEN) {
          const heartBeatMessage = ExternalMessage.create();
          heartBeatMessage.cmdCode = 0;
          self.socket.send(ExternalMessage.encode(heartBeatMessage).finish());
        }
      }, 50000);
    };

    // 接收到消息时触发
    this.socket.onmessage = function(event) {
      const externalMessage = ExternalMessage.decode(new Uint8Array(event.data));
      console.info('externalMessage', externalMessage.toJSON());
      self.read(externalMessage);
    };

    // 连接关闭时触发
    this.socket.onclose = function(event) {
      console.log('WebSocket 连接已关闭：', event.code, event.reason);
      Notify.create({
        type: 'negative',
        message: getErrorMessage(event.code, event.reason)
      });
      clearInterval(self.heartbeatTimer);
    };

    // 发生错误时触发
    this.socket.onerror = function(error) {
      console.error('WebSocket 连接错误：', error);
      LocalStorage.removeItem('token');
    };

  }


  /**
   * 主动请求游戏服务器
   * @param requestParam
   */
  request(requestParam: RequestParam) {
    this.requestCommand(new RequestParamWrapper(requestParam));
  }

  /**
   * 广播监听
   * @param broadcastParam
   */
  ofListen(broadcastParam: BroadcastParam) {
    const { callbackSuccess, callbackFailure } = broadcastParam;

    if (!callbackSuccess) {
      console.error('广播监听必需配置回调 callbackSuccess');
      return;
    }
    if (!callbackFailure) {
      console.error('广播监听必需配置回调 callbackFailure');
      return;
    }
    this.broadcastCallbackHandler.register(broadcastParam);
  }

  private requestCommand(requestData: RequestParamWrapper) {

    this.requestCallbackHandler.register(requestData);

    console.debug('发起[%s]请求 - [msgId:%s-%s] %o',
      requestData?.title,
      requestData?.msgId,
      requestData?.cmd,
      requestData?.subCmd);

    const { msgId, cmd, subCmd, data } = requestData;
    const message = ExternalMessage.create();
    message.msgId = msgId;
    message.cmdMerge = CmdKit.merge(cmd, subCmd);
    // 指定请求类型为业务
    message.cmdCode = 1;
    console.debug('cmdMerge', message.cmdMerge);
    if (data != undefined) {
      message.data = data;
    }
    // 序列化消息对象，并将其发送给服务器
    this.socket.send(ExternalMessage.encode(message).finish());
  }

  private read(message: ExternalMessage) {
    console.log('message', message);

    if (message.cmdCode === 0 && message.cmdMerge === 0) {
      // 接收服务器心跳回调，暂时先通过cmdCode和cmdMerge都为0判断
      console.info('💗');
      if (message.data) {
        const x = LongValue.decode(new Uint8Array(message.data));
        console.info(x);
      }
      return;
    }

    const msgId = message.msgId;
    // 有回调的，交给回调处理
    if (msgId != 0) {
      if (this.requestCallbackHandler.exist(msgId)) {
        this.requestCallbackHandler.handle(message);
        return;
      }
    } else {
      // 处理广播
      this.broadcastCallbackHandler.handle(message);
    }
  }
}

function parseWsUrl() {
  // 解析 WebSocket
  const url = new URL(import.meta.env.VITE_WEBSOCKET_URL);
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
};

let clientChannel: ClientChannel;

export const createClientChannelInstance = function() {
  if (clientChannel == undefined) {
    clientChannel = new ClientChannel(parseWsUrl());
  }
  return clientChannel;
};



