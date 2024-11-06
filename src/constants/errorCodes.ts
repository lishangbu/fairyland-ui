/**
 * 获取与错误代码对应的异常信息。
 *
 * @param errorCode - 错误代码
 * @param defaultMessage - 默认错误消息
 * @returns 错误消息或默认消息
 */
export function getErrorMessage(
  errorCode: number,
  defaultMessage: string = '未知错误，请稍后再试。'
): string {
  // 如果错误代码存在，则返回对应的错误信息，否则返回默认信息
  return errorCodes[errorCode.toString()] || defaultMessage;
}

const errorCodes: { readonly [key: string]: string } = {
  1006: '您已离线'
};
