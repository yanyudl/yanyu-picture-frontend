<template>
  <a-layout class="profile-layout">
    <!-- 头部信息 -->
    <a-card class="profile-header">
      <div class="header-content">
        <a-avatar :size="100" :src="loginUser.userAvatar || defaultAvatar" />
        <div class="user-info">
          <h2>{{ loginUser.userName || '未命名用户' }}</h2>
          <p class="user-desc">{{ loginUser.userProfile || '暂无个人简介' }}</p>
          <div class="user-tags">
            <a-tag :color="loginUser.userRole === 'admin' ? 'red' : 'blue'">
              {{ loginUser.userRole === 'admin' ? '管理员' : '普通用户' }}
            </a-tag>
          </div>
        </div>
        <div class="actions">
          <a-space direction="vertical">
            <a-button class="edit-btn" @click="showEditModal">
              <template #icon><EditOutlined /></template>
              编辑资料
              <RightOutlined class="arrow-icon" />
            </a-button>
            <a-button class="password-btn" @click="showChangePasswordModal">
              <template #icon><LockOutlined /></template>
              修改密码
              <RightOutlined class="arrow-icon" />
            </a-button>
            <a-button class="email-btn" @click="showChangeEmailModal">
              <template #icon><MailOutlined /></template>
              修改邮箱
              <RightOutlined class="arrow-icon" />
            </a-button>
          </a-space>
        </div>
      </div>
    </a-card>

    <!-- 个人资料 -->
    <a-card class="profile-body">
      <h3>基本信息</h3>
      <a-descriptions bordered :column="1">
        <a-descriptions-item label="ID" :labelStyle="{ width: '200px' }">
          {{ loginUser.id }}
        </a-descriptions-item>
        <a-descriptions-item label="账号">
          {{ loginUser.userAccount || '暂无' }}
        </a-descriptions-item>
        <a-descriptions-item label="邮箱">
          {{ loginUser.email || '暂无' }}
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">
          {{ formatDate(loginUser.createTime) }}
        </a-descriptions-item>
      </a-descriptions>
    </a-card>

    <!-- 编辑用户信息的弹窗 -->
    <a-modal
      v-model:open="editModalVisible"
      title="修改用户信息"
      width="600px"
      :footer="null"
      @cancel="handleCancel"
    >
      <a-form ref="editFormRef" :model="formData" :rules="rules" layout="vertical">
        <!-- 用户昵称 -->
        <a-form-item label="昵称" name="userName">
          <a-input v-model:value="formData.userName" placeholder="请输入昵称" />
        </a-form-item>

        <!-- 头像上传 -->
        <a-form-item label="头像">
          <a-upload
            list-type="picture-card"
            :show-upload-list="false"
            :before-upload="beforeUpload"
            :custom-request="handleUpload"
          >
            <img v-if="formData.userAvatar" :src="formData.userAvatar" alt="头像" class="avatar-preview" />
            <div v-else>
              <plus-outlined />
              <div v-if="!loading">点击上传</div>
              <div v-else>上传中...</div>
            </div>
          </a-upload>
        </a-form-item>

        <!-- 用户简介 -->
        <a-form-item label="简介" name="userProfile">
          <a-textarea v-model:value="formData.userProfile" placeholder="请输入个人简介" :rows="3" />
        </a-form-item>

        <!-- 操作按钮 -->
        <a-form-item>
          <div style="display: flex; justify-content: flex-end">
          <a-button type="primary" @click="submitForm">提交修改</a-button>
          <a-button style="margin-left: 10px" @click="handleCancel">取消</a-button>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 修改密码弹窗 -->
    <a-modal
      v-model:open="changePasswordModalVisible"
      title="修改密码"
      width="500px"
      :footer="null"
      @cancel="handlePasswordCancel"
    >
      <a-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" layout="vertical">
        <a-form-item label="当前密码" name="currentPassword">
          <a-input-password v-model:value="passwordForm.currentPassword" placeholder="请输入当前密码" />
        </a-form-item>
        <a-form-item label="新密码" name="newPassword">
          <a-input-password v-model:value="passwordForm.newPassword" placeholder="请输入新密码" />
        </a-form-item>
        <a-form-item label="确认新密码" name="confirmPassword">
          <a-input-password v-model:value="passwordForm.confirmPassword" placeholder="请再次输入新密码" />
        </a-form-item>
        <div class="login-link">
          忘记密码？
          <RouterLink to="/user/reset_password" class="link-text">点击此处重置</RouterLink>
        </div>
        <a-form-item>
          <div style="display: flex; justify-content: flex-end">
          <a-button type="primary" @click="submitPasswordForm" :loading="passwordLoading">确认修改</a-button>
          <a-button style="margin-left: 10px" @click="handlePasswordCancel">取消</a-button>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 修改邮箱弹窗 -->
    <a-modal
      v-model:open="changeEmailModalVisible"
      title="修改邮箱"
      width="500px"
      :footer="null"
      @cancel="handleEmailCancel"
    >
      <a-form ref="emailFormRef" :model="emailForm" :rules="emailRules" layout="vertical">
        <a-form-item label="新邮箱地址" name="newEmail">
          <a-input v-model:value="emailForm.newEmail" placeholder="请输入新的邮箱地址" />
        </a-form-item>
        <a-form-item label="验证码" name="verificationCode">
          <div class="verification-code-input">
            <a-input v-model:value="emailForm.verificationCode" placeholder="请输入验证码" />
            <a-button
              type="primary"
              style="margin-left: 10px"
              @click="sendVerificationCode"
              :disabled="codeCountdown > 0"
            >
              {{ codeCountdown > 0 ? `${codeCountdown}秒后重试` : '获取验证码' }}
            </a-button>
          </div>
        </a-form-item>
        <a-form-item>
          <div style="display: flex; justify-content: flex-end">
          <a-button type="primary" @click="submitEmailForm" :loading="emailLoading">确认修改</a-button>
          <a-button style="margin-left: 10px" @click="handleEmailCancel">取消</a-button>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>
  </a-layout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'
