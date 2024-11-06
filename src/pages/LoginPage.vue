<template>
  <q-page class="flex flex-center">
    <q-card>
      <q-card-section>
        <div class="text-h6">登录</div>
      </q-card-section>

      <q-card-section>
        <q-input
          filled
          v-model="username"
          label="用户名"
          required
        />
        <q-input
          filled
          v-model="password"
          label="密码"
          type="password"
          required
        />
      </q-card-section>

      <q-card-actions align="center" class="flex justify-center">
        <q-btn @click="handleLogin" label="登录" color="primary" :disable="disabled" :loading="loading" />
        <q-btn @click="handleRegister" label="注册" color="primary" :loading="loading" />
        <q-btn @click="handleLogout" label="退出" color="primary" :loading="loading" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>


<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useTokenStore } from 'stores/token.ts';
import { register } from 'src/services/user.ts';

const username = ref<string>('');
const password = ref<string>('');
const disabled = computed(() => username.value === '' || password.value === '');
const loading = ref(false);
const tokenStore = useTokenStore();

const handleLogin = () => {

  loading.value = true;
  tokenStore.loginByUsername({
    username: username.value,
    password: password.value
  }).then(() => {
    loading.value = false;
  }).catch(() => {
    loading.value = false;
  });
};

const handleRegister = () => {
  loading.value = true;
  // 在这里添加登录逻辑，例如发送请求到后端
  register({ username: username.value, password: password.value }).then(result => {
    loading.value = false;
    console.log('注册成功,返回数据', result);
  }).catch(() => {
    loading.value = false;
  });
};

const handleLogout = () => {
  loading.value = true;
  tokenStore.logout().then(() => {
    loading.value = false;
  }).catch(() => {
    loading.value = false;
  });
};

</script>
