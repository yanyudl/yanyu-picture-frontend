<template>
  <div class="space-usage-analyze">
    <a-card title="空间资源使用分析">
      <a-flex gap="middle" style="height: 320px">
        <a-card title="存储空间" style="width: 50%">
          <div style="text-align: center">
            <h3>{{ formatSize(data.usedSize) }} / {{ data.maxSize ? formatSize(data.maxSize) : '无限制' }}</h3>
            <a-progress type="dashboard" :percent="data.sizeUsageRatio ?? 0" />
          </div>
        </a-card>
        <a-card title="图片数量" style="width: 50%">
          <div style="text-align: center">
            <h3>{{ data.usedCount }} / {{ data.maxCount ?? '无限制' }} </h3>
            <a-progress type="dashboard" :percent="data.countUsageRatio ?? 0" />
          </div>
        </a-card>
      </a-flex>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { message } from 'ant-design-vue'
import { getSpaceUsageAnalyzeUsingPost } from '@/api/spaceAnalyzeController.ts'
import { formatSize } from '@/utils'



interface Props {
  queryAll?:boolean
  queryPublic?:boolean
  spaceId?: number
}

const props = withDefaults(defineProps<Props>(),{
  queryAll:false,
  queryPublic:false
})

//图表数据
const data = ref<API.SpaceUsageAnalyzeResponse>({})

//加载状态
const loading = ref(true)

/**
 * 加载数据
 */
const fetchData = async () => {
  loading.value = true
  const res = await getSpaceUsageAnalyzeUsingPost({
    queryAll: props.queryAll,
    queryPublic: props.queryPublic,
    spaceId: props.spaceId,
  })
  if (res.data.code === 0 && res.data.data) {
    data.value = res.data.data
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
  loading.value = false
}

/**
 * 监听变量，改变时触发数据的重新加载
 */
watchEffect(() => {
  fetchData()
})

</script>

<style scoped>

</style>
