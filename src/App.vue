<template>
  <div id="app">
    <!-- 保持最简单的 <router-view /> 以确保您的原有布局能正常工作 -->
    <router-view />
  </div>
</template>

<script>
// 导入我们需要的功能，这次增加了 nextTick
import { watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'App',
  setup() {
    // 获取路由器实例
    const router = useRouter();

    // 监听路由的变化
    watch(() => router.currentRoute.value, (to, from) => {
      // 检查是不是从登录页面 ('/login') 跳转过来的
      if (from.path === '/login') {
        // 检查是否存在登录时设置的临时标记
        if (sessionStorage.getItem('showLoginGreeting') === 'true') {

          // ==========================================================
          // ▼▼▼▼▼▼▼▼▼▼▼▼▼▼ 唯一修改点 ▼▼▼▼▼▼▼▼▼▼▼▼▼▼
          //
          // 使用 nextTick() 来确保弹窗在 DOM 更新（即主页面渲染）之后执行
          nextTick(() => {
            // 把 alert 和 removeItem 放在这里
            alert('Have a great Saturday! Enjoy your free time.');
            sessionStorage.removeItem('showLoginGreeting');
          });
          //
          // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲ 唯一修改点 ▲▲▲▲▲▲▲▲▲▲▲▲▲▲
          // ==========================================================
        }
      }
    });

    // 返回空对象，因为模板里不需要任何动态数据
    return {};
  },
};
</script>

<style>
/* 您已有的全局样式，未改动 */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>