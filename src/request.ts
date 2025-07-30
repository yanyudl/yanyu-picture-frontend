import axios from 'axios'
import { message } from 'ant-design-vue'

// 区分开发和生产环境
const DEV_BASE_URL = "http://localhost:8123";
const PROD_BASE_URL = "https://picture.yan-yu.icu";
// 创建 Axios 实例
const myAxios = axios.create({
  baseURL: DEV_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

// Add a request interceptor
myAxios.interceptors.request.use(function (config) {
  // Do something before request is sent
  return config;
}, function (error) {
  // Do something with request error
  return Promise.reject(error);
});


// Add a response interceptor
myAxios.interceptors.response.use(function (response) {
  const { data } = response;
  if(data.code === 40100){
    //不是获取用户信息的请求，并且用户不在登录页，则跳转到登录页
    if (!response.request.responseURL.includes('user/get/login') &&
      !window.location.pathname.includes('user/login') ) {
      message.warning("请先登录")
      window.location.href = `/user/login?redirect=${window.location.href}`;
    }
  }
  //处理服务器异常
  if (data.code === 50000){
    message.error("服务器异常，请稍后再试")
  }
  // Any status code that lie within the range of 2xx cause this function to trigger
  // Do something with response data
  return response;
}, function (error) {
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  // Do something with response error
  return Promise.reject(error);
});
export default myAxios;
