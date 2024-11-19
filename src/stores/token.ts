import { defineStore } from 'pinia';
import { login, logout as remoteLogout } from 'src/services/token';
import type { ILoginRequestParam, ITokenInfo } from 'src/generated';
import { BoolValue } from 'src/generated';
import { useBroadcastListener } from 'src/hooks/useBroadcastListener';

// 定义状态的类型
interface State {
  tokenInfo?: ITokenInfo | undefined;
  isLoggedIn: boolean;
}

export const useTokenStore = defineStore('token', {
  persist: {
    storage: localStorage
  },
  state: (): State => ({
    tokenInfo: undefined,
    isLoggedIn: false
  }),
  getters: {
    getTokenValue: (state: State): string | null => state.tokenInfo?.token ?? null
  },
  actions: {
    // 根据用户名登录
    loginByUsername(loginRequestParam: ILoginRequestParam) {
      return new Promise((resolve, reject) => {
        login(loginRequestParam)
          .then((result) => {
            // 登录成功会返回token
            this.setToken(result);
            this.setLoggedIn(true);
            resolve(result);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    logout() {
      return new Promise((resolve, reject) => {
        remoteLogout()
          .then((result) => {
            // 登录成功会返回token
            this.$reset();
            resolve(result);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    // 设置令牌
    setToken(tokenData: ITokenInfo) {
      this.tokenInfo = tokenData;
    },
    // 移除令牌
    removeToken() {
      this.tokenInfo = undefined;
    },
    setLoggedIn(isLoggedIn: boolean) {
      this.isLoggedIn = isLoggedIn;
    },
    registerValidateTokenListener() {
      useBroadcastListener(
        '验证令牌',
        2,
        2,
        BoolValue.create()
      ).then((resultData: BoolValue) => {
        this.setLoggedIn(resultData.value);
        if (!resultData.value) {
          this.$reset();
        }
        console.log('result:', resultData);
      });
    }
  }
});
