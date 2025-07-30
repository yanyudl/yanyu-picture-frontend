<template>
  <div id="addPicturePage">
    <h2 style="margin-bottom: 16px">
      {{ route.query?.id ? '修改图片' : '创建图片' }}
    </h2>
    <a-typography-paragraph v-if="spaceId" type="secondary">
      保存至空间：<a :href="`/space/${spaceId}`" target="_blank">{{ spaceId }}</a>
    </a-typography-paragraph>

    <!-- 主内容区 -->
    <div class="content-container">
      <!-- 左侧：图片上传区域 -->
      <div class="upload-section">
        <a-tabs v-model:activeKey="uploadType">
          <a-tab-pane key="file" tab="文件上传">
            <PictureUpload
              :picture="picture"
              :spaceId="spaceId"
              :onSuccess="onSuccess"
              class="upload-component"
            />
          </a-tab-pane>
          <a-tab-pane key="url" tab="URL 上传" force-render>
            <UrlPictureUpload
              :picture="picture"
              :spaceId="spaceId"
              :onSuccess="onSuccess"
              class="upload-component"
            />
          </a-tab-pane>
        </a-tabs>
      </div>

      <!-- 右侧：图片信息表单（仅在图片存在时显示） -->
      <div class="form-section" v-if="picture">
        <!-- 图片编辑区域-->
        <div v-if="picture" class="edit-bar">
          <a-space size="middle" style="display: flex; justify-content: center">
            <a-button :icon="h(EditOutlined)" @click="doEditPicture">编辑图片</a-button>
            <a-button type="primary" ghost :icon="h(FullscreenOutlined)" @click="doImagePainting">
              AI 扩图
            </a-button>
          </a-space>
          <ImageCropper
            ref="imageCropperRef"
            :imageUrl="picture.url"
            :picture="picture"
            :spaceId="spaceId"
            :space="space"
            :onSuccess="onCropSuccess"
          />
          <ImageOutPainting
            ref="imageOutPaintingRef"
            :picture="picture"
            :spaceId="spaceId"
            :onSuccess="onImageOutPaintingSuccess"
          />
        </div>
        <a-form name="pictureForm" layout="vertical" :model="pictureForm" @finish="handleSubmit">
          <a-form-item name="name" label="名称">
            <a-input v-model:value="pictureForm.name" placeholder="请输入名称" allow-clear />
          </a-form-item>
          <a-form-item name="introduction" label="简介">
            <a-textarea
              v-model:value="pictureForm.introduction"
              placeholder="请输入简介"
              :auto-size="{ minRows: 2, maxRows: 5 }"
              allow-clear
            />
          </a-form-item>
          <a-form-item name="category" label="分类">
            <a-auto-complete
              v-model:value="pictureForm.category"
              placeholder="请输入分类"
              :options="categoryOptions"
              allow-clear
            />
          </a-form-item>
          <a-form-item name="tags" label="标签">
            <a-select
              v-model:value="pictureForm.tags"
              mode="tags"
              placeholder="请输入标签"
              :options="tagOptions"
              allow-clear
            />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" html-type="submit" style="width: 100%">
              {{ route.query?.id ? '编辑' : '创建' }}
            </a-button>
          </a-form-item>
        </a-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PictureUpload from '@/components/PictureUpload.vue'
import { h, computed, onMounted, reactive, ref, watchEffect } from 'vue'
import { message } from 'ant-design-vue'
import {
  editPictureUsingPost,
  getPictureVoByIdUsingGet,
  listPictureTagCategoryUsingGet,
} from '@/api/pictureController.ts'
import { useRoute, useRouter } from 'vue-router'
import UrlPictureUpload from '@/components/UrlPictureUpload.vue'
import { FullscreenOutlined, EditOutlined } from '@ant-design/icons-vue'
import ImageCropper from '@/components/ImageCropper.vue'
import ImageOutPainting from '@/components/ImageOutPainting.vue'
import { getSpaceVoByIdUsingGet } from '@/api/spaceController.ts' // 确保路径正确

const router = useRouter()
const route = useRoute()
const picture = ref<API.PictureVO>()
const pictureForm = reactive<API.PictureEditRequest>({})
const uploadType = ref<'file' | 'url'>('file')
// 空间 id
const spaceId = computed(() => {
  return route.query?.spaceId
})

/**
 * 图片上传成功
 * @param newPicture
 */
const onSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
  pictureForm.name = newPicture.name
}

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  console.log(values)
  const pictureId = picture.value.id
  if (!pictureId) {
    return
  }
  const res = await editPictureUsingPost({
    id: pictureId,
    spaceId: spaceId.value,
    ...values,
  })
  // 操作成功
  if (res.data.code === 0 && res.data.data) {
    message.success('操作成功')
    // 跳转到图片详情页
    router.push({
      path: `/picture/${pictureId}`,
    })
  } else {
    message.error('操作失败，' + res.data.message)
  }
}

const categoryOptions = ref<string[]>([])
const tagOptions = ref<string[]>([])

/**
 * 获取标签和分类选项
 */
const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()
  if (res.data.code === 0 && res.data.data) {
    tagOptions.value = (res.data.data.tagList ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
    categoryOptions.value = (res.data.data.categoryList ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
  } else {
    message.error('获取标签分类列表失败，' + res.data.message)
  }
}

onMounted(() => {
  getTagCategoryOptions()
})

// 获取老数据
const getOldPicture = async () => {
  // 获取到 id
  const id = route.query?.id
  if (id) {
    const res = await getPictureVoByIdUsingGet({
      id,
    })
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      picture.value = data
      pictureForm.name = data.name
      pictureForm.introduction = data.introduction
      pictureForm.category = data.category
      pictureForm.tags = data.tags
    }
  }
}

onMounted(() => {
  getOldPicture()
})

// 图片编辑弹窗引用
const imageCropperRef = ref()

// 编辑图片
const doEditPicture = () => {
  if (imageCropperRef.value) {
    imageCropperRef.value.openModal()
  }
}

// 编辑成功事件
const onCropSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
}

// AI 扩图弹窗引用
const imageOutPaintingRef = ref()

// AI 扩图
const doImagePainting = () => {
  if (imageOutPaintingRef.value) {
    imageOutPaintingRef.value.openModal()
  }
}

// 编辑成功事件
const onImageOutPaintingSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
}

const space = ref<API.SpaceVO>()

// 获取空间信息
const fetchSpace = async () => {
  // 获取数据
  if (spaceId.value) {
    const res = await getSpaceVoByIdUsingGet({
      id: spaceId.value,
    })
    if (res.data.code === 0 && res.data.data) {
      space.value = res.data.data
    }
  }
}

watchEffect(() => {
  fetchSpace()
})

</script>

<style scoped>
#addPicturePage {
  max-width: 100%;
  margin: 0 auto;
  padding: 0 20px;
}

.content-container {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

/* 默认状态（无图片时） */
.upload-section {
  max-width: 720px;
  margin: 0 auto;
  width: 100%;
}

/* 有图片时的布局 */
.content-container:has(.form-section:not(:empty)) {
  .upload-section {
    flex: 2; /* 占据2/3宽度 */
    min-width: 400px;
    max-width: none; /* 移除最大宽度限制 */
  }

  .form-section {
    flex: 1; /* 占据1/3宽度 */
    min-width: 400px;
    padding-top: 60px; /* 添加这一行与上传区域标题对齐 */
  }
}

.upload-component {
  width: 100%;
}

.edit-bar {
  margin-bottom: 24px; /* 增加底部间距 */
}

.edit-bar .ant-btn {
  margin-left: 16px; /* 向右移动 16px */
}
</style>
