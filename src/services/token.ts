import { ILoginRequestParam, LoginRequestParam, TokenInfo } from 'src/proto/type';
import { CommandModule } from 'src/constants/commandModule.ts';
import { AccountCommand } from 'src/constants/accountCommand.ts';
import { useProtobufRequest } from 'src/hooks/useRequest.ts';

const MAIN_CMD = CommandModule.token as const;

const TOKEN = AccountCommand.token;


/**
 * 发起用户登录请求。
 *
 * @param loginParam - 登录请求参数，包括用户名和密码等信息。
 * @returns {Promise<TokenInfo>} 返回一个 Promise，解析为用户登录成功后获得的 Token 信息。
 */
export function login(loginParam: ILoginRequestParam) {
  return useProtobufRequest('登录', MAIN_CMD, TOKEN.Login,
    LoginRequestParam.create(loginParam), TokenInfo.create());
}


/**
 * 发起用户登录请求。
 *
 * @param loginParam - 登录请求参数，包括用户名和密码等信息。
 * @returns {Promise<TokenInfo>} 返回一个 Promise，解析为用户登录成功后获得的 Token 信息。
 */
export function logout() {
  return useProtobufRequest('登出', MAIN_CMD, TOKEN.Logout);
}
