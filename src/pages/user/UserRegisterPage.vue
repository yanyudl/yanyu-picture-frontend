<template>
  <div id="userLoginPage">
    <h2 class="title">云视觉 - 用户注册</h2>
    <div class="desc">企业级智能协同云图库</div>
    <a-form :model="formState" name="basic" autocomplete="off" @finish="handleSubmit">
      <!-- 邮箱输入 -->
      <a-form-item
        name="email"
        :rules="[
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入正确的邮箱格式' },
        ]"
      >
        <a-input
          v-model:value="formState.email"
          placeholder="请输入邮箱"
          size="middle"
          :prefix="h(MailOutlined)"
          class="custom-input"
        />
      </a-form-item>

      <!-- 邮箱验证码 -->
      <a-form-item name="code" :rules="[{ required: true, message: '请输入验证码' }]">
        <div class="verify-code-container">
          <a-input
            v-model:value="formState.code"
            placeholder="请输入邮箱验证码"
            size="middle"
            :prefix="h(SafetyCertificateOutlined)"
            class="custom-input verify-input"
          />
          <a-button
            type="primary"
            class="send-code-btn"
            :disabled="!!countdown || !formState.email"
            @click="sendEmailCode"
            size="middle"
          >
            {{ countdown ? `${countdown}s后重试` : '获取验证码' }}
          </a-button>
        </div>
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

      <!-- 确认密码 -->
      <a-form-item
        name="checkPassword"
        :rules="[{ required: true, message: '请确认密码' }, { validator: validatePassword }]"
      >
        <a-input-password
          v-model:value="formState.checkPassword"
          placeholder="请确认密码"
          size="middle"
          :prefix="h(CheckOutlined)"
          class="custom-input"
        />
      </a-form-item>
      <div class="tips">
        已有账号？
        <RouterLink to="/user/login">去登录</RouterLink>
      </div>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%" size="middle"
          >注册</a-button
        >
      </a-form-item>
    </a-form>
  </div>
</template>
<script lang="ts" setup>
import { h, onBeforeUnmount, reactive, ref } from 'vue'
import { mailUsingPost, userRegisterUsingPost } from '@/api/userController.ts'
import {
  CheckOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  LockOutlined,
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import router from '@/router' // 用于接受表单输入的值

// 表单数据
const formState = reactive<API.UserRegisterRequest>({
  email: '',
  userPassword: '',
  checkPassword: '',
  code: '',
})

// 倒计时
const countdown = ref<number>(0)
let timer: NodeJS.Timeout | null = null

// 发送邮箱验证码
const sendEmailCode = async () => {
  try {
    const res = await mailUsingPost({
      email: formState.email,
      type: 'register',
    })
    if (res.data.code === 0) {
      message.success(res.data.data || '验证码发送成功') // 有备用文本
    } else {
      message.error(res.data.message || '验证码发送失败：')
    }
    countdown.value = 60
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer!)
        timer = null
      }
    }, 1000)
  } catch (error: any) {
    message.error('验证码发送失败：' + error.message)
  }
}

// 验证两次密码是否一致
const validatePassword = async (_rule: any, value: string) => {
  if (value !== formState.userPassword) {
    return Promise.reject('两次输入的密码不一致')
  }
  return Promise.resolve()
}

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  //校验两次输入的密码是否一致
  if (values.userPassword !== values.checkPassword) {
    message.error('两次输入的密码不一致！')
    return
  }
  const res = await userRegisterUsingPost(values)
  //注册成功，跳转到登录页
  if (res.data.code === 0 && res.data.data) {
    message.success('注册成功')
    router.push({
      path: '/user/login',
      replace: true,
    })
  } else {
    message.error('注册失败，' + res.data.message)
  }
}

// 组件卸载时清除定时器
onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
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

/* 发送验证码按钮样式 */
.send-code-btn {
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
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
