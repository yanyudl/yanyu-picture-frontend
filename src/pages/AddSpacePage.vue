<template>
  <div id="addSpacePage">
    <h2 style="margin-bottom: 16px">
      {{ route.query?.id ? '修改' : '创建' }}{{ SPACE_TYPE_MAP[spaceType]}}
    </h2>
    <!-- 空间信息表单 -->
    <a-form layout="vertical" :model="formData" @finish="handleSubmit">
      <a-form-item label="空间名称" name="spaceName">
        <a-input v-model:value="formData.spaceName" placeholder="请输入空间名称" allow-clear />
      </a-form-item>
      <a-form-item label="空间级别" name="spaceLevel">
        <a-select
          v-model:value="formData.spaceLevel"
          :options="SPACE_LEVEL_OPTIONS"
          placeholder="请输入空间级别"
          style="min-width: 180px"
          allow-clear
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%" :loading="loading">
          提交
        </a-button>
      </a-form-item>
    </a-form>
    <!-- 空间级别-->
    <a-card title="空间级别介绍">
      <a-typography-paragraph>
        * 目前仅支持开通普通版，如需升级空间，请联系
        <a href="https://codefather.cn" target="_blank">烟雨</a>。
      </a-typography-paragraph>
      <a-typography-paragraph v-for="spaceLevel in spaceLevelList">
        {{ spaceLevel.text }}： 大小 {{ formatSize(spaceLevel.maxSize) }}， 数量
        {{ spaceLevel.maxCount }} 张
      </a-typography-paragraph>
    </a-card>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import {
  addSpaceUsingPost, getSpaceVoByIdUsingGet,
  listSpaceLevelUsingGet, updateSpaceUsingPost
} from '@/api/spaceController.ts'
import { useRoute, useRouter } from 'vue-router'
import {
  SPACE_LEVEL_ENUM,
  SPACE_LEVEL_MAP,
  SPACE_LEVEL_OPTIONS,
  SPACE_TYPE_ENUM, SPACE_TYPE_MAP
} from '@/constants/space.ts'
import { formatSize } from '@/utils'

const formData = reactive<API.SpaceAddRequest | API.SpaceUpdateRequest>({
  spaceName: '',
  spaceLevel: SPACE_LEVEL_ENUM.COMMON,
})
const loading = ref(false)
const router = useRouter()
const oldSpace = ref<API.SpaceVO>()
//更新空间
const route = useRoute()

// 空间类别
const spaceType = computed(() => {
  if (route.query?.type) {
    return Number(route.query.type)
  }
  return SPACE_TYPE_ENUM.PRIVATE
})

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  const spaceId = oldSpace.value?.id
  loading.value = true
  let res
  let path
  // 更新
  if (spaceId) {
    res = await updateSpaceUsingPost({
      id: spaceId,
      ...formData,
    })
    path = '/admin/spaceManage'
  } else {
    // 创建 创建成功跳到空间
    res = await addSpaceUsingPost({
      ...formData,
      spaceType: spaceType.value,
    })
    path = `/space/${spaceId ?? res.data.data}`
  }
  if (res.data.code === 0 && res.data.data) {
    message.success('创建成功')
    router.push({
      path,
    })
  } else {
    message.error('操作失败，' + res.data.message)
  }
  loading.value = false
}


const spaceLevelList = ref<API.SpaceLevel[]>([])
// 获取空间级别
const fetchSpaceLevelList = async () => {
  const res = await listSpaceLevelUsingGet()
  if (res.data.code === 0 && res.data.data) {
    spaceLevelList.value = res.data.data
  } else {
    message.error('加载空间级别失败，' + res.data.message)
  }
}

onMounted(() => {
  fetchSpaceLevelList()
})


// 获取老数据
const getOldSpace = async () => {
  // 获取数据
  const id = route.query?.id
  if (id) {
    const res = await getSpaceVoByIdUsingGet({
      id: id,
    })
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      oldSpace.value = data
      formData.spaceName = data.spaceName
      formData.spaceLevel = data.spaceLevel
    }
  }
}
onMounted(() => {
  getOldSpace()
})

// 在script setup中添加
watch(
  () => route.query,
  (newQuery) => {
    // 重置表单数据
    formData.spaceName = ''
    formData.spaceLevel = SPACE_LEVEL_ENUM.COMMON

    // 如果有id则获取旧数据
    if (newQuery?.id) {
      getOldSpace()
    }
  },
  { immediate: true }
)
</script>

<style scoped>
#addSpacePage {
  max-width: 720px;
  margin: 0 auto;
}
</style>
