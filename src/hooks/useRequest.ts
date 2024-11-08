/* eslint-disable */
import { createClientChannelInstance } from 'src/utils/net.ts';
//@ts-ignore
import { ExternalMessage } from 'src/proto/type';

/**
 * 发起ProtobufRequest参数风格的请求
 * 将ws的监听回调转换为Promise风格
 * 返回值如果存在，也要是PB类
 * @param title 功能名称
 * @param cmd 主路由
 * @param subCmd 子路由
 * @param data 请求数据,可能为空
 * @param returnType 返回类型，可能为空，不为空必须是PB类型
 */
export const useProtobufRequest = function useRequest(title: string, cmd: number, subCmd: number, data?: any, returnType?: any) {
  return new Promise<string | void | ExternalMessage | typeof returnType>((resolve, reject) => {
    let encodeData = undefined;
    if (data != null) {
      try {
        encodeData = data.constructor.encode(data).finish();
      } catch (error) {
        console.log('调用', data.constructor.name, ',encode方法失败，请确保入参已经静态生成的Proto类');
      }
    }
    createClientChannelInstance().request({
      title,
      cmd,
      subCmd,
      data: encodeData,
      callbackSuccess: result => {
        if (returnType != null) {
          try {
            const decodeData = returnType.constructor.decode(result?.data);
            console.log('调用', returnType.constructor.name, 'decode方法解码数据', decodeData);
            resolve(decodeData);
          } catch (error) {
            console.log('调用decode方法失败，请确保返回值类型为已经静态生成的Proto类,当前类型为', typeof returnType);
            resolve(result);
          }

        } else {
          // 返回值不存在则不返回
          resolve(undefined);
        }
      },
      callbackFailure: result => {
        // 失败时默认回传错误信息
        console.error('调用返回结果,但失败了!错误详情:', result);
        reject(result?.validMsg);
      }
    });
  });
};
