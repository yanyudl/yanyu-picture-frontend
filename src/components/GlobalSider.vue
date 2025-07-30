<template>
  <div id="globalSider">
    <a-layout-sider
      v-if="loginUserStore.loginUser.id"
      class="sider"
      width="200"
      breakpoint="lg"
      collapsible
      :collapsed="collapsed"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      :trigger="null">
      <a-menu
        mode="inline"
        v-model:selectedKeys="current"
        :items="menuItems"
        @click="doMenuClick"
        class="custom-menu"
      />
    </a-layout-sider>
  </div>
</template>

<script lang="ts" setup>
import { computed, h, onMounted, ref, watchEffect } from 'vue'
import { PictureOutlined, UserOutlined,CloudUploadOutlined,PlusOutlined,TeamOutlined} from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { SPACE_TYPE_ENUM } from '@/constants/space.ts'
import { listMyTeamSpaceUsingPost } from '@/api/spaceUserController.ts'
import { message } from 'ant-design-vue'

const loginUserStore = useLoginUserStore()
const router = useRouter()
const isTeamExpanded = ref(false)
const userId = computed(() => loginUserStore.loginUser.id)
const collapsed = ref(true);

// 处理鼠标进入
const handleMouseEnter = () => {
  collapsed.value = false
}

// 处理鼠标离开
const handleMouseLeave = () => {
  collapsed.value = true
}

// 固定菜单列表
const fixedMenuItems = [
  {
    key: '/',
    label: '公共图库',
    icon: () => h(PictureOutlined),
  },
  {
    key: '/my_space',
    label: '我的空间',
    icon: () => h(UserOutlined),
  },
  {
    key: '/my_ports',
    label: '我的发布',
    icon: () => h(CloudUploadOutlined),
  },
]

const teamSpaceList = ref<API.SpaceUserVO[]>([])

// 处理添加团队点击
const handleAddTeam = (e: Event) => {
  e.stopPropagation()
  router.push('/add_space?type=' + SPACE_TYPE_ENUM.TEAM)
}

// 计算菜单项
const menuItems = computed(() => {
  const items = [...fixedMenuItems]

  // 团队空间菜单
  const teamMenuItem = {
    key: 'team-spaces',
    icon: () => h(TeamOutlined),
    children: [],
    class: 'team-menu-item',
  }

  // 设置标题和添加按钮
  teamMenuItem.label = h('div', { class: 'team-menu-title' }, [
    '我的团队',
    h(
      'a-button',
      {
        type: 'link',
        class: 'add-team-btn',
        style: 'margin-left: 16px;', // 添加 16px 的左边距
        onClick: handleAddTeam,
      },
      [h(PlusOutlined)],
    ),
  ])

  // 如果有团队列表数据
  if (teamSpaceList.value.length > 0) {
    const displayCount = 3 // 默认显示前3个团队
    const collapsed = ref(true)

    teamSpaceList.value.forEach((team, index) => {
      if (!isTeamExpanded.value && index >= displayCount) {
        return
      }

      // 判断是否是用户创建的团队
      const isCreator = team.space?.userId === userId.value
      const teamLabel = isCreator ? `${team.space?.spaceName} (我的)` : team.space?.spaceName

      teamMenuItem.children.push({
        key: `/space/${team.spaceId}`,
        label: teamLabel,
      })
    })

    // 添加展开/收起按钮
    if (teamSpaceList.value.length > displayCount && !isTeamExpanded.value) {
      teamMenuItem.children.push({
        key: 'expand',
        label: h(
          'div',
          { class: 'expand-collapse-text' },
          `展开其他 ${teamSpaceList.value.length - displayCount} 个团队`,
        ),
        onClick: (e: Event) => {
          e.stopPropagation()
          isTeamExpanded.value = true
        },
      })
    } else if (isTeamExpanded.value) {
      teamMenuItem.children.push({
        key: 'collapse',
        label: h('div', { class: 'expand-collapse-text' }, '收起'),
        onClick: (e: Event) => {
          e.stopPropagation()
          isTeamExpanded.value = false
        },
      })
    }
  }

  items.push(teamMenuItem)
  return items
})

// 加载团队空间列表
const fetchTeamSpaceList = async () => {
  const res = await listMyTeamSpaceUsingPost()
  if (res.data.code === 0 && res.data.data) {
    teamSpaceList.value = res.data.data
  } else {
    message.error('加载我的团队空间失败，' + res.data.message)
  }
}

// 当前选中菜单
const current = ref<string[]>([])

// 监听路由变化，更新当前选中菜单
router.afterEach((to, from, next) => {
  current.value = [to.path]
})

// 路由跳转事件
const doMenuClick = ({ key }: { key: string }) => {
  if (key === 'expand' || key === 'collapse') {
    return;
  }
  router.push(key)
}

/**
 * 监听变量，改变时触发数据的重新加载
 */
watchEffect(() => {
  // 登录才加载
  if (loginUserStore.loginUser.id) {
    fetchTeamSpaceList()
  }
})
</script>

<style scoped>
#globalSider .ant-layout-sider {
  background: none;
}
/* 样式保持不变 */
.sider {
  transition: all 0.2s;
  overflow: hidden;
}

:deep(.ant-layout-sider-collapsed) {
  width: 60px !important;
  min-width: 60px !important;
  max-width: 60px !important;
}
</style>
