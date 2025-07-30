<template>
  <a-modal
    class="image-out-painting-modal"
    v-model:open="visible"
    title="AI 扩图"
    :footer="false"
    @cancel="closeModal"
    width="800px"
    :closable="true"
  >
    <div class="image-container">
      <div class="image-section">
        <div class="image-label">原始图片</div>
        <div class="image-wrapper">
          <img
            :src="picture?.url"
            :alt="picture?.name"
            class="preview-image"
          />
        </div>
      </div>

      <div v-if="resultImageUrl" class="image-section">
        <div class="image-label">扩图结果</div>
        <div class="image-wrapper">
          <img
            :src="resultImageUrl"
            :alt="picture?.name"
            class="preview-image"
          />
        </div>
      </div>
    </div>

    <div class="action-bar">
      <a-button
        type="primary"
        class="generate-btn"
        :loading="!!taskId"
        @click="createTask"
      >
        <ThunderboltOutlined />
        生成图片
      </a-button>
      <a-button
        v-if="resultImageUrl"
        type="primary"
        class="apply-btn"
        :loading="uploadLoading"
        @click="handleUpload"
      >
        <CheckOutlined />
        应用结果
      </a-button>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import {
  createPictureOutPaintingTaskUsingPost,
  getPictureOutPaintingTaskUsingGet,
  uploadPictureByUrlUsingPost,
} from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import { ThunderboltOutlined, CheckOutlined } from '@ant-design/icons-vue'

interface Props {
  picture?: API.PictureVO
  spaceId?: number
  onSuccess?: (newPicture: API.PictureVO) => void
}

const props = defineProps<Props>()

const resultImageUrl = ref<string>('')

// 任务 id
const taskId = ref<string>()

/**
 * 创建任务
 */
const createTask = async () => {
  if (!props.picture?.id) {
    return
  }
  const res = await createPictureOutPaintingTaskUsingPost({
    pictureId: props.picture.id,
    // 根据需要设置扩图参数
    parameters: {
      xScale: 2,
      yScale: 2,
    },
  })
  if (res.data.code === 0 && res.data.data) {
    message.success('创建任务成功，请耐心等待，不要退出界面')
    console.log(res.data.data.output.taskId)
    taskId.value = res.data.data.output.taskId
    // 开启轮询
    startPolling()
  } else {
    message.error('图片任务失败，' + res.data.message)
  }
}

// 轮询定时器
let pollingTimer: NodeJS.Timeout = null

// 开始轮询
const startPolling = () => {
  if (!taskId.value) {
    return
  }

  pollingTimer = setInterval(async () => {
    try {
      const res = await getPictureOutPaintingTaskUsingGet({
        taskId: taskId.value,
      })
      if (res.data.code === 0 && res.data.data) {
        const taskResult = res.data.data.output
        if (taskResult.taskStatus === 'SUCCEEDED') {
          message.success('扩图任务执行成功')
          resultImageUrl.value = taskResult.outputImageUrl
          // 清理轮询
          clearPolling()
        } else if (taskResult.taskStatus === 'FAILED') {
          message.error('扩图任务执行失败')
          // 清理轮询
          clearPolling()
        }
      }
    } catch (error) {
      console.error('扩图任务轮询失败', error)
      message.error('扩图任务轮询失败，' + error.message)
      // 清理轮询
      clearPolling()
    }
  }, 3000) // 每 3 秒轮询一次
}

// 清理轮询
const clearPolling = () => {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
    taskId.value = null
  }
}

// 是否正在上传
const uploadLoading = ref(false)

/**
 * 上传图片
 * @param file
 */
const handleUpload = async () => {
  uploadLoading.value = true
  try {
    const params: API.PictureUploadRequest = {
      fileUrl: resultImageUrl.value,
      spaceId: props.spaceId,
    }
    if (props.picture) {
      params.id = props.picture.id
    }
    const res = await uploadPictureByUrlUsingPost(params)
    if (res.data.code === 0 && res.data.data) {
      message.success('图片上传成功')
      // 将上传成功的图片信息传递给父组件
      props.onSuccess?.(res.data.data)
      // 关闭弹窗
      closeModal()
    } else {
      message.error('图片上传失败，' + res.data.message)
    }
  } catch (error) {
    console.error('图片上传失败', error)
    message.error('图片上传失败，' + error.message)
  }
  uploadLoading.value = false
}

// 是否可见
const visible = ref(false)

// 打开弹窗
const openModal = () => {
  visible.value = true
}

// 关闭弹窗
const closeModal = () => {
  visible.value = false
}

// 暴露函数给父组件
defineExpose({
  openModal,
})
</script>

<style scoped>
.image-out-painting-modal {
  text-align: center;
}

.image-container {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin: 20px 0;
}

.image-section {
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
}

.image-label {
  color: #333;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  margin-bottom: 8px;
  height: 24px;
}

.image-wrapper {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.action-bar {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
  margin-bottom: 16px;
}

.generate-btn, .apply-btn {
  background-color: #ff7d00;
  border-color: #ff7d00;
  height: 40px;
  padding: 0 24px;
  font-size: 16px;
  color: white;
}

.generate-btn:hover, .apply-btn:hover {
  background-color: #ff9500;
  border-color: #ff9500;
}
</style>
