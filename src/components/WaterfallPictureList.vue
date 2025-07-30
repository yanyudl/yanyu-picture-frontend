<template>
  <div class="waterfall-container">
    <!-- 瀑布流布局 -->
    <div class="waterfall-columns">
      <div v-for="(column, columnIndex) in columns" :key="columnIndex" class="waterfall-column">
        <div
          v-for="picture in column"
          :key="picture.id"
          class="waterfall-item"
          @click="doClickPicture(picture)"
        >
          <div class="image-container">
            <img
              :src="picture.thumbnailUrl || picture.url"
              :alt="picture.name"
              loading="lazy"
              @load="handleImageLoad"
              @error="handleImageError(picture)"
            />
          </div>
<!--          || getDefaultAvatar(picture.user?.userName)-->
          <div class="picture-info">
            <div class="picture-user">
              <a-avatar class="user-avatar" :src="picture.userVO?.userAvatar "/>
              <span>{{ picture.userVO?.userName }}</span>
            </div>
            <div class="picture-title">{{ picture.name }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-wrapper">
      <a-spin size="large" />
    </div>

    <!-- 新增：没有更多内容的提示 -->
    <div v-if="noMoreData" class="no-more-wrapper">
      <div class="no-more-content">
        <span>没有更多图片了</span>
      </div>
    </div>

    <!-- 仅在还有数据时显示观察元素 -->
    <div v-if="!noMoreData" ref="bottomObserver" class="observer-element"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

interface Props {
  dataList?: API.PictureVO[]
  loading?: boolean
  noMoreData?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  dataList: () => [],
  loading: false,
  noMoreData: false // 默认不显示
})

const router = useRouter()
const bottomObserver = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null
const emit = defineEmits(['intersect'])

// 初始化 Intersection Observer
const initObserver = () => {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        emit('intersect')
      }
    },
    {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    }
  )

  if (bottomObserver.value) {
    observer.observe(bottomObserver.value)
  }
}

// 计算列数（响应式）
const columnCount = ref(6)
const updateColumnCount = () => {
  const width = window.innerWidth
  if (width > 1920) columnCount.value = 7
  else if (width > 1600) columnCount.value = 6
  else if (width > 1200) columnCount.value = 5
  else if (width > 900) columnCount.value = 4
  else if (width > 600) columnCount.value = 3
  else columnCount.value = 2
}

// 瀑布流列数据
const columns = computed(() => {
  const cols = Array.from({ length: columnCount.value }, () => [])
  props.dataList.forEach((item, index) => {
    cols[index % columnCount.value].push(item)
  })
  return cols
})

// 图片加载处理
const handleImageLoad = (event) => {
  const img = event.target
  img.style.opacity = 1
}

const handleImageError = (picture) => {
  const img = event.target
  if (picture.url && img.src !== picture.url) {
    img.src = picture.url
  }
}

// 跳转至图片详情
const doClickPicture = (picture) => {
  router.push({
    path: `/picture/${picture.id}`,
  })
}

// 响应式调整
onMounted(() => {
  updateColumnCount()
  window.addEventListener('resize', updateColumnCount)
  initObserver()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateColumnCount)
  if (observer) {
    observer.disconnect()
  }
})
</script>

<style scoped>
.waterfall-container {
  width: 100%;
  padding: 0 12px;
}

.waterfall-columns {
  display: flex;
  gap: 16px;
}

.waterfall-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.waterfall-item {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.waterfall-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.image-container {
  width: 100%;
  position: relative;
  overflow: hidden;
  background: #f5f5f5;
}

.image-container img {
  width: 100%;
  height: auto;
  display: block;
  opacity: 0;
  transition: opacity 0.3s ease;
  object-fit: cover;
}

  .picture-info {
  padding: 12px;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.03) 0%,
    rgba(0, 0, 0, 0) 100%
  );
}
.picture-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.picture-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.category-tag {
  display: inline-block;
  padding: 2px 6px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}

.tag {
  display: inline-block;
  padding: 2px 6px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}

.loading-wrapper {
  display: flex;
  justify-content: center;
  padding: 24px 0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .waterfall-columns {
    gap: 12px;
  }

  .waterfall-item {
    border-radius: 6px;
  }

  .picture-info {
    padding: 12px;
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.03) 0%,
      rgba(0, 0, 0, 0) 100%
    );
  }
  .picture-title {
    font-size: 14px;
    color: #333;
    margin: 8px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .observer-element {
    height: 1px;
    width: 100%;
  }
}
/* 新增样式 */
.no-more-wrapper {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 14px;
  position: relative;
}

.no-more-content::before,
.no-more-content::after {
  content: "";
  display: inline-block;
  width: 60px;
  height: 1px;
  background: #eee;
  vertical-align: middle;
  margin: 0 16px;
}

.observer-element {
  height: 1px;
  width: 100%;
}

.picture-user {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
}

.picture-title {
  font-size: 14px;
  color: #333;
  margin: 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
