<template>
  <div id="basicLayout" style="min-height: 100vh">
    <a-layout>
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>

      <a-layout>
        <GlobalSider class="sider" />
        <a-layout-content class="content">
          <router-view />
        </a-layout-content>
      </a-layout>
      <a-layout-footer class="footer">
        <div class="footer-content">
        <p>
           2025 烟雨 <span style="margin: 0 10px"></span>
          <a href="https://beian.miit.gov.cn/" target="_blank" class="footer-link">© 蜀ICP备2025143784号-1</a>
        </p>
        </div>
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import GlobalHeader from '@/components/GlobalHeader.vue'
import GlobalSider from '@/components/GlobalSider.vue'
</script>

<style scoped>
#basicLayout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

#basicLayout .header {
  padding-inline: 20px;
  background: #fff;
  color: unset;
  margin-bottom: 1px;
}

#basicLayout .sider{
  background: #fff;
  border-right: 0.5px solid #eee;
  padding-top: 20px;
}

#basicLayout :deep(.ant-menu-root) {
  border-bottom: none !important;
  border-inline-end: none !important;
}

#basicLayout .content {
  flex: 1;
  padding: 28px;
  /*
  ** 渐变色
  */
  background: linear-gradient(to right, #fff, #efefef);
  margin-bottom: 28px;
}

#basicLayout .footer {
  background: #efefef;
  padding: 16px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
}

.footer-content {
  position: relative;
  z-index: 4;
  padding: 2px 0;
}

.footer-content p {
  color: #8d8a8a;
  margin-bottom: 1px;
  font-size: 12px;
  line-height: 1.2;
}

.footer-link {
  color: #8d8a8a !important; /* 默认灰色 */
  text-decoration: none; /* 可选：去掉下划线 */
  transition: color 0.3s; /* 平滑过渡效果 */
}

.footer-link:hover {
  color: #1890ff !important; /* 悬停时变为蓝色（Ant Design 主题色） */
}
</style>
