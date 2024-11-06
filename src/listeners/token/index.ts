import { useBroadcastListener } from 'src/hooks/useBroadcastListener.ts';
import { CommandModule } from 'src/constants/commandModule.ts';
import { AccountCommand } from 'src/constants/accountCommand.ts';
import { BoolValue } from 'src/proto/type';
import { useTokenStore } from 'stores/token.ts';

export function registerTokenListener() {
  const tokenStore = useTokenStore();
  useBroadcastListener({
    title: '验证令牌',
    cmd: CommandModule.token,
    subCmd: AccountCommand.token.ValidateToken,
    returnType: BoolValue.create()
  }).then((resultData: BoolValue) => {
    tokenStore.setLoggedIn(resultData.value);
    if (!resultData.value) {
      tokenStore.$reset();
    }
    console.log('result:', resultData);
  });
}
