import {defineBoot} from '#q-app/wrappers';
import {useTokenStore} from 'stores/token';

export default defineBoot(({app, router}) => {
  // 前置守卫：每次路由跳转前都会执行
  router.beforeEach((to, from, next) => {
    const tokenStore = useTokenStore()
    // 可以在这里判断是否需要授权或者验证
    if (to?.meta?.requiresAuth && !tokenStore.isLoggedIn) {
      next('/login') // 如果用户未登录，跳转到登录页
    } else {
      next() // 允许路由跳转
    }
  })

  // 后置守卫：每次路由跳转后执行
  router.afterEach((to, from) => {
    // 可以在这里做一些日志记录、分析等
    console.log('导航完成', to,'来自',from)
  })
});
