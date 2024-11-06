<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import Initializer from 'src/utils/bootstrap.ts';

defineOptions({
  name: 'App'
});
onMounted(Initializer);
</script>
