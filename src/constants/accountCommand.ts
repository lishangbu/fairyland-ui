enum AccountCommandUser {
  Register = 2           // 账户 - 注册
}

enum AccountCommandToken {
  Login = 1,            // 令牌 - 登录
  ValidateToken = 2,    // 令牌 - 验证
  Logout = 3    // 令牌 - 验证
}

export const AccountCommand = {
  user: AccountCommandUser,
  token: AccountCommandToken
};
