import type { IRegisterRequestParam } from 'src/generated';
import { AccountInfo, RegisterRequestParam } from 'src/generated';
import { useProtobufRequest } from 'src/hooks/useProtobufRequest';

const USER = 1;

const USER_REGISTER = 1;

/**
 * 发起用户注册请求。
 *
 * @param registerRequestParam - 注册请求参数，包括用户名、密码等注册信息。
 * @returns {Promise<AccountInfo>} 返回一个 Promise，解析为注册成功后获得的用户账户信息。
 */
export function register(registerRequestParam: IRegisterRequestParam) {
  return useProtobufRequest('注册', USER, USER_REGISTER,
    RegisterRequestParam.create(registerRequestParam), AccountInfo.create());
}

