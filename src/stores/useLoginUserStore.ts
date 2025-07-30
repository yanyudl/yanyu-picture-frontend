import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getUserLoginUsingGet } from '@/api/userController.ts'

/*
 * 存储用户登录信息的状态
 * */
export const useLoginUserStore = defineStore('loginUser', () => {
  const loginUser = ref<API.LoginUserVO>({
    userName: '未登录'
  })

  /*
   * 远程获取用户登录信息
   * */
  async function fetchLoginUser() {
    if (loginUser.value.userAccount) return; // 防止重复请求
    const res = await getUserLoginUsingGet();
    if(res.data.code === 0 && res.data.data){
      loginUser.value = res.data.data
    }
  }
  /*
   * 设置登录用户
   * @param newLoginUser
   * */
    function setLoginUser(newLoginUser: any) {
      loginUser.value = newLoginUser
    }

    return { loginUser, setLoginUser, fetchLoginUser }
  }

)
