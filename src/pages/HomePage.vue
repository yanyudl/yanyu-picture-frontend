<template>
  <div id="homePage">
    <!-- 搜索框 -->
    <div class="search-bar">
      <a-input-search
        v-model:value="searchParams.searchText"
        placeholder="从海量图片中搜索"
        enter-button="搜索"
        size="large"
        @search="doSearch"
      >
        <template #prefix>
          <SearchOutlined />
        </template>
      </a-input-search>
    </div>

    <!-- 分类和标签筛选 -->
    <div :class="['filter-container', { sticky: isSticky }]">
      <a-tabs v-model:active-key="selectedCategory" @change="doSearch">
        <a-tab-pane key="all" tab="全部" />
        <a-tab-pane v-for="category in categoryList" :tab="category" :key="category" />
      </a-tabs>
      <div class="tag-bar">
        <span style="margin-right: 8px">标签：</span>
        <a-space :size="[0, 8]" wrap>
          <a-checkable-tag
            v-for="(tag, index) in tagList"
            :key="tag"
            v-model:checked="selectedTagList[index]"
            @change="doSearch"
          >
            {{ tag }}
          </a-checkable-tag>
        </a-space>
      </div>
    </div>

    <!-- 占位元素 -->
    <div v-if="isSticky" class="sticky-placeholder"></div>

    <!-- 图片列表 -->
    <WaterfallPictureList
      :dataList="dataList"
      :loading="loading"
      :noMoreData="noMoreData"
      @intersect="loadMore"
      @click-picture="doClickPicture"
    />

    <!-- 首次加载骨架屏 -->
    <div v-if="initialLoading" class="initial-loading">
      <a-skeleton active :paragraph="{ rows: 8 }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, onBeforeUnmount } from 'vue'
import {
  listPictureTagCategoryUsingGet,
  listPictureVoByPageUsingPost,
} from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { SearchOutlined } from '@ant-design/icons-vue'
import WaterfallPictureList from '@/components/WaterfallPictureList.vue'

// 数据列表
const dataList = ref<API.PictureVO[]>([])
const loading = ref(false)
const initialLoading = ref(true) // 首次加载状态
const noMoreData = ref(false)
const isSticky = ref(false)

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 15,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 标签和分类列表
const categoryList = ref<string[]>([])
const selectedCategory = ref<string>('all')
const tagList = ref<string[]>([])
const selectedTagList = ref<boolean[]>([])

// 获取数据
const fetchData = async () => {
  if (loading.value || noMoreData.value) return

  loading.value = true

  // 转换搜索参数
  const params = {
    ...searchParams,
    tags: [] as string[],
  }
  if (selectedCategory.value !== 'all') {
    params.category = selectedCategory.value
  }
  // 处理选中的标签
  selectedTagList.value.forEach((useTag, index) => {
    if (useTag) {
      params.tags.push(tagList.value[index])
    }
  })

  try {
    const res = await listPictureVoByPageUsingPost(params)
    if (res.data.code === 0 && res.data.data) {
      const newData = res.data.data.records ?? []
      if (newData.length === 0) {
        noMoreData.value = searchParams.current > 1 // 不是第一页才显示没有更多
      } else {
        dataList.value =
          searchParams.current === 1
            ? newData
            : [...dataList.value, ...newData]
        searchParams.current++
      }
    } else {
      message.error('获取数据失败，' + res.data.message)
    }
  } catch (error) {
    message.error('请求失败')
  } finally {
    loading.value = false
    initialLoading.value = false
  }
}

// 滚动事件处理
const checkSticky = () => {
  isSticky.value = window.scrollY > 100
}

// 加载更多
const loadMore = () => {
  if (!loading.value && !noMoreData.value) {
    fetchData()
  }
}

// 搜索方法
const doSearch = () => {
  searchParams.current = 1
  noMoreData.value = false
  fetchData()
}

// 获取标签和分类选项
const getTagCategoryOptions = async () => {
  try {
    const res = await listPictureTagCategoryUsingGet()
    if (res.data.code === 0 && res.data.data) {
      tagList.value = res.data.data.tagList ?? []
      categoryList.value = res.data.data.categoryList ?? []
      selectedTagList.value = new Array(tagList.value.length).fill(false)
    } else {
      message.error('获取标签分类列表失败，' + res.data.message)
    }
  } catch (error) {
    message.error('获取标签分类失败')
  }
}

const router = useRouter()
// 跳转至图片详情页
const doClickPicture = (picture: API.PictureVO) => {
  router.push({
    path: `/picture/${picture.id}`,
  })
}

onMounted(() => {
  getTagCategoryOptions()
  fetchData()
  window.addEventListener('scroll', checkSticky)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', checkSticky)
})
</script>

<style scoped>
#homePage {
  margin-bottom: 16px;
}

.search-bar {
  max-width: 480px;
  margin: 0 auto 16px;
  padding: 0 12px;
}

.filter-container {
  background: white;
  transition: all 0.3s ease;
  padding: 0 20px;
  z-index: 10;
}

.filter-container.sticky {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(5px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.sticky-placeholder {
  height: calc(50px + 46px + 48px);
}

.tag-bar {
  margin-bottom: 16px;
  padding: 0 8px;
}

.initial-loading {
  padding: 24px;
  background: white;
  border-radius: 8px;
  margin: 16px;
}

@media (max-width: 768px) {
  .search-bar {
    padding: 0 8px;
  }

  .filter-container {
    padding: 0 12px;
  }

  .tag-bar {
    padding: 0;
  }
}
</style>