import { PlusOutlined, EditOutlined, LockOutlined, MailOutlined,RightOutlined } from '@ant-design/icons-vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore.js'
import {
  changeEmailUsingPost,
  changePasswordUsingPost,
  editUserUsingPost, logoutUsingPost, mailUsingPost, uploadUserAvatarUsingPost
} from '@/api/userController.ts'
import { uploadPictureUsingPost } from '@/api/pictureController.js'

// 默认头像
const defaultAvatar = 'https://img0.baidu.com/it/u=1425690889,1183019716&fm=253&fmt=auto&app=138&f=JPEG?w=440&h=455'

// 获取 Pinia 用户数据
const loginUserStore = useLoginUserStore()
const loginUser = computed(() => loginUserStore.loginUser)

const { fetchLoginUser } = loginUserStore

// 弹窗控制
const editModalVisible = ref(false)
const changePasswordModalVisible = ref(false)
const changeEmailModalVisible = ref(false)
const loading = ref(false)
const passwordLoading = ref(false)
const emailLoading = ref(false)
const codeCountdown = ref(0)

// 表单数据
const formData = ref({
  id: null,
  userName: '',
  userAvatar: '',
  userProfile: '',
})

// 密码表单数据
const passwordForm = ref({
  id: null,
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// 邮箱表单数据
const emailForm = ref({
  newEmail: '',
  verificationCode: '',
})

// 表单校验规则
const rules = {
  userName: [{ required: true, message: '昵称不能为空', trigger: 'blur' }]
}

// 密码校验规则
const passwordRules = {
  currentPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, message: '密码长度至少8位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (_, value) => {
        if (value !== passwordForm.value.newPassword) {
          return Promise.reject('两次输入的密码不一致')
        }
        return Promise.resolve()
      },
      trigger: 'blur'
    }
  ],
}

// 邮箱校验规则
const emailRules = {
  newEmail: [
    { required: true, message: '请输入新邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  verificationCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度为6位', trigger: 'blur' }
  ]
}

// 显示编辑弹窗
const showEditModal = () => {
  formData.value = {
    id: loginUserStore.loginUser.id,
    userName: loginUserStore.loginUser.userName,
    userAvatar: loginUserStore.loginUser.userAvatar || '',
    userProfile: loginUserStore.loginUser.userProfile || '',
  }
  editModalVisible.value = true
}

// 显示修改密码弹窗
const showChangePasswordModal = () => {
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  }
  changePasswordModalVisible.value = true
}

// 显示修改邮箱弹窗
const showChangeEmailModal = () => {
  emailForm.value = {
    newEmail: '',
    verificationCode: '',
  }
  changeEmailModalVisible.value = true
}

// 上传头像
const handleUpload = async ({ file }) => {
  loading.value = true
  try {
    const res = await uploadUserAvatarUsingPost({}, file)

    if (res.data.code === 0 && res.data.data) {
      message.success('头像上传成功')
      formData.value.userAvatar = res.data.data // 使用服务器返回的图片 URL
    } else {
      message.error('图片上传失败，' + res.data.message)
    }
  } catch (error) {
    console.error('图片上传失败', error)
    message.error('图片上传失败，请重试')
  }
  loading.value = false
}

// 上传前校验格式 & 限制大小
const beforeUpload = (file) => {
  const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
  if (!isValidType) {
    message.error('不支持上传该格式的图片，推荐 jpg 或 png 或 webp')
    return false
  }

  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('不能上传超过 2M 的图片')
    return false
  }
  return true
}

