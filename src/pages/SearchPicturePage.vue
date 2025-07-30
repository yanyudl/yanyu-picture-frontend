<template>
  <div id="searchPicturePage"></div>
  <h2 style="margin-bottom: 16px">图片搜索</h2>
  <h3 style="margin: 16px 0">原图</h3>
  <a-card hoverable style="width: 240px">
    <template #cover>
      <a-image style="height: 180px; object-fit: cover" :alt="picture.name" :src="picture.url" />
    </template>
  </a-card>
  <h3 style="margin: 16px 0">识图结果</h3>
  <!-- 图片列表 -->
  <a-list
    :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }"
    :data-source="dataList"
    :loading="loading"
  >
    <!--    -->
    <template #renderItem="{ item }">
      <a-list-item style="padding: 0">
        <a target="_blank">
          <a-card hoverable>
            <template #cover>
              <a-image style="height: 180px; object-fit: cover" :src="item.thumbUrl" />
            </template>
            <template #actions>
              <a-space @click="(e) => doDownLoad(item, e)">
                <DownloadOutlined />
                下载
              </a-space>
              <a-space>
                <a :href="item.fromUrl" target="_blank">
                  <LinkOutlined />
                  跳转
                </a>
              </a-space>
            </template>
          </a-card>
        </a>
      </a-list-item>
    </template>
  </a-list>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  getPictureVoByIdUsingGet,
  searchPictureByPictureUsingPost,
} from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import { useRoute } from 'vue-router'
import { DownloadOutlined, LinkOutlined } from '@ant-design/icons-vue'
import { downloadImage } from '@/utils'

const route = useRoute()

//图片id
const pictureId = computed(() => {
  return route.query?.pictureId
})
const picture = ref<API.PictureVO>({})

// 获取图片详情
const fetchPictureDetail = async () => {
  try {
    const res = await getPictureVoByIdUsingGet({
      id: pictureId.value,
    })
    if (res.data.code === 0 && res.data.data) {
      picture.value = res.data.data
    } else {
      message.error('获取图片详情失败，' + res.data.message)
    }
  } catch (e: any) {
    message.error('获取图片详情失败：' + e.message)
  }
}

onMounted(() => {
  fetchPictureDetail()
})
//识图列表
const dataList = ref<API.ImageSearchResult[]>([])
const loading = ref<boolean>(true)
//获取以图搜图结果
const fetchData = async () => {
  loading.value = true
  try {
    const res = await searchPictureByPictureUsingPost({
      pictureId: pictureId.value,
    })
    if (res.data.code === 0 && res.data.data) {
      dataList.value = res.data.data
    } else {
      message.error('获取数据失败，' + res.data.message)
    }
  } catch (e: any) {
    message.error('获取数据失败：' + e.message)
  }
  loading.value = false
}

onMounted(() => {
  fetchData()
})

// 下载
const doDownLoad = (item, e) => {
  //阻止冒泡
  e.stopPropagation()
  downloadImage(item.thumbUrl)
}
</script>

<style scoped>
#searchPicturePage {
  margin-bottom: 16px;
}
</style>
