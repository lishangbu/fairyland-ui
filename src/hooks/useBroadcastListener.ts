/* eslint-disable */
import { createClientChannelInstance } from 'src/utils/net.ts';
//@ts-ignore
import { ExternalMessage } from 'src/proto/type';
import { BroadcastParam } from 'src/utils/net';

export class BroadcastParamWithResult extends BroadcastParam {
  returnType?: any;
}

/**
 * 发起ProtobufRequest参数风格的请求
 * 将ws的监听回调转换为Promise风格
 * 返回值如果存在，也要是PB类
 * @param broadcastParamWithResult 广播参数
 */
export const useBroadcastListener = function(broadcastParamWithResult: BroadcastParamWithResult) {
  const { title, cmd, subCmd, returnType } = broadcastParamWithResult;
  return new Promise<string | void | ExternalMessage | typeof returnType>((resolve, reject) => {
    createClientChannelInstance().ofListen({
      title, cmd, subCmd, callbackSuccess(result) {
        if (returnType != null) {
          try {
            const decodeData = returnType.constructor.decode(result?.data);
            console.log('广播监听调用', returnType.constructor.name, 'decode方法解码数据', decodeData);
            resolve(decodeData);
          } catch (error) {
            console.log('调用decode方法失败，请确保返回值类型为已经静态生成的Proto类,当前类型为', returnType.constructor.name);
            resolve(result);
          }

        } else {
          // 返回值不存在则不返回
          resolve(undefined);
          console.log('广播监听回调成功，但没有返回值');
        }
      }, callbackFailure(result) {
        // 失败时默认回传错误信息
        console.error('广播监听调用返回结果,但失败了!错误详情:', result);
        reject(result?.validMsg);
      }
    });
  });
};
