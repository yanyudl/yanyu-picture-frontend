<template>
  <div id="userLoginPage">
    <h2 class="title">云视觉 - 用户登录</h2>
    <div class="desc">企业级智能协同云图库</div>
    <a-form :model="formState" name="basic" autocomplete="off" @finish="handleSubmit">
      <!-- 账号输入 -->
      <a-form-item
        name="userAccountOrEmail"
        :rules="[{ required: true, message: '请输入账号或邮箱' }]"
      >
        <a-input
          v-model:value="formState.userAccountOrEmail"
          placeholder="请输入账号或邮箱"
          size="middle"
          :prefix="h(UserOutlined)"
          class="custom-input"
        />
      </a-form-item>
      <!-- 密码输入 -->
      <a-form-item
        name="userPassword"
        :rules="[
            { required: true, message: '请输入密码' },
            { min: 8, message: '密码长度不能小于 8 位' },
          ]"
      >
        <a-input-password
          v-model:value="formState.userPassword"
          placeholder="请输入密码"
          size="middle"
          :prefix="h(LockOutlined)"
          class="custom-input"
        />
      </a-form-item>

      <!-- 验证码 -->
      <a-form-item
        name="verifyCode"
        :rules="[
            { required: true, message: '请输入验证码' },
            { min: 4, message: '验证码长度为 4 位' },
          ]"
      >
        <div class="verify-code-container">
          <a-input
            v-model:value="formState.verifyCode"
            placeholder="请输入验证码"
            size="middle"
            :prefix="h(SafetyCertificateOutlined)"
            class="custom-input verify-input"
          />
          <div class="code-image" @click="getVerifyCode">
            <img :src="verifyCodeImg" alt="验证码" />
          </div>
        </div>
      </a-form-item>
      <div class="tips" style="display: flex; justify-content: center; align-items: center; gap: 12px;">
        没有账号？
        <RouterLink to="/user/register">立即注册</RouterLink>
        <span class="divider">|</span>
        <RouterLink to="/user/reset_password" class="link-text">忘记密码</RouterLink>
      </div>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%" size="middle">登录</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
import { h, onMounted, reactive, ref } from 'vue'
import { generateCaptchaUsingGet, userLoginUsingPost } from '@/api/userController.ts'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { message } from 'ant-design-vue'
import router from '@/router'
import {
  LockOutlined,
  SafetyCertificateOutlined,
  UserOutlined
} from '@ant-design/icons-vue'

// 用于接受表单输入的值
const formState = reactive<API.UserLoginRequest>({
  userAccountOrEmail: '',
  userPassword: '',
  serververifycode: '',
  verifyCode: '',
})

// 获取验证码图片
const verifyCodeImg = ref<string>('')
const loginUserStore = useLoginUserStore()

/**
 * 得到验证码
 */
const getVerifyCode = async () => {
  const res = await generateCaptchaUsingGet()
  if (res.data.code === 0 && res.data.data) {
    verifyCodeImg.value = res.data.data.base64Captcha
    formState.serververifycode = res.data.data.captchaId
  }
}

onMounted(() => {
  getVerifyCode()
})

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  values.serververifycode = formState.serververifycode
  const res = await userLoginUsingPost(values)
  // 登录成功，把登录态保存到全局状态中
  if (res.data.code === 0 && res.data.data) {
    await loginUserStore.fetchLoginUser()
    message.success('登录成功')
    router.push({
      path: '/',
      replace: true,
    })
  } else {
    message.error('登录失败，' + res.data.message)
    // 重新获取验证码
    getVerifyCode()
  }
}
</script>

<style scoped>
#userLoginPage {
  padding-top: 30px;
  max-width: 320px;
  margin: 0 auto;
}

.title {
  text-align: center;
  margin-bottom: 12px;
  font-size: 20px;
}

.desc {
  text-align: center;
  color: #bbb;
  margin-bottom: 20px;
  font-size: 12px;
}

.tips {
  color: #bbb;
  text-align: right;
  font-size: 12px;
  margin-bottom: 12px;
}

/* 验证码容器样式 */
.verify-code-container {
  display: flex;
  gap: 8px;
}

/* 验证码输入框样式 */
.verify-input {
  flex: 1;
}

/* 验证码图片样式 */
.code-image {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.code-image img {
  height: 32px;
}

.custom-input {
  font-size: 16px;
}

.custom-input :deep(.ant-input) {
  font-size: 14px;
}

.custom-input :deep(.ant-input-password) {
  font-size: 14px;
}
</style>
