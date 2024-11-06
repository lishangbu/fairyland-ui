import { AccountInfo, IRegisterRequestParam, LoginRequestParam } from 'src/proto/type';
import { CommandModule } from 'src/constants/commandModule.ts';
import { AccountCommand } from 'src/constants/accountCommand.ts';
import { useProtobufRequest } from 'src/hooks/useRequest.ts';

const MAIN_CMD = CommandModule.user as const;

const USER = AccountCommand.user;

/**
 * 发起用户注册请求。
 *
 * @param registerRequestParam - 注册请求参数，包括用户名、密码等注册信息。
 * @returns {Promise<AccountInfo>} 返回一个 Promise，解析为注册成功后获得的用户账户信息。
 */
export function register(registerRequestParam: IRegisterRequestParam) {
  return useProtobufRequest('注册', MAIN_CMD, USER.Register,
    LoginRequestParam.create(registerRequestParam), AccountInfo.create());
}

