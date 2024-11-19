import type { ILoginRequestParam } from 'src/generated';
import { LoginRequestParam, TokenInfo } from 'src/generated';
import { useProtobufRequest } from 'src/hooks/useProtobufRequest';

const TOKEN = 2;

const TOKEN_LOGIN = 1;
const TOKEN_VALIDATE = 2;
const TOKEN_LOGOUT = 3;


/**
 * 发起用户登录请求。
 *
 * @param loginParam - 登录请求参数，包括用户名和密码等信息。
 * @returns {Promise<TokenInfo>} 返回一个 Promise，解析为用户登录成功后获得的 Token 信息。
 */
export function login(loginParam: ILoginRequestParam) {
  return useProtobufRequest('登录', TOKEN, TOKEN_LOGIN,
    LoginRequestParam.create(loginParam), TokenInfo.create());
}


/**
 * 发起用户登录请求。
 *
 * @param loginParam - 登录请求参数，包括用户名和密码等信息。
 * @returns {Promise<TokenInfo>} 返回一个 Promise，解析为用户登录成功后获得的 Token 信息。
 */
export function logout() {
  return useProtobufRequest('登出', TOKEN, TOKEN_LOGOUT);
}
