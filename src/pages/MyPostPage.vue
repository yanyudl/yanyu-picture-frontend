<template>
  <div id="MyPicturesPage">
    <!-- 搜索区域 -->
    <div class="search-and-button-container">
      <a-form layout="inline" :model="searchParams" @finish="doSearch">
        <a-form-item label="关键词" name="searchText">
          <a-input
            v-model:value="searchParams.searchText"
            placeholder="从名称和简介搜索"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="类型" name="category">
          <a-input v-model:value="searchParams.category" placeholder="请输入类型" allow-clear />
        </a-form-item>
        <a-form-item label="标签" name="tags">
          <a-select
            v-model:value="searchParams.tags"
            mode="tags"
            placeholder="请输入标签"
            style="min-width: 180px"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="审核状态" name="reviewStatus">
          <a-select
            v-model:value="searchParams.reviewStatus"
            :options="PIC_REVIEW_STATUS_OPTIONS"
            placeholder="请输入审核状态"
            style="min-width: 180px"
            allow-clear
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit">
            <SearchOutlined />
            搜索
          </a-button>
        </a-form-item>
      </a-form>
    </div>

    <!-- 图片列表 -->
    <MyPostPictureList
      :dataList="dataList"
      :loading="loading"
      :showOp="true"
      :onReload="fetchData"
      :canEdit="true"
      :canDelete="true"
      :isMyPosts="true"
    />

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <a-pagination
        v-model:current="searchParams.current"
        v-model:pageSize="searchParams.pageSize"
        :page-size-options="['5', '10', '15', '20']"
        :total="total"
        :show-total="(total) => `共 ${total} 张`"
        @change="onPageChange"
        show-size-changer
        show-quick-jumper
        class="custom-pagination"
      >
        <template #buildOptionText="props">
          <span>{{ props.value }}张/页</span>
        </template>
      </a-pagination>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { listPictureVoPortByPageUsingPost } from '@/api/pictureController'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { SearchOutlined } from '@ant-design/icons-vue'
import { PIC_REVIEW_STATUS_OPTIONS } from '@/constants/picture'
import MyPostPictureList from '@/components/MyPostPictureList.vue'

const loginUserStore = useLoginUserStore()

// 数据列表
const dataList = ref<any[]>([])
const total = ref<number>(0)
const loading = ref<boolean>(false)

const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'descend',
  userId: loginUserStore.loginUser.id,
})

const fetchData = async () => {
  const res = await listPictureVoPortByPageUsingPost({
    ...searchParams,
    nullSpaceId: true,
  })
  if (res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
}

// 分页变化
const onPageChange = (page: number, pageSize: number) => {
  searchParams.current = page
  searchParams.pageSize = pageSize
  fetchData()
}

// 搜索
const doSearch = () => {
  searchParams.current = 1
  fetchData()
}

// 页面加载时获取数据
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
#MyPicturesPage {
  margin-bottom: 16px;
}

.search-and-button-container {
  margin-bottom: 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.pagination-wrapper {
  margin-top: 8px;
  padding: 16px 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: flex-end;
}

@media screen and (max-width: 768px) {
  .search-and-button-container {
    padding: 12px;
    border-radius: 0;
    margin: 0 -12px 16px;
  }

  .pagination-wrapper {
    margin: 8px -12px 0;
    padding: 12px;
    border-radius: 0;
  }
}
</style>