// 提交表单
const submitForm = async () => {
  try {
    const response = await editUserUsingPost({
      id: formData.value.id,
      userName: formData.value.userName,
      userAvatar: formData.value.userAvatar,
      userProfile: formData.value.userProfile
    })

    if (response.data.code === 0) {
      message.success('用户信息修改成功')

      // 更新 Pinia 状态，确保前端同步更新昵称
      loginUserStore.setLoginUser({
        ...loginUser.value,
        userName: formData.value.userName,
        userAvatar: formData.value.userAvatar,
        userProfile: formData.value.userProfile
      })

      // 关闭弹窗
      editModalVisible.value = false
    } else {
      throw new Error(response.data.message)
    }
  } catch (error) {
    message.error('修改失败，请重试')
  }
}

// 提交密码修改表单
const submitPasswordForm = async () => {
  passwordLoading.value = true
  try {
    // 这里调用修改密码的API
    const res = await changePasswordUsingPost({
      id: loginUserStore.loginUser.id,
      oldPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
      checkPassword: passwordForm.value.confirmPassword
    })
    if (res.data.code === 0) {
      message.success('密码修改成功，请重新登录')
      changePasswordModalVisible.value = false
      setTimeout(async () => {
        try {
          // 退出登录
          await logoutUsingPost();
          // 跳到登录页
          window.location.href = '/user/login'
        } catch (error) {
          message.error('退出登录失败: ' + (error.message || '未知错误'))
        }
      }, 1000)
    }else {
      message.error(res.data.message)
    }
  } catch (error) {
    message.error(error.message || '密码修改失败')
  } finally {
    passwordLoading.value = false
  }
}

// 发送验证码
const sendVerificationCode = async () => {
  if (!emailForm.value.newEmail) {
    message.warning('请输入邮箱地址')
    return
  }

  try {
    // 这里调用发送验证码的API
    const res = await mailUsingPost({
      email: emailForm.value.newEmail,
      type: 'change_email',
    })
    if (res.data.code === 0) {
      message.success(res.data.data || '验证码发送成功')  // 有备用文本
    }else {
      message.error(res.data.message || '验证码发送失败：')
    }
    codeCountdown.value = 60
    const timer = setInterval(() => {
      codeCountdown.value--
      if (codeCountdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    message.error(error.message || '验证码发送失败')
  }
}

// 提交邮箱修改表单
const submitEmailForm = async () => {
  emailLoading.value = true
  try {
    // 这里调用修改邮箱的API
    const res = await changeEmailUsingPost({
      id: loginUserStore.loginUser.id,
      newEmail: emailForm.value.newEmail,
      verificationCode: emailForm.value.verificationCode,
      }
    )
    if (res.data.code === 0) {
      message.success('邮箱修改成功')
      // 更新 Pinia 中的邮箱信息
      loginUserStore.setLoginUser({
        ...loginUser.value,
        email: emailForm.value.newEmail
      })
      changeEmailModalVisible.value = false
    }else {
      message.error(res.data.message)
    }
  } catch (error) {
    message.error(error.message || '邮箱修改失败')
  } finally {
    emailLoading.value = false
  }
}

// 取消编辑
const handleCancel = () => {
  editModalVisible.value = false
}

// 取消密码修改
const handlePasswordCancel = () => {
  changePasswordModalVisible.value = false
}

// 取消邮箱修改
const handleEmailCancel = () => {
  changeEmailModalVisible.value = false
}

// 格式化日期
const formatDate = (date) => {
  return date ? dayjs(date).format('YYYY-MM-DD') : '暂无'
}

// 页面加载时自动获取用户信息
onMounted(() => {
  fetchLoginUser()
})

</script>

<style scoped>
.profile-layout {
  padding: 20px;
  background: #f0f2f5;
  max-width: 900px;
  margin: auto;
}

.profile-header {
  background: linear-gradient(to right, #70c1ff, #0084ff);
  color: white;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info h2 {
  margin: 0;
  color: white;
}

.user-desc {
  margin: 5px 0 0;
  color: rgba(255, 255, 255, 0.8);
}

.user-tags {
  margin-top: 10px;
}

.actions {
  margin-left: auto;
}

.profile-body {
  margin-top: 20px;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}

.verification-code-input {
  display: flex;
  align-items: center;
}

.actions {
  margin-left: auto;
}

.actions .ant-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 6px;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.edit-btn {
  background-color: #e6f7ff;
  color: #1890ff;
}

.password-btn {
  background-color: #e6f7ff;
  color: #1890ff;
}

.email-btn {
  background-color: #e6f7ff;
  color: #1890ff;
}

.actions .ant-btn .anticon {
  margin-right: 8px;
}

.arrow-icon {
  color: #8c8c8c;
  margin-left: 12px;
  font-size: 12px;
}

.login-link {
  text-align: center; /* 文字居中 */
  margin: 16px 0; /* 上下留出间距 */
  color: rgba(0, 0, 0, 0.45); /* 浅灰色文字 */
}

.login-link .link-text {
  color: #1890ff; /* 链接颜色 */
  margin-left: 4px; /* 与文字间距 */
}
</style>
