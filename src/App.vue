<template>
  <div id="app">
    <BasicLayout />
  </div>
</template>

<script setup lang="ts">
import BasicLayout from '@/layouts/BasicLayout.vue'
import { healthUsingGet } from '@/api/mainController'
// import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
//
// const loginUser = useLoginUserStore()
// loginUser.fetchLoginUser()

healthUsingGet().then((res) => {
  console.log(res)
})

</script>

<style scoped></style>
